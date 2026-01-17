import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '@/app';

describe('User API Integration Tests', () => {

  interface ApiErrorResponse {
    status: 'error';
    code: string;
    message: string;
    errors?: Record<string, unknown>;
  }

  type ApiSuccessResponse<T> = {
    status: 'success';
    message: string;
    data?: T;
    timestamp: string;
    version: string;
  };

  
  describe('POST /api/v1/users/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app).post('/api/v1/users/register').send({
        userId: 'test-user-123',
        email: 'newuser@example.com',
        username: 'newuser',
        password: 'SecurePassword123!',
      });

      const body = response.body as ApiSuccessResponse<{
        user: {
          userId: string;
          email: string;
          username: string;
        };
        token: string;
      }>;

      expect(response.status).toBe(201);
      expect(body.status).toBe('success');
      expect(body.data?.user).toHaveProperty('userId');
      expect(body.data).toHaveProperty('token');
    });

    it('should return 400 for invalid email', async () => {
      const response = await request(app).post('/api/v1/users/register').send({
        userId: 'test-user-456',
        email: 'invalid-email',
        username: 'testuser',
        password: 'password123',
      });

      const body = response.body as ApiErrorResponse;
      expect(response.status).toBe(400);
      expect(body.status).toBe('error');
    });
  });

  describe('POST /api/v1/users/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app).post('/api/v1/users/login').send({
        email: 'newuser@example.com',
        password: 'SecurePassword123!',
      });

      const body = response.body as ApiSuccessResponse<{
        user: {
          userId: string;
          email: string;
          username: string;
        };
        token: string;
      }>;
      expect(response.status).toBe(200);
      expect(body.data?.user).toHaveProperty('userId');
      expect(body.data).toHaveProperty('token');
    });
  });
});
