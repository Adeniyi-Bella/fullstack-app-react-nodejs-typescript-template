import 'reflect-metadata';
import { OrderService } from '@/services/order/order.service';
import Order from '@/models/order.model';
import { OrderStatus } from '@/types';
import { container } from 'tsyringe';
import { BadRequestError, ForbiddenError, NotFoundError } from '@/lib/api_response/error';
import mongoose from 'mongoose';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';


vi.mock('@/models/order.model');
vi.mock('tsyringe', () => ({
  container: {
    resolve: vi.fn(),
  },
  injectable: () => (target: any) => target,
}));

// This preserves Schema, model, Document, etc., but overrides startSession
vi.mock('mongoose', async (importOriginal) => {
  const actual = await importOriginal<typeof import('mongoose')>();
  return {
    ...actual,
    default: {
      ...actual.default,
      startSession: vi.fn(),
    },
  };
});


describe('OrderService', () => {
  let orderService: OrderService;
  let mockSession: any;

  beforeEach(() => {
    orderService = new OrderService();
    
    mockSession = {
      startTransaction: vi.fn(),
      commitTransaction: vi.fn(),
      abortTransaction: vi.fn(),
      endSession: vi.fn(),
    };

    vi.mocked(mongoose.startSession).mockResolvedValue(mockSession);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('createOrder', () => {
    it('should create order successfully with valid products', async () => {
      const userId = 'user-123';
      const orderData = {
        items: [
          { productId: 'product-1', quantity: 2 },
          { productId: 'product-2', quantity: 1 },
        ],
        shippingAddress: '123 Test Street, Test City',
      };

      const mockProducts = [
        {
          productId: 'product-1',
          name: 'Product 1',
          price: 50,
          stock: 10,
        },
        {
          productId: 'product-2',
          name: 'Product 2',
          price: 100,
          stock: 5,
        },
      ];

      const mockProductService = {
        getProductById: vi.fn()
          .mockResolvedValueOnce(mockProducts[0])
          .mockResolvedValueOnce(mockProducts[1]),
        decrementStock: vi.fn().mockResolvedValue(true),
      };

      vi.mocked(container.resolve).mockReturnValue(mockProductService as any);

      const mockCreatedOrder = {
        orderId: 'order-123',
        userId,
        items: [
          { productId: 'product-1', quantity: 2, price: 50 },
          { productId: 'product-2', quantity: 1, price: 100 },
        ],
        totalAmount: 200,
        status: OrderStatus.PENDING,
        shippingAddress: orderData.shippingAddress,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(Order.create).mockResolvedValue([mockCreatedOrder] as any);

      const result = await orderService.createOrder(userId, orderData);

      expect(result.totalAmount).toBe(200);
      expect(result.items).toHaveLength(2);
      expect(mockSession.commitTransaction).toHaveBeenCalled();
      expect(mockProductService.decrementStock).toHaveBeenCalledTimes(2);
    });

    it('should throw NotFoundError when product does not exist', async () => {
      const userId = 'user-123';
      const orderData = {
        items: [{ productId: 'nonexistent', quantity: 1 }],
        shippingAddress: '123 Test Street',
      };

      const mockProductService = {
        getProductById: vi.fn().mockResolvedValue(null),
      };

      vi.mocked(container.resolve).mockReturnValue(mockProductService as any);

      await expect(
        orderService.createOrder(userId, orderData)
      ).rejects.toThrow(NotFoundError);

      expect(mockSession.abortTransaction).toHaveBeenCalled();
    });

    it('should throw BadRequestError when insufficient stock', async () => {
      const userId = 'user-123';
      const orderData = {
        items: [{ productId: 'product-1', quantity: 100 }],
        shippingAddress: '123 Test Street',
      };

      const mockProduct = {
        productId: 'product-1',
        name: 'Product 1',
        price: 50,
        stock: 5,
      };

      const mockProductService = {
        getProductById: vi.fn().mockResolvedValue(mockProduct),
      };

      vi.mocked(container.resolve).mockReturnValue(mockProductService as any);

      await expect(
        orderService.createOrder(userId, orderData)
      ).rejects.toThrow(BadRequestError);

      expect(mockSession.abortTransaction).toHaveBeenCalled();
    });
  });

  describe('getOrderById', () => {
    it('should return order when found', async () => {
      const mockOrder = {
        orderId: 'order-123',
        userId: 'user-123',
        items: [{ productId: 'product-1', quantity: 2, price: 50 }],
        totalAmount: 100,
        status: OrderStatus.PENDING,
        shippingAddress: '123 Test Street',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(Order.findOne).mockReturnValue({
        select: vi.fn().mockReturnValue({
          lean: vi.fn().mockReturnValue({
            exec: vi.fn().mockResolvedValue(mockOrder),
          }),
        }),
      } as any);

      const result = await orderService.getOrderById('order-123');

      expect(result).toMatchObject({
        orderId: 'order-123',
        totalAmount: 100,
      });
    });

    it('should return null when order not found', async () => {
      vi.mocked(Order.findOne).mockReturnValue({
        select: vi.fn().mockReturnValue({
          lean: vi.fn().mockReturnValue({
            exec: vi.fn().mockResolvedValue(null),
          }),
        }),
      } as any);

      const result = await orderService.getOrderById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('updateOrderStatus', () => {
    it('should update status for valid transition', async () => {
      const orderId = 'order-123';
      const newStatus = OrderStatus.PROCESSING;

      const mockOrder = {
        orderId,
        userId: 'user-123',
        items: [],
        totalAmount: 100,
        status: OrderStatus.PENDING,
        shippingAddress: '123 Test Street',
        save: vi.fn().mockResolvedValue(true),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(Order.findOne).mockReturnValue({
        exec: vi.fn().mockResolvedValue(mockOrder),
      } as any);

      const result = await orderService.updateOrderStatus(orderId, newStatus);

      expect(result?.status).toBe(OrderStatus.PROCESSING);
      expect(mockOrder.save).toHaveBeenCalled();
    });

    it('should throw BadRequestError for invalid transition', async () => {
      const orderId = 'order-123';
      const newStatus = OrderStatus.SHIPPED;

      const mockOrder = {
        orderId,
        status: OrderStatus.PENDING,
        save: vi.fn(),
      };

      vi.mocked(Order.findOne).mockReturnValue({
        exec: vi.fn().mockResolvedValue(mockOrder),
      } as any);

      await expect(
        orderService.updateOrderStatus(orderId, newStatus)
      ).rejects.toThrow(BadRequestError);
    });
  });

  describe('cancelOrder', () => {
    it('should cancel pending order and restore stock', async () => {
      const userId = 'user-123';
      const orderId = 'order-123';

      const mockOrder = {
        orderId,
        userId,
        status: OrderStatus.PENDING,
        items: [
          { productId: 'product-1', quantity: 2, price: 50 },
        ],
        save: vi.fn().mockResolvedValue(true),
      };

      vi.mocked(Order.findOne).mockReturnValue({
        exec: vi.fn().mockResolvedValue(mockOrder),
      } as any);

      const mockProductService = {
        getProductById: vi.fn().mockResolvedValue({
          productId: 'product-1',
          userId: 'seller-123',
          stock: 10,
        }),
        updateProduct: vi.fn().mockResolvedValue(true),
      };

      vi.mocked(container.resolve).mockReturnValue(mockProductService as any);

      const result = await orderService.cancelOrder(userId, orderId);

      expect(result).toBe(true);
      expect(mockOrder.save).toHaveBeenCalled();
      expect(mockProductService.updateProduct).toHaveBeenCalledWith(
        'seller-123',
        'product-1',
        { stock: 12 }
      );
      expect(mockSession.commitTransaction).toHaveBeenCalled();
    });

    it('should throw ForbiddenError when cancelling non-pending order', async () => {
      const userId = 'user-123';
      const orderId = 'order-123';

      const mockOrder = {
        orderId,
        userId,
        status: OrderStatus.SHIPPED,
        items: [],
      };

      vi.mocked(Order.findOne).mockReturnValue({
        exec: vi.fn().mockResolvedValue(mockOrder),
      } as any);

      await expect(
        orderService.cancelOrder(userId, orderId)
      ).rejects.toThrow(ForbiddenError);

      expect(mockSession.abortTransaction).toHaveBeenCalled();
    });
  });
});
