import 'reflect-metadata';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '@/app';
import { connectToDatabase, disconnectFromDatabase } from '@/lib/mongoose';
import User from '@/models/user.model';
import Product from '@/models/product.model';
import { generateAccessToken } from '@/lib/jwt';

describe('Product API Integration Tests', () => {
  let authToken: string;
  let userId: string;
  let createdProductId: string;

  beforeAll(async () => {
    await connectToDatabase('Test-Product');

    // Create test user
    const testUser = await User.create({
      userId: 'test-product-user-123',
      email: 'product.test@example.com',
      username: 'producttest',
      password: 'TestPassword123!',
    });

    userId = testUser.userId;

    authToken = generateAccessToken({
      userId: testUser.userId,
      email: testUser.email,
      username: testUser.username,
    });
  });

  afterAll(async () => {
    await Product.deleteMany({ userId });
    await User.deleteMany({ userId });
    await disconnectFromDatabase('Test-Product');
  });

  beforeEach(async () => {
    await Product.deleteMany({ userId });
  });

  describe('POST /api/v1/products', () => {
    it('should create a new product successfully', async () => {
      const response = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Laptop',
          description: 'High-performance laptop for testing',
          price: 1299.99,
          category: 'electronics',
          stock: 50,
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.product).toHaveProperty('productId');
      expect(response.body.data.product.name).toBe('Test Laptop');
      expect(response.body.data.product.price).toBe(1299.99);

      createdProductId = response.body.data.product.productId;
    });

    it('should return 400 for invalid product data', async () => {
      const response = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Te',
          description: 'Short',
          price: -10,
          category: 'invalid-category',
          stock: -5,
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });

    it('should return 401 without authentication token', async () => {
      const response = await request(app)
        .post('/api/v1/products')
        .send({
          name: 'Test Product',
          description: 'Test Description',
          price: 99.99,
          category: 'electronics',
          stock: 10,
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/v1/products', () => {
    beforeEach(async () => {
      // Create test products
      await Product.create([
        {
          productId: 'test-product-1',
          userId,
          name: 'Product 1',
          description: 'Description 1',
          price: 99.99,
          category: 'electronics',
          stock: 10,
          status: 'active',
        },
        {
          productId: 'test-product-2',
          userId,
          name: 'Product 2',
          description: 'Description 2',
          price: 149.99,
          category: 'books',
          stock: 20,
          status: 'active',
        },
      ]);
    });

    it('should get all user products', async () => {
      const response = await request(app)
        .get('/api/v1/products')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.data).toBeInstanceOf(Array);
      expect(response.body.data.data.length).toBe(2);
      expect(response.body.data.pagination).toHaveProperty('total');
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/v1/products?limit=1&offset=0')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.data.length).toBe(1);
      expect(response.body.data.pagination.hasMore).toBe(true);
    });
  });

  describe('GET /api/v1/products/:productId', () => {
    beforeEach(async () => {
      const product = await Product.create({
        productId: 'test-single-product',
        userId,
        name: 'Single Product',
        description: 'Single Product Description',
        price: 199.99,
        category: 'electronics',
        stock: 5,
        status: 'active',
      });
      createdProductId = product.productId;
    });

    it('should get a single product by ID', async () => {
      const response = await request(app)
        .get(`/api/v1/products/${createdProductId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.product.productId).toBe(createdProductId);
      expect(response.body.data.product.name).toBe('Single Product');
    });

    it('should return 404 for non-existent product', async () => {
      const response = await request(app)
        .get('/api/v1/products/nonexistent-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /api/v1/products/:productId', () => {
    beforeEach(async () => {
      const product = await Product.create({
        productId: 'test-update-product',
        userId,
        name: 'Update Product',
        description: 'Update Product Description',
        price: 99.99,
        category: 'electronics',
        stock: 10,
        status: 'active',
      });
      createdProductId = product.productId;
    });

    it('should update product successfully', async () => {
      const response = await request(app)
        .patch(`/api/v1/products/${createdProductId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          price: 89.99,
          stock: 15,
        });

      expect(response.status).toBe(200);
      expect(response.body.data.product.price).toBe(89.99);
      expect(response.body.data.product.stock).toBe(15);
    });

    it('should return 404 when updating non-existent product', async () => {
      const response = await request(app)
        .patch('/api/v1/products/nonexistent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          price: 79.99,
        });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/v1/products/:productId', () => {
    beforeEach(async () => {
      const product = await Product.create({
        productId: 'test-delete-product',
        userId,
        name: 'Delete Product',
        description: 'Delete Product Description',
        price: 59.99,
        category: 'books',
        stock: 5,
        status: 'active',
      });
      createdProductId = product.productId;
    });

    it('should delete product successfully', async () => {
      const response = await request(app)
        .delete(`/api/v1/products/${createdProductId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(204);

      // Verify product is deleted
      const deletedProduct = await Product.findOne({ productId: createdProductId });
      expect(deletedProduct).toBeNull();
    });

    it('should return 404 when deleting non-existent product', async () => {
      const response = await request(app)
        .delete('/api/v1/products/nonexistent-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });
});