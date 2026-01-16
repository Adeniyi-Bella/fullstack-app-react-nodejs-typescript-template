import type { ApiSuccessResponse, AuthResponse, LoginCredentials, RegisterData } from '@/types';
import { apiClient } from './client';


export class AuthApi {
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<ApiSuccessResponse<AuthResponse>>(
      '/users/login',
      credentials
    );
    return response.data.data!;
  }

  static async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<ApiSuccessResponse<AuthResponse>>(
      '/users/register',
      data
    );
    return response.data.data!;
  }

  static async logout(): Promise<void> {
    // Clear local auth state
    localStorage.removeItem('auth_token');
  }
}
