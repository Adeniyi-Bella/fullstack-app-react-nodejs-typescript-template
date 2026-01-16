import rateLimit from 'express-rate-limit';
import config from '@/config';
import { TooManyRequestsError } from '../lib/api_response/error';

const limiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  handler: () => {
    throw new TooManyRequestsError(
      'Too many requests from this IP, please try again later'
    );
  },
});

export default limiter;