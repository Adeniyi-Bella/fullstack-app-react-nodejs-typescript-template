export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MANAGER = 'manager',
}

export enum SubscriptionPlan {
  FREE = 'free',
  STANDARD = 'standard',
  PREMIUM = 'premium',
}

export interface IValues {
  max: number;
  min: number;
  current: number;
}

export interface ILimits {
  products?: IValues;
  orders?: IValues;
  apiCalls?: IValues;
}

export interface UpdateUserPlanRequest {
  plan: SubscriptionPlan;
}