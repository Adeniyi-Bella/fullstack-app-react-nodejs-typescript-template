import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.string().transform(Number).default('8080'),
  MONGO_URI: z.string().url().default('mongodb://mongo:27017/app'),
  REDIS_URL: z.string().url().default('redis://redis:6379'),
  JWT_SECRET: z.string().min(32).default('dev-secret-change-me-but-make-it-long-enough-to-pass-zod'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  WHITELIST_ORIGINS: z.string().default('http://localhost:3000').transform((val) => val.split(',')),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  LOGTAIL_SOURCE_TOKEN: z.string().optional(),
  LOG_TAIL_INGESTING_HOST: z.string().optional(),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('Invalid environment variables:', parsedEnv.error.format());
  process.exit(1);
}

if (
  parsedEnv.data.NODE_ENV === 'production' &&
  (!parsedEnv.data.LOGTAIL_SOURCE_TOKEN ||
    !parsedEnv.data.LOG_TAIL_INGESTING_HOST)
) {
  throw new Error(
    'LOGTAIL_SOURCE_TOKEN and LOG_TAIL_INGESTING_HOST are required in production'
  );
}

export const config = parsedEnv.data;
export default config;