import jwt, { SignOptions } from 'jsonwebtoken';
import config from '@/config';
import { InvalidTokenError, TokenExpiredError } from './api_response/error';
import { VerifiedUser } from '@/types';


export const generateAccessToken = (payload: VerifiedUser): string => {
  const options: SignOptions = {
    expiresIn: config.JWT_EXPIRES_IN as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, config.JWT_SECRET, options);
};

export const verifyAccessToken = (token: string): VerifiedUser => {
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET) as VerifiedUser;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new TokenExpiredError();
    }
    throw new InvalidTokenError();
  }
};