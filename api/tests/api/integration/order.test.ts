import 'reflect-metadata';
import Order, { IOrder } from '@/models/order.model';
import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '@/app';
import User from '@/models/user.model';
import Product from '@/models/product.model';
import { generateAccessToken } from '@/lib/jwt';
import { ApiErrorResponse, ApiSuccessResponse } from '@/types';

describe('Order API Integration Tests', () => {
  let authToken: string;
  let userId: string;
  let productId: string;
  let createdOrderId: string;

  beforeAll(async () => {

    await User.createCollection();
    await Product.createCollection();
    await Order.createCollection();

    // Create test user
    const testUser = await User.create({
      userId: 'test-order-user-123',
      email: 'order.test@example.com',
      username: 'ordertest',
      password: 'TestPassword123!',
    });

    userId = testUser.userId;

    authToken = generateAccessToken({
      userId: testUser.userId,
      email: testUser.email,
      username: testUser.username,
    });

    // Create test product
    const testProduct = await Product.create({
      productId: 'test-order-product-123',
      userId,
      name: 'Order Test Product',
      description: 'Product for order testing',
      price: 99.99,
      category: 'electronics',
      stock: 100,
      status: 'active',
    });

    productId = testProduct.productId;
  });

  beforeEach(async () => {
    await Order.deleteMany({ userId });
    await Product.updateOne({ productId }, { $set: { stock: 100 } });
  });

  describe('POST /api/v1/orders', () => {
    it('should create an order successfully', async () => {
      const response = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          items: [
            {
              productId,
              quantity: 2,
            },
          ],
          shippingAddress: '123 Test Street, Test City, TS 12345',
        });
        
      const body = response.body as ApiSuccessResponse<{ order: IOrder }>;

      expect(response.status).toBe(201);
      expect(body.status).toBe('success');
      expect(body.data?.order).toHaveProperty('orderId');
      expect(body.data?.order.totalAmount).toBe(199.98);
      expect(body.data?.order.items).toHaveLength(1);
      expect(body.data?.order.status).toBe('pending');
      if (body.data?.order) {
        createdOrderId = body.data.order.orderId;
      }

      const product = await Product.findOne({ productId });
      expect(product?.stock).toBe(98);
    });

    it('should return 400 for insufficient stock', async () => {
      const response = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          items: [
            {
              productId,
              quantity: 200,
            },
          ],
          shippingAddress: '123 Test Street, Test City, TS 12345',
        });

      const body = response.body as ApiErrorResponse;
      expect(response.status).toBe(400);
      expect(body.code).toBe('BAD_REQUEST');
    });

    it('should return 404 for non-existent product', async () => {
      const response = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          items: [
            {
              productId: 'nonexistent-product',
              quantity: 1,
            },
          ],
          shippingAddress: '123 Test Street, Test City, TS 12345',
        });

      expect(response.status).toBe(404);
    });

    it('should return 400 for invalid order data', async () => {
      const response = await request(app)
        .post('/api/v1/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          items: [],
          shippingAddress: 'Short',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/v1/orders', () => {
    beforeEach(async () => {
      // Create test orders
      await Order.create([
        {
          orderId: 'test-order-1',
          userId,
          items: [{ productId, quantity: 1, price: 99.99 }],
          totalAmount: 99.99,
          status: 'pending',
          shippingAddress: '123 Test Street',
        },
        {
          orderId: 'test-order-2',
          userId,
          items: [{ productId, quantity: 2, price: 99.99 }],
          totalAmount: 199.98,
          status: 'processing',
          shippingAddress: '456 Test Avenue',
        },
      ]);
    });

    it('should get all user orders', async () => {
      const response = await request(app)
        .get('/api/v1/orders')
        .set('Authorization', `Bearer ${authToken}`);

      const body = response.body as ApiSuccessResponse<{
        data: IOrder[];
        pagination: { total: number; hasMore: boolean };
      }>;

      expect(response.status).toBe(200);
      expect(body.data?.data).toBeInstanceOf(Array);
      expect(body.data?.data.length).toBe(2);
      expect(body.data?.pagination.total).toBe(2);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/v1/orders?limit=1&offset=0')
        .set('Authorization', `Bearer ${authToken}`);

      const body = response.body as ApiSuccessResponse<{
        data: IOrder[];
        pagination: { total: number; hasMore: boolean };
      }>;

      expect(response.status).toBe(200);
      expect(body.data?.data.length).toBe(1);
      expect(body.data?.pagination.hasMore).toBe(true);
    });
  });

  describe('GET /api/v1/orders/:orderId', () => {
    beforeEach(async () => {
      const order = await Order.create({
        orderId: 'test-single-order',
        userId,
        items: [{ productId, quantity: 1, price: 99.99 }],
        totalAmount: 99.99,
        status: 'pending',
        shippingAddress: '123 Test Street',
      });
      createdOrderId = order.orderId;
    });

    it('should get a single order by ID', async () => {
      const response = await request(app)
        .get(`/api/v1/orders/${createdOrderId}`)
        .set('Authorization', `Bearer ${authToken}`);

      const body = response.body as ApiSuccessResponse<{ order: IOrder }>;

      expect(response.status).toBe(200);
      expect(body.data?.order.orderId).toBe(createdOrderId);
      expect(body.data?.order.totalAmount).toBe(99.99);
    });

    it('should return 404 for non-existent order', async () => {
      const response = await request(app)
        .get('/api/v1/orders/nonexistent-order')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /api/v1/orders/:orderId/status', () => {
    beforeEach(async () => {
      const order = await Order.create({
        orderId: 'test-status-order',
        userId,
        items: [{ productId, quantity: 1, price: 99.99 }],
        totalAmount: 99.99,
        status: 'pending',
        shippingAddress: '123 Test Street',
      });
      createdOrderId = order.orderId;
    });

    it('should update order status successfully', async () => {
      const response = await request(app)
        .patch(`/api/v1/orders/${createdOrderId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'processing',
        });

      const body = response.body as ApiSuccessResponse<{ order: IOrder }>;

      expect(response.status).toBe(200);
      expect(body.data?.order.status).toBe('processing');
    });

    it('should return 400 for invalid status transition', async () => {
      const response = await request(app)
        .patch(`/api/v1/orders/${createdOrderId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'delivered',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/v1/orders/:orderId/cancel', () => {
    beforeEach(async () => {
      const order = await Order.create({
        orderId: 'test-cancel-order',
        userId,
        items: [{ productId, quantity: 5, price: 99.99 }],
        totalAmount: 499.95,
        status: 'pending',
        shippingAddress: '123 Test Street',
      });
      createdOrderId = order.orderId;

      // Decrement stock to simulate order creation
      await Product.updateOne({ productId }, { $inc: { stock: -5 } });
    });

    it('should cancel order and restore stock', async () => {
      const productBefore = await Product.findOne({ productId });
      const stockBefore = productBefore?.stock || 0;

      const response = await request(app)
        .post(`/api/v1/orders/${createdOrderId}/cancel`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);

      // Verify order is cancelled
      const order = await Order.findOne({ orderId: createdOrderId });
      expect(order?.status).toBe('cancelled');

      // Verify stock is restored
      const productAfter = await Product.findOne({ productId });
      expect(productAfter?.stock).toBe(stockBefore + 5);
    });

    it('should return 403 when cancelling non-pending order', async () => {
      // Update order to processing
      await Order.updateOne(
        { orderId: createdOrderId },
        { $set: { status: 'processing' } }
      );

      const response = await request(app)
        .post(`/api/v1/orders/${createdOrderId}/cancel`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403);
    });
  });
});
