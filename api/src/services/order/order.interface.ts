import { OrderDTO, CreateOrderDTO, PaginatedResponse, OrderStatus } from '@/types';

export interface IOrderService {
  createOrder(userId: string, data: CreateOrderDTO): Promise<OrderDTO>;
  getOrderById(orderId: string): Promise<OrderDTO | null>;
  getUserOrders(
    userId: string,
    limit: number,
    offset: number
  ): Promise<PaginatedResponse<OrderDTO>>;
  updateOrderStatus(
    orderId: string,
    status: OrderStatus
  ): Promise<OrderDTO | null>;
  cancelOrder(userId: string, orderId: string): Promise<boolean>;
}