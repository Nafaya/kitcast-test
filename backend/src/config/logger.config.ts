import { env } from './preload';


export const loggerConfig: {
  pretty: boolean,
  logLevel: string
} = {
  pretty: env.LOGGER_PRETTY === 'true',
  logLevel: env.LOGGER_LOG_LEVEL || 'info'
};
