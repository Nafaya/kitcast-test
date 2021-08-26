import { EventEmitter2 } from 'eventemitter2';
import { connect, AmqpConnectionManagerOptions, ChannelWrapper } from 'amqp-connection-manager';
import { IAmqpConnectionManager } from 'amqp-connection-manager/dist/esm/AmqpConnectionManager';
import { Channel, ConfirmChannel, ConsumeMessage, Options } from 'amqplib';

export class Nack {
  constructor(private readonly _requeue: boolean = false) {}

  get requeue(): boolean {
    return this._requeue;
  }
}

export enum MessageHandlerErrorBehavior {
  ACK = 'ACK',
  NACK = 'NACK',
  REQUEUE = 'REQUEUE',
}

export type MessageErrorHandler = (
  channel: Channel,
  msg: ConsumeMessage,
  error: any
) => Promise<void> | void;

/**
 * An error handler that will ack the message which caused an error during processing
 */
export const ackErrorHandler: MessageErrorHandler = (channel, msg) => {
  channel.ack(msg);
};

/**
 * An error handler that will nack and requeue a message which created an error during processing
 */
export const requeueErrorHandler: MessageErrorHandler = (channel, msg) => {
  channel.nack(msg, false, true);
};

/**
 * An error handler that will nack a message which created an error during processing
 */
export const defaultNackErrorHandler: MessageErrorHandler = (channel, msg) => {
  channel.nack(msg, false, false);
};

export const getHandlerForLegacyBehavior = (behavior: MessageHandlerErrorBehavior): MessageErrorHandler => {
  switch (behavior) {
    case MessageHandlerErrorBehavior.ACK:
      return ackErrorHandler;
    case MessageHandlerErrorBehavior.REQUEUE:
      return requeueErrorHandler;
    default:
      return defaultNackErrorHandler;
  }
};

export interface IQueueOptions {
  name: string,
  // json?: boolean,
  handler(msg: any | undefined, rawMessage?: ConsumeMessage): Promise<any>,
  errorHandler?(channel: Channel, msg: ConsumeMessage, error: Error): Promise<void>,
  options: {
    durable?: boolean,
    messageTtl?: number,
    deadLetterExchange?: string,
  },
  routingKey: string|string[],
  exchange: string
}
export interface IExchangeOptions {
  name: string,
  type: 'fanout',
  options: {
    durable?: boolean
  }
}


export class MessageQueue extends EventEmitter2 {
  private connection: IAmqpConnectionManager;
  private channel: ChannelWrapper;

  constructor(
    urls: string[],
    options: AmqpConnectionManagerOptions,
    { queues, exchanges, prefetchCount } : { queues?: IQueueOptions[], exchanges?: IExchangeOptions[], prefetchCount?: number } = {}
  ) {
    super();
    this.connection = connect(urls, options);
    this.channel = this.connection.createChannel({
      json: true,
      setup: async (channel: ConfirmChannel) => {
        await channel.prefetch(prefetchCount);
        for (const configExchange of exchanges) {
          await channel.assertExchange(
            configExchange.name,
            configExchange.type,
            configExchange.options
          );
        }
        for (const configQueue of queues) {
          const { queue } = await channel.assertQueue(
            configQueue.name,
            configQueue.options
          );
          const routingKeys = Array.isArray(configQueue.routingKey) ? configQueue.routingKey : [ configQueue.routingKey ];
          await Promise.all(
            routingKeys.map((x) => channel.bindQueue(queue, configQueue.exchange, x))
          );

          await channel.consume(queue, async msg => {
            try {
              if (msg === null) {
                throw new Error('Received null message');
              }

              const response = await this.handleMessage(
                configQueue.handler,
                msg,
                false
              );

              if (response instanceof Nack) {
                channel.nack(msg, false, response.requeue);
                return;
              }

              if (response) {
                throw new Error(
                  'Received response from subscribe handler. Subscribe handlers should only return void'
                );
              }

              channel.ack(msg);
            } catch (e) {
              if (msg === null) {
                return;
              } else {
                const errorHandler =
                  configQueue.errorHandler ||
                  getHandlerForLegacyBehavior(MessageHandlerErrorBehavior.NACK);

                await errorHandler(channel, msg, e);
              }
            }
          });
        }
      }
    });
  }

  private handleMessage<T, U>(
    handler: (msg: T | undefined, rawMessage?: ConsumeMessage) => Promise<U>,
    msg: ConsumeMessage,
    allowNonJsonMessages?: boolean
  ) {
    let message: T | undefined;
    if (msg.content) {
      if (allowNonJsonMessages) {
        try {
          message = JSON.parse(msg.content.toString()) as T;
        } catch {
          // Let handler handle parsing error, it has the raw message anyway
          message = undefined;
        }
      } else {
        message = JSON.parse(msg.content.toString()) as T;
      }
    }

    return handler(message, msg);
  }

  public async publish(
    exchange: string,
    routingKey: string,
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    message: any,
    options?: Options.Publish
  ): Promise<void> {
    // source amqplib channel is used directly to keep the behavior of throwing connection related errors
    if (!this.connection.isConnected() || !this.channel) {
      throw new Error('AMQP connection is not available');
    }

    let buffer: Buffer;
    if (message instanceof Buffer) {
      buffer = message;
    } else if (message instanceof Uint8Array) {
      buffer = Buffer.from(message);
    } else if (message !== null) {
      buffer = Buffer.from(JSON.stringify(message));
    } else {
      buffer = Buffer.alloc(0);
    }

    await this.channel.publish(exchange, routingKey, buffer, options);
  }
}
