import { env } from './preload';

export const authConfig : {
  jwt: {
    secret: string,
    expiresIn?: number,
    ignoreExpiration?: boolean,
    maxAge?: number
  }
} = {
  jwt: {
    secret: env.AUTH_JWT_SECRET,
    expiresIn: parseInt(env.AUTH_JWT_EXPIRES_IN, 10) || 60 * 60
  }
};
