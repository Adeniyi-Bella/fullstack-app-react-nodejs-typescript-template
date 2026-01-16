/**
 * @copyright 2025 Adeniyi Bella
 * @license Apache-2.0
 */

/**
 * Base Application Error
 * All custom errors extend from this class
 */
export abstract class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code: string;

  constructor(message: string, statusCode: number, code: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;

    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace(this, this.constructor);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * 400 Bad Request Errors
 */
export class BadRequestError extends AppError {
  constructor(message: string = 'Bad Request', code: string = 'BAD_REQUEST') {
    super(message, 400, code);
  }
}

export class WrongLoginDetails extends BadRequestError {
  constructor(message: string = 'Wrong login details provided') {
    super(message, 'WRONG_LOGIN_DETAILS');
  }
}

export class ValidationError extends BadRequestError {
  public readonly errors?: Record<string, unknown>;

  constructor(message: string = 'Validation failed', errors?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR');
    this.errors = errors;
  }
}

/**
 * 401 Unauthorized Errors
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized', code: string = 'UNAUTHORIZED') {
    super(message, 401, code);
  }
}

export class TokenExpiredError extends UnauthorizedError {
  constructor(message: string = 'Token has expired') {
    super(message, 'TOKEN_EXPIRED');
  }
}

export class InvalidTokenError extends UnauthorizedError {
  constructor(message: string = 'Invalid or malformed token') {
    super(message, 'INVALID_TOKEN');
  }
}

/**
 * 403 Forbidden Errors
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Access forbidden', code: string = 'FORBIDDEN') {
    super(message, 403, code);
  }
}

/**
 * 404 Not Found Errors
 */
export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', code: string = 'NOT_FOUND') {
    super(message, 404, code);
  }
}

export class UserNotFoundError extends NotFoundError {
  constructor(message: string = 'User not found') {
    super(message, 'USER_NOT_FOUND');
  }
}

/**
 * 429 Too Many Requests
 */
export class TooManyRequestsError extends AppError {
  constructor(message: string = 'Too many requests, please try again later') {
    super(message, 429, 'TOO_MANY_REQUESTS');
  }
}

/**
 * 500 Internal Server Errors
 */
export class InternalServerError extends AppError {
  constructor(message: string = 'Internal server error', code: string = 'SERVER_ERROR') {
    super(message, 500, code, false);
  }
}

export class DatabaseError extends InternalServerError {
  constructor(message: string = 'Database operation failed') {
    super(message, 'DATABASE_ERROR');
  }
}