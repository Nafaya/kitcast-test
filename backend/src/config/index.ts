import './preload';
import { serverConfig } from './server.config';
import { authConfig } from './auth.config';
import { loggerConfig } from './logger.config';
// import { rabbitmqConfig } from './rabbitmq.config';
import { workersConfig } from './workers.config';
import { redisConfig } from './redis.config';
import { tasksConfig } from './tasks.config';

const config = {
  server: serverConfig,
  auth: authConfig,
  logger: loggerConfig,
  // rabbitmq: rabbitmqConfig,
  redis: redisConfig,
  workers: workersConfig,
  tasks: tasksConfig
};

export type IConfig = typeof config;

export default config;
