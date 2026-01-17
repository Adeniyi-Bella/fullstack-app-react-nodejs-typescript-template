import { IOrderData, CreateOrderDTO, PaginatedResponse, OrderStatus } from '@/types';

export interface IOrderService {
  createOrder(userId: string, data: CreateOrderDTO): Promise<IOrderData>;
  getOrderById(orderId: string): Promise<IOrderData | null>;
  getUserOrders(
    userId: string,
    limit: number,
    offset: number
  ): Promise<PaginatedResponse<IOrderData>>;
  updateOrderStatus(
    orderId: string,
    status: OrderStatus
  ): Promise<IOrderData | null>;
  cancelOrder(userId: string, orderId: string): Promise<boolean>;
}