import * as Sentry from '@sentry/react';
import {
  AppError,
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  NetworkError,
  InternalServerError,
} from './AppError';
import type { ApiErrorResponse } from '../../types/api.types';
// import type { ApiErrorResponse } from '@types';


export class ErrorHandler {
  static handle(error: unknown): AppError {
    // Already an AppError
    if (error instanceof AppError) {
      return error;
    }

    // Network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return new NetworkError('Failed to connect to server');
    }

    // Axios error with response
    if (this.isAxiosError(error) && error.response) {
      return this.handleApiError(error.response.data as ApiErrorResponse);
    }

    // Unknown errors
    Sentry.captureException(error);
    return new InternalServerError();
  }

  private static handleApiError(errorResponse: ApiErrorResponse): AppError {
    const { code, message } = errorResponse;

    switch (code) {
      case 'UNAUTHORIZED':
      case 'TOKEN_EXPIRED':
      case 'INVALID_TOKEN':
        return new UnauthorizedError(message);
      case 'NOT_FOUND':
      case 'USER_NOT_FOUND':
      case 'PRODUCT_NOT_FOUND':
        return new NotFoundError(message);
      case 'BAD_REQUEST':
      case 'VALIDATION_ERROR':
        return new BadRequestError(message, code);
      default:
        return new InternalServerError();
    }
  }

  private static isAxiosError(error: unknown): error is {
    response?: { data: unknown };
  } {
    return typeof error === 'object' && error !== null && 'response' in error;
  }
}