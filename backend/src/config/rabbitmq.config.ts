import { URL } from 'url';
import { IQueueOptions, IExchangeOptions } from '../lib/managers/rabbitmq-message-queue';
import { env } from './preload';

export const rabbitmqConfig: {
  queues: {
    [_: string]: Omit<IQueueOptions, 'handler'|'errorHandler'>
  },
  exchanges: {
    [_: string]: IExchangeOptions
  },
  connectionOptions: {
    protocol: string,
    hostname: string,
    port: string,
    username: string,
    password: string,
    heartbeat: number,
    uri: string
  }
} = {
  queues: {
    eventsQueue: {
      name: 'events-queue',
      options: {
        durable: true
      },
      routingKey: [],
      exchange: ''
    }
  },
  exchanges: {
  },
  connectionOptions: (() => {
    const url = new URL(env.RABBITMQ_HOST);
    const username = env.RABBITMQ_USERNAME;
    const password = env.RABBITMQ_PASSWORD;
    const { protocol, hostname, port } = url;
    return {
      protocol: protocol.slice(0, -1),
      hostname,
      port,
      username,
      password,
      heartbeat: 10,
      uri: url.href
    };
  })()
};
