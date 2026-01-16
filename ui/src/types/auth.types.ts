import type { ILimits, SubscriptionPlan, UserRole } from "./user.types";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  userId: string;
  email: string;
  username: string;
  password: string;
}

export interface AuthResponse {
  user: UserDTO;
  token: string;
}

export interface UserDTO {
  userId: string;
  email: string;
  username: string;
  role: UserRole;
  plan: SubscriptionPlan;
  limits: ILimits;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}