import { ApiSuccessResponse } from '@/types';
import { Response } from 'express';

export class ApiResponse {
  private static readonly VERSION = '1.0.0';

  static ok<T>(res: Response, message: string, data?: T): Response {
    const response: ApiSuccessResponse<T> = {
      status: 'success',
      message,
      data,
      timestamp: new Date().toISOString(),
      version: this.VERSION,
    };
    return res.status(200).json(response);
  }

  static created<T>(res: Response, message: string, data?: T): Response {
    const response: ApiSuccessResponse<T> = {
      status: 'success',
      message,
      data,
      timestamp: new Date().toISOString(),
      version: this.VERSION,
    };
    return res.status(201).json(response);
  }

  static noContent(res: Response): Response {
    return res.status(204).send();
  }
}