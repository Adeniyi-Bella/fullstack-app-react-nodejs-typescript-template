import axios, { type AxiosInstance, AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { ErrorHandler } from '@lib/errors/errorHandler';
import { SentryLogger } from '@lib/logger/sentry';

export class ApiClient {
  private static instance: AxiosInstance;

  static getInstance(): AxiosInstance {
    if (!this.instance) {
      this.instance = this.createInstance();
      this.setupInterceptors();
    }
    return this.instance;
  }

  private static createInstance(): AxiosInstance {
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

    return axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  private static setupInterceptors(): void {
    // Request interceptor
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('auth_token');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        const appError = ErrorHandler.handle(error);

        // Log non-operational errors
        if (!appError.isOperational) {
          SentryLogger.captureException(appError, {
            url: error.config?.url,
            method: error.config?.method,
          });
        }

        // Handle 401 - redirect to login
        if (appError.statusCode === 401) {
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
        }

        return Promise.reject(appError);
      }
    );
  }

  static setAuthToken(token: string | null): void {
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  static getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }
}

export const apiClient = ApiClient.getInstance();