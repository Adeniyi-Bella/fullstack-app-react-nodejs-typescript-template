import { IUser } from './models/user.model';

export interface IValues {
  max: number;
  min: number;
  current: number;
}

export interface BotDetectionResult {
  isBot: boolean;
  score: number;
  reasons: string[];
  meta: {
    browser: string;
    os: string;
    device: string;
    ip: string;
  };
}

export interface GuardianConfig {
  threshold: number;
}

export type VerifiedUser = Pick<IUser, 'userId' | 'email' | 'username'>;

export type ApiSuccessResponse<T> = {
  status: 'success';
  message: string;
  data?: T;
  timestamp: string;
  version: string;
};

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export enum SubscriptionPlan {
  FREE = 'free',
  STANDARD = 'standard',
  PREMIUM = 'premium',
}

export interface ILimits {
  products: IValues;
  orders: IValues;
  apiCalls: IValues;
}

export type UserDTO = Pick<
  IUser,
  | 'userId'
  | 'email'
  | 'username'
  | 'role'
  | 'plan'
  | 'limits'
  | 'isActive'
  | 'createdAt'
  | 'updatedAt'
>;

export enum ProductCategory {
  ELECTRONICS = 'electronics',
  CLOTHING = 'clothing',
  HOME = 'home',
  BOOKS = 'books',
  BEAUTY = 'beauty',
  SPORTS = 'sports',
  TOYS = 'toys',
  OTHER = 'other',
}

export enum ProductStatus {
  ACTIVE = 'active',
  DRAFT = 'draft',
  ARCHIVED = 'archived',
  OUT_OF_STOCK = 'out_of_stock',
}

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  RETURNED = 'returned',
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  name?: string; 
}

export interface IProductData {
  productId: string;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  stock: number;
  status: ProductStatus;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ProductDTO = IProductData;

export type CreateProductDTO = Pick<
  IProductData,
  'name' | 'description' | 'price' | 'category' | 'stock'
>;

export type UpdateProductDTO = Partial<CreateProductDTO> & {
  status?: ProductStatus;
};

export interface IOrderData {
  orderId: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  shippingAddress: string;
  createdAt: Date;
  updatedAt: Date;
}

export type OrderDTO = IOrderData;

export interface CreateOrderDTO {
  items: {
    productId: string;
    quantity: number;
  }[];
  shippingAddress: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}