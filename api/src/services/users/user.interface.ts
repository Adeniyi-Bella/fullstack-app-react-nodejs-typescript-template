import { VerifiedUser, SubscriptionPlan, ILimits, UserDTO } from '@/types';

export interface IUserService {
  getUserById(userId: string): Promise<UserDTO | null>;
  getUserByEmail(email: string): Promise<VerifiedUser | null>;
  createUser(data: {
    userId: string;
    email: string;
    username: string;
    password: string;
  }): Promise<VerifiedUser>;
  updateUserPlan(userId: string, plan: SubscriptionPlan): Promise<void>;
  updateUserLimits(userId: string, limits: ILimits): Promise<boolean>;
  decrementLimit(
    userId: string,
    limitType: keyof ILimits
  ): Promise<boolean>;
  resetMonthlyLimits(userId: string): Promise<boolean>;
  deleteUser(userId: string): Promise<boolean>;
  authenticateUser(email: string, password: string): Promise<VerifiedUser | null>;
}