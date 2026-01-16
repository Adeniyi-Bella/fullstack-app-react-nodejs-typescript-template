import { injectable } from 'tsyringe';
import { container } from 'tsyringe';
import Order, { IOrder } from '@/models/order.model';
import { IOrderService } from './order.interface';
import { IProductService } from '@/services/product/product.interface';
import {
  OrderDTO,
  CreateOrderDTO,
  PaginatedResponse,
  OrderStatus,
} from '@/types';
import { logger } from '@/lib/winston';
import {
  DatabaseError,
  NotFoundError,
  BadRequestError,
  ForbiddenError,
  AppError,
} from '@/lib/api_response/error';
import { randomUUID } from 'crypto';
import mongoose from 'mongoose';

@injectable()
export class OrderService implements IOrderService {
  private mapToDTO(order: IOrder): OrderDTO {
    return {
      orderId: order.orderId,
      userId: order.userId,
      items: order.items,
      totalAmount: order.totalAmount,
      status: order.status,
      shippingAddress: order.shippingAddress,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }

  async createOrder(userId: string, data: CreateOrderDTO): Promise<OrderDTO> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const productService =
        container.resolve<IProductService>('IProductService');

      // Validate all products exist and have sufficient stock
      const orderItems = await Promise.all(
        data.items.map(async (item) => {
          const product = await productService.getProductById(item.productId);

          if (!product) {
            throw new NotFoundError(`Product ${item.productId} not found`);
          }

          if (product.stock < item.quantity) {
            throw new BadRequestError(
              `Insufficient stock for product ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`
            );
          }

          return {
            productId: product.productId,
            quantity: item.quantity,
            price: product.price,
          };
        })
      );

      // Calculate total amount
      const totalAmount = orderItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      // Create order
      const order = await Order.create(
        [
          {
            orderId: randomUUID(),
            userId,
            items: orderItems,
            totalAmount,
            status: OrderStatus.PENDING,
            shippingAddress: data.shippingAddress,
          },
        ],
        { session }
      );

      // Decrement stock for all products
      await Promise.all(
        orderItems.map((item) =>
          productService.decrementStock(item.productId, item.quantity)
        )
      );

      await session.commitTransaction();

      logger.info('Order created successfully', {
        orderId: order[0].orderId,
        userId,
        totalAmount,
      });

      return this.mapToDTO(order[0]);
    } catch (error) {
      await session.abortTransaction();
      logger.error('Error creating order', { userId, error });

      if (error instanceof NotFoundError || error instanceof BadRequestError) {
        throw error;
      }

      throw new DatabaseError('Failed to create order');
    } finally {
      session.endSession();
    }
  }

  async getOrderById(orderId: string): Promise<OrderDTO | null> {
    try {
      const order = await Order.findOne({ orderId })
        .select('-__v')
        .lean<OrderDTO>()
        .exec();

      if (!order) return null;

      return order;
    } catch (error) {
      logger.error('Error getting order', { orderId, error });
      throw new DatabaseError('Failed to retrieve order');
    }
  }

  async getUserOrders(
    userId: string,
    limit: number,
    offset: number
  ): Promise<PaginatedResponse<OrderDTO>> {
    try {
      const [orders, total] = await Promise.all([
        Order.find({ userId })
          .sort({ createdAt: -1 })
          .limit(limit)
          .skip(offset)
          .select('-__v')
          .lean<OrderDTO[]>()
          .exec(),
        Order.countDocuments({ userId }).exec(),
      ]);

      return {
        data: orders,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      };
    } catch (error) {
      logger.error('Error getting user orders', { userId, error });
      throw new DatabaseError('Failed to retrieve orders');
    }
  }

  async updateOrderStatus(
    orderId: string,
    status: OrderStatus
  ): Promise<OrderDTO | null> {
    try {
      const order = await Order.findOne({ orderId }).exec();

      if (!order) {
        throw new NotFoundError('Order not found');
      }

      const validTransitions: Record<OrderStatus, OrderStatus[]> = {
        [OrderStatus.PENDING]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
        [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
        [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED, OrderStatus.RETURNED],
        [OrderStatus.DELIVERED]: [OrderStatus.RETURNED],
        [OrderStatus.CANCELLED]: [],
        [OrderStatus.RETURNED]: [],
      };

      if (!validTransitions[order.status].includes(status)) {
        throw new BadRequestError(
          `Cannot transition from ${order.status} to ${status}`
        );
      }

      order.status = status;
      order.updatedAt = new Date();
      await order.save();

      logger.info('Order status updated', { orderId, status });

      return this.mapToDTO(order);
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof BadRequestError) {
        throw error;
      }
      logger.error('Error updating order status', { orderId, status, error });
      throw new DatabaseError('Failed to update order status');
    }
  }

  async cancelOrder(userId: string, orderId: string): Promise<boolean> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const order = await Order.findOne({ orderId, userId }).exec();

      if (!order) {
        throw new NotFoundError('Order not found or unauthorized');
      }

      if (order.status !== OrderStatus.PENDING) {
        throw new ForbiddenError(
          `Cannot cancel order with status: ${order.status}`
        );
      }

      // Restore product stock
      const productService =
        container.resolve<IProductService>('IProductService');

      for (const item of order.items) {
        const product = await productService.getProductById(item.productId);
        if (product) {
          await productService.updateProduct(product.userId, item.productId, {
            stock: product.stock + item.quantity,
          });
        }
      }

      order.status = OrderStatus.CANCELLED;
      order.updatedAt = new Date();
      await order.save({ session });

      await session.commitTransaction();

      logger.info('Order cancelled', { orderId, userId });

      return true;
    } catch (error) {
      await session.abortTransaction();

      if (error instanceof AppError) { 
        throw error;
      }

      console.error('CRITICAL TRANSACTION ERROR:', error); 

      logger.error('Error cancelling order', { orderId, userId, error });
      throw new DatabaseError('Failed to cancel order');
    } finally {
      session.endSession();
    }
  }
}
