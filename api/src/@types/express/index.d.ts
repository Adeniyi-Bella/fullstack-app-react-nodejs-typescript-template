/**
 * @copyright 2025 Adeniyi Bella
 * @license Apache-2.0
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as express from 'express';

declare global {
  namespace Express {
    interface Request {
      userId: string;
      email: string;
      username: string;

    }
  }
}
