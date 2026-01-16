import type { ApiSuccessResponse, UpdateUserPlanRequest, UserDTO } from "@/types";
import { apiClient } from "./client";


export class UserApi {
  static async getProfile(): Promise<UserDTO> {
    const response = await apiClient.get<ApiSuccessResponse<{ user: UserDTO }>>(
      '/users/profile'
    );
    return response.data.data!.user;
  }

  static async updatePlan(plan: UpdateUserPlanRequest): Promise<void> {
    await apiClient.patch('/users/plan', plan);
  }

  static async deleteAccount(): Promise<void> {
    await apiClient.delete('/users');
  }
}