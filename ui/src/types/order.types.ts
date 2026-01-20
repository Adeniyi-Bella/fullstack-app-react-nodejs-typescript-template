export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface OrderDTO {
  orderId: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  shippingAddress: string;
  createdAt?: string;
  updatedAt?: string;
}

export type TestOrderDTO = Omit<OrderDTO, 'userId' | 'updatedAt'>;

export interface CreateOrderRequest {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  shippingAddress: string;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}
