import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '@/app';
import { connectToDatabase, disconnectFromDatabase } from '@/lib/mongoose';

describe('User API Integration Tests', () => {
  beforeAll(async () => {
    await connectToDatabase('Test');
  });

  afterAll(async () => {
    await disconnectFromDatabase('Test');
  });

  describe('POST /api/v1/users/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/v1/users/register')
        .send({
          userId: 'test-user-123',
          email: 'newuser@example.com',
          username: 'newuser',
          password: 'SecurePassword123!',
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.user).toHaveProperty('userId');
      expect(response.body.data).toHaveProperty('token');
    });

    it('should return 400 for invalid email', async () => {
      const response = await request(app)
        .post('/api/v1/users/register')
        .send({
          userId: 'test-user-456',
          email: 'invalid-email',
          username: 'testuser',
          password: 'password123',
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });
  });

  describe('POST /api/v1/users/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/users/login')
        .send({
          email: 'newuser@example.com',
          password: 'SecurePassword123!',
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('token');
    });
  });
});
