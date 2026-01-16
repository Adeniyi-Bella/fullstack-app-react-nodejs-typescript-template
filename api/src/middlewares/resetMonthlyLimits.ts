import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from './errorHandler';
import { container } from 'tsyringe';
import { IUserService } from '@/services/users/user.interface';

export const resetMonthlyLimits = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const userService = container.resolve<IUserService>('IUserService');

    const user = await userService.getUserById(req.userId);

    if (!user) {
      return next();
    }

    const now = new Date();
    const lastUpdate = user.updatedAt
      ? new Date(user.updatedAt)
      : user.createdAt
        ? new Date(user.createdAt)
        : null;

    if (!lastUpdate) {
      return next();
    }

    const shouldReset =
      now.getMonth() !== lastUpdate.getMonth() ||
      now.getFullYear() !== lastUpdate.getFullYear();

    if (shouldReset) {
      await userService.resetMonthlyLimits(req.userId);
    }

    next();
  }
);

export default resetMonthlyLimits;
