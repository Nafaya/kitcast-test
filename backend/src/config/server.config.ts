import rateLimit from 'express-rate-limit';
import { CorsOptions } from 'cors';
import { env } from './preload';


export const serverConfig: {
  port: number,
  cors: {
    enabled: boolean,
    options: CorsOptions
  },
  helmet: {
    enabled: boolean,
    options: any
  },
  rateLimit: {
    enabled: boolean,
    options: rateLimit.Options
  }
} = {
  port: parseInt(env.PORT, 10) || 3000,
  cors: {
    enabled: env.CORS_ENABLED === 'true',
    options: {
      origin: env.CORS_ORIGIN,
      methods: env.CORS_METHODS || 'GET,HEAD,PUT,PATCH,POST,DELETE',
      preflightContinue: false,
      optionsSuccessStatus: 204
    }
  },
  helmet: {
    enabled: env.HELMET_ENABLED === 'true',
    options: {}
  },
  rateLimit: {
    enabled: env.RATE_LIMIT_ENABLED === 'true',
    options: {
      windowMs: parseInt(env.RATE_LIMIT_WINDOW, 10) || (15 * 6 * 1000),
      max: parseInt(env.RATE_LIMIT_MAX, 10) || 100
    }
  }
};

