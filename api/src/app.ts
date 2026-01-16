// src/app.ts
import 'reflect-metadata';
import './di/container';

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import helmet from 'helmet';

import config from '@/config';
import limiter from '@/middlewares/express_rate_limit';
import v1Routes from '@/routes/v1';
import { botGuard } from '@/middlewares/bot_detector';
import { errorHandler, handleUncaughtException, handleUnhandledRejection } from '@/middlewares/errorHandler';

import type { CorsOptions } from 'cors';
import { logger } from './lib/winston';

export const app = express();

handleUncaughtException();
handleUnhandledRejection();


/* -------------------------------------------------------------------------- */
/*                               CORS configuration                            */
/* -------------------------------------------------------------------------- */
const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (!origin || config.WHITELIST_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn(`CORS error: ${origin} is not allowed by CORS`);
      callback(new Error('Not allowed by CORS'), false);
    }
  },
};

app.use(cors(corsOptions));

/* -------------------------------------------------------------------------- */
/*                              Global middleware                              */
/* -------------------------------------------------------------------------- */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compression({ threshold: 1024 }));
app.use(helmet());
app.use(limiter);

if (config.NODE_ENV === 'production') {
  app.use(botGuard);
}

/* -------------------------------------------------------------------------- */
/*                                   Routes                                    */
/* -------------------------------------------------------------------------- */
app.use('/api/v1', v1Routes);

app.use((_, res) => {
  res.status(404).json({
    status: 'error',
    code: 'NOT_FOUND',
    message: 'Route not found',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

app.use(errorHandler);
