import 'reflect-metadata';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import User from '@/models/user.model';
import redis from '@/lib/redis';
import { UserService } from '@/services/users/user.service';

vi.mock('@/models/user.model');
vi.mock('@/lib/redis');

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
    vi.clearAllMocks();
  });

  describe('getUserById', () => {
    it('should return user from cache if available', async () => {
      const mockUser = {
        userId: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        role: 'user',
        plan: 'free',
        limits: {},
        isActive: true,
      };

      vi.mocked(redis.get).mockResolvedValue(JSON.stringify(mockUser));

      const result = await userService.getUserById('user-123');

      expect(result).toEqual(mockUser);
      expect(redis.get).toHaveBeenCalledWith('user:user-123');
      expect(User.findOne).not.toHaveBeenCalled();
    });

    it('should fetch user from database if not in cache', async () => {
      const mockUser = {
        userId: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        role: 'user',
        plan: 'free',
        limits: {},
        isActive: true,
      };

      vi.mocked(redis.get).mockResolvedValue(null);
      vi.mocked(redis.set).mockResolvedValue('OK');
      vi.mocked(User.findOne).mockReturnValue({
        select: vi.fn().mockReturnValue({
          lean: vi.fn().mockReturnValue({
            exec: vi.fn().mockResolvedValue(mockUser),
          }),
        }),
      } as any);

      const result = await userService.getUserById('user-123');

      expect(result).toMatchObject(mockUser);
      expect(User.findOne).toHaveBeenCalled();
      expect(redis.set).toHaveBeenCalled();
    });
  });

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      const userData = {
        userId: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      };

      const mockCreatedUser = {
        ...userData,
        role: 'user',
        plan: 'free',
        limits: {},
        isActive: true,
      };

      vi.mocked(User.create).mockResolvedValue(mockCreatedUser as any);

      vi.mocked(redis.set).mockResolvedValue('OK');

      const result = await userService.createUser(userData);

      expect(result.email).toBe(userData.email);
      expect(User.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: userData.email.toLowerCase(),
        })
      );
      expect(redis.set).toHaveBeenCalled();
    });
  });
});
