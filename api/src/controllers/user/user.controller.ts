import { container } from 'tsyringe';
import { Request, Response } from 'express';
import { asyncHandler } from '@/middlewares/errorHandler';
import { UserNotFoundError } from '@/lib/api_response/error';
import { generateAccessToken } from '@/lib/jwt';
import { IUserService } from '@/services/users/user.interface';
import { ApiResponse } from '@/lib/api_response/success';
import { SubscriptionPlan } from '@/types';

type UpdatePlanBody = {
  plan: SubscriptionPlan;
};

export const registerUser = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userService = container.resolve<IUserService>('IUserService');
    const { userId, email, username, password } = req.body as {
      userId: string;
      email: string;
      username: string;
      password: string;
    };

    const user = await userService.createUser({
      userId,
      email,
      username,
      password,
    });

    const token = generateAccessToken({
      userId: user.userId,
      email: user.email,
      username: user.username,
    });

    ApiResponse.created(res, 'User registered successfully', { user, token });
  }
);

export const loginUser = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userService = container.resolve<IUserService>('IUserService');
    const { email, password } = req.body as {
      email: string;
      password: string;
    };

    const user = await userService.authenticateUser(email, password);

    if (!user) {
      throw new UserNotFoundError();
    }

    const token = generateAccessToken({
      userId: user.userId,
      email: user.email,
      username: user.username,
    });

    ApiResponse.ok(res, 'Login successful', { user, token });
  }
);

export const getUserProfile = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userService = container.resolve<IUserService>('IUserService');

    const user = await userService.getUserById(req.userId);

    if (!user) {
      throw new UserNotFoundError();
    }

    ApiResponse.ok(res, 'User profile retrieved', { user });
  }
);

export const updateUserPlan = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userService = container.resolve<IUserService>('IUserService');
    const { plan } = req.body as UpdatePlanBody;

    await userService.updateUserPlan(req.userId, plan);

    ApiResponse.ok(res, 'User plan updated successfully');
  }
);

export const deleteUserAccount = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userService = container.resolve<IUserService>('IUserService');

    await userService.deleteUser(req.userId);

    ApiResponse.ok(res, 'User account deleted successfully');
  }
);
