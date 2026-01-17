/**
 * @copyright 2025 Adeniyi Bella
 * @license Apache-2.0
 */

/**
 * Custom modules
 */
import { logger } from '@/lib/winston';

/**
 * Types
 */
import type { Request, Response, NextFunction, RequestHandler } from 'express';
import {
  AppError,
  InternalServerError,
  ValidationError,
} from '@/lib/api_response/error';
import type { ParamsDictionary } from 'express-serve-static-core';


/**
 * Global error handler middleware
 * This should be the last middleware in your Express app
 */
export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,

  next: NextFunction
): Response | void => {
  // If headers already sent, delegate to default Express error handler
  if (res.headersSent) {
    return next(err);
  }

  // Handle AppError instances (our custom errors)
  if (err instanceof AppError) {
    logger.error('Application error', {
      code: err.code,
      message: err.message,
      statusCode: err.statusCode,
      path: req.path,
      method: req.method,
      userId: req.userId,
      stack: err.stack,
      isOperational: err.isOperational,
    });

    // Return structured error response
    return res.status(err.statusCode).json({
      status: 'error',
      code: err.code,
      message: err.message,
      ...(err instanceof ValidationError && { errors: err.errors }),
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    });
  }

  const errorObj = err instanceof Error ? err : new Error(String(err));

  logger.error('Unexpected error', {
    message: errorObj.message,
    name: errorObj.name,
    // ...
    stack: errorObj.stack,
  });

  // Don't expose internal error details in production
  const message =
    process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : errorObj.message;

  // Create an InternalServerError and send a proper HTTP response
  const internalError = new InternalServerError(message);
  return res.status(internalError.statusCode).json({
    status: 'error',
    code: internalError.code,
    message: internalError.message,
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
};

/**
 * Async handler wrapper
 * Wraps async route handlers to catch errors and pass them to error middleware
 */
export const asyncHandler = <
  P = ParamsDictionary,
  ResBody = unknown,
  ReqBody = unknown,
  // ReqQuery = ParsedQs
>(
  fn: (
    req: Request<P, ResBody, ReqBody>,
    res: Response<ResBody>,
    next: NextFunction
  ) => Promise<void> | void
): RequestHandler<P, ResBody, ReqBody> => {
  // We return a function that matches the signature, handling the Promise resolution
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Handle unhandled promise rejections
 */
export const handleUnhandledRejection = () => {
  process.on(
    'unhandledRejection',
    (reason: Error, promise: Promise<unknown>) => {
      logger.error('Unhandled Promise Rejection', {
        reason: reason.message,
        stack: reason.stack,
        promise,
      });

      // In production, you might want to gracefully shutdown
      if (process.env.NODE_ENV === 'production') {
        // Implement graceful shutdown logic here
        logger.error('Shutting down due to unhandled rejection');
        process.exit(1);
      }
    }
  );
};

/**
 * Handle uncaught exceptions
 */
export const handleUncaughtException = () => {
  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception', {
      message: error.message,
      stack: error.stack,
    });

    // Always exit on uncaught exception
    logger.error('Shutting down due to uncaught exception');
    process.exit(1);
  });
};
