import type { ApiSuccessResponse, CreateOrderRequest, OrderDTO, PaginatedResponse, PaginationParams, UpdateOrderStatusRequest } from "@/types";
import { apiClient } from "./client";

export class OrderApi {
  static async getOrders(
    params: PaginationParams = {}
  ): Promise<PaginatedResponse<OrderDTO>> {
    const response = await apiClient.get<
      ApiSuccessResponse<PaginatedResponse<OrderDTO>>
    >('/orders', { params });
    return response.data.data!;
  }

  static async getOrder(orderId: string): Promise<OrderDTO> {
    const response = await apiClient.get<ApiSuccessResponse<{ order: OrderDTO }>>(
      `/orders/${orderId}`
    );
    return response.data.data!.order;
  }

  static async createOrder(data: CreateOrderRequest): Promise<OrderDTO> {
    const response = await apiClient.post<ApiSuccessResponse<{ order: OrderDTO }>>(
      '/orders',
      data
    );
    return response.data.data!.order;
  }

  static async updateOrderStatus(
    orderId: string,
    data: UpdateOrderStatusRequest
  ): Promise<OrderDTO> {
    const response = await apiClient.patch<ApiSuccessResponse<{ order: OrderDTO }>>(
      `/orders/${orderId}/status`,
      data
    );
    return response.data.data!.order;
  }

  static async cancelOrder(orderId: string): Promise<void> {
    await apiClient.post(`/orders/${orderId}/cancel`);
  }
}
