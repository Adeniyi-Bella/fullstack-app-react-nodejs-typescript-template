export interface ApiSuccessResponse<T = unknown> {
  status: 'success';
  message: string;
  data?: T;
  timestamp: string;
  version: string;
}

export interface ApiErrorResponse {
  status: 'error';
  code: string;
  message: string;
  timestamp: string;
  version: string;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
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