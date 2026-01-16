import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from './errorHandler';
import { UnauthorizedError } from '@/lib/api_response/error';
import { verifyAccessToken } from '@/lib/jwt';

const authenticate = asyncHandler(
   (req: Request, _res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedError('No authentication token provided');
    }

    const token = authHeader.split(' ')[1];

    const { userId, email, username } =  verifyAccessToken(token);

    req.userId = userId;
    req.email = email;
    req.username = username;

    next();
  },
);

export default authenticate;
