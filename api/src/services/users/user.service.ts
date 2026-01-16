import { injectable } from 'tsyringe';
import User, { IUser } from '@/models/user.model';
import { IUserService } from './user.interface';
import { UserDTO, SubscriptionPlan, ILimits } from '@/types';
import redis from '@/lib/redis';
import { logger } from '@/lib/winston';
import {
  AppError,
  BadRequestError,
  DatabaseError,
  UserNotFoundError,
} from '@/lib/api_response/error';

@injectable()
export class UserService implements IUserService {
  private getCacheKey(userId: string): string {
    return `user:${userId}`;
  }

  private mapToDTO(user: IUser): UserDTO {
    return {
      userId: user.userId,
      email: user.email,
      username: user.username,
      role: user.role,
      plan: user.plan,
      limits: user.limits,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async getUserById(userId: string): Promise<UserDTO | null> {
    const cacheKey = this.getCacheKey(userId);
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      try {
        return JSON.parse(cachedData) as UserDTO;
      } catch (err) {
        if (err instanceof AppError) {
          logger.warn('Cache corrupted, fetching from DB', {
            userId,
            error: err.message,
          });
        }
      }
    }

    try {
      const user = await User.findOne({ userId, isActive: true })
        .select('-password -__v')
        .lean<UserDTO>()
        .exec();

      if (!user) return null;

      redis.set(cacheKey, JSON.stringify(user), 'EX', 3600).catch((err) => {
        if (err instanceof AppError) {
          logger.warn('Unable to cache user data in redis', {
            userId,
            error: err.message,
          });
        }
      });

      return user;
    } catch (error) {
      logger.error('Error getting user by ID', { userId, error });
      throw new DatabaseError('Failed to retrieve user');
    }
  }

  async getUserByEmail(email: string): Promise<UserDTO | null> {
    try {
      const user = await User.findOne({
        email: email.toLowerCase(),
        isActive: true,
      })
        .select('-password -__v')
        .lean<UserDTO>()
        .exec();

      if (!user) return null;

      return user;
    } catch (error) {
      logger.error('Error getting user by email', { email, error });
      throw new DatabaseError('Failed to retrieve user');
    }
  }

  async createUser(data: {
    userId: string;
    email: string;
    username: string;
    password: string;
  }): Promise<UserDTO> {
    try {
      const user = await User.create({
        userId: data.userId,
        email: data.email.toLowerCase(),
        username: data.username,
        password: data.password,
      });

      logger.info('User created successfully', { userId: user.userId });

      const userDTO = this.mapToDTO(user);

      redis
        .set(this.getCacheKey(user.userId), JSON.stringify(userDTO), 'EX', 3600)
        .catch((err) => {
          if (err instanceof AppError) {
            logger.warn('Failed to cache new user', {
              error: err.message,
            });
          }
        });

      return userDTO;
    } catch (error) {
      logger.error('Error creating user', { email: data.email, error });
      throw new DatabaseError('Failed to create user');
    }
  }

  async updateUserPlan(userId: string, plan: SubscriptionPlan): Promise<void> {
    try {
      const result = await User.updateOne(
        { userId, isActive: true },
        { $set: { plan, updatedAt: new Date() } }
      ).exec();

      if (result.matchedCount === 0) {
        throw new UserNotFoundError();
      }

      await redis.del(this.getCacheKey(userId));

      logger.info('User plan updated', { userId, plan });
      // return true;
    } catch (error) {
      logger.error('Error updating user plan', { userId, plan, error });
      throw new DatabaseError('Failed to update user plan');
    }
  }

  async updateUserLimits(userId: string, limits: ILimits): Promise<boolean> {
    try {
      const result = await User.updateOne(
        { userId, isActive: true },
        { $set: { limits, updatedAt: new Date() } }
      ).exec();

      if (result.matchedCount === 0) {
        throw new UserNotFoundError();
      }

      await redis.del(this.getCacheKey(userId));

      logger.info('User limits updated', { userId });
      return true;
    } catch (error) {
      logger.error('Error updating user limits', { userId, error });
      throw new DatabaseError('Failed to update user limits');
    }
  }

  async decrementLimit(
    userId: string,
    limitType: keyof ILimits
  ): Promise<boolean> {
    try {
      const updateField = `limits.${limitType}.current`;

      const result = await User.updateOne(
        {
          userId,
          isActive: true,
          [updateField]: { $gt: 0 },
        },
        {
          $inc: { [updateField]: -1 },
          $set: { updatedAt: new Date() },
        }
      ).exec();

      if (result.matchedCount === 0) {
        logger.warn('Unable to decrement limit', { userId, limitType });
        return false;
      }

      await redis.del(this.getCacheKey(userId));

      logger.debug('User limit decremented', { userId, limitType });
      return true;
    } catch (error) {
      logger.error('Error decrementing user limit', {
        userId,
        limitType,
        error,
      });
      throw new DatabaseError('Failed to decrement user limit');
    }
  }

  async resetMonthlyLimits(userId: string): Promise<boolean> {
    try {
      const user = await User.findOne({ userId, isActive: true }).exec();

      if (!user) {
        throw new UserNotFoundError();
      }

      const planDefaults = {
        free: { products: 10, orders: 20, apiCalls: 1000 },
        standard: { products: 50, orders: 100, apiCalls: 5000 },
        premium: { products: -1, orders: -1, apiCalls: 10000 },
      };

      const defaults = planDefaults[user.plan];

      user.limits = {
        products: {
          max: defaults.products,
          min: 0,
          current: defaults.products,
        },
        orders: { max: defaults.orders, min: 0, current: defaults.orders },
        apiCalls: {
          max: defaults.apiCalls,
          min: 0,
          current: defaults.apiCalls,
        },
      };

      await user.save();
      await redis.del(this.getCacheKey(userId));

      logger.info('Monthly limits reset', { userId });
      return true;
    } catch (error) {
      logger.error('Error resetting monthly limits', { userId, error });
      throw new DatabaseError('Failed to reset monthly limits');
    }
  }

  async deleteUser(userId: string): Promise<boolean> {
    try {
      const result = await User.updateOne(
        { userId },
        { $set: { isActive: false, updatedAt: new Date() } }
      ).exec();

      if (result.matchedCount === 0) {
        throw new UserNotFoundError();
      }

      await redis.del(this.getCacheKey(userId));

      logger.info('User soft deleted', { userId });
      return true;
    } catch (error) {
      logger.error('Error deleting user', { userId, error });
      throw new DatabaseError('Failed to delete user');
    }
  }

  async authenticateUser(
    email: string,
    password: string
  ): Promise<UserDTO | null> {
    try {
      const user = await User.findOne({
        email: email.toLowerCase(),
        isActive: true,
      }).exec();

      if (!user) {
        throw new BadRequestError('Invalid email and/or password');
      }

      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        throw new BadRequestError('Invalid email and/or password');
      }

      return this.mapToDTO(user);
    } catch (error) {
      if (error instanceof BadRequestError) {
        throw error;
      }
      logger.error('Error authenticating user', { email, error });
      throw new DatabaseError('Authentication failed');
    }
  }
}
