import { RedisOptions } from 'ioredis';
import { env } from './preload';

export const redisConfig: {
  tasks: {
    listName: string,
    channelName: string,
    // prefix: string,
    retryTimeout: number
  },
  connectionOptions: RedisOptions
} = {
  tasks: {
    listName: 'tasks-list',
    channelName: 'tasks-channel',
    // prefix: 'tasks-',
    retryTimeout: 3000
  },
  connectionOptions: {
    host: env.REDIS_HOST || 'localhost',
    port: parseInt(env.REDIS_PORT, 10) || 6379
  }
};
