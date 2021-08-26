import { EventEmitter2 } from 'eventemitter2';
import Redis, { RedisOptions } from 'ioredis';
import { Logger as WinstonLogger } from 'winston';
import { createLogger } from '../utils/logger';

export class RedisMessageQueue extends EventEmitter2 {
  private publisher: Redis.Redis;
  private subscriber: Redis.Redis;
  private listName: string;
  private channelName: string;
  // private prefix: string;
  private retryTimeout: number;
  private checkInterval: NodeJS.Timer;
  private processingMessages: {
    [_: string]: boolean
  } = {};
  private processingMessagesCount = 0;
  private maxProcessingMessagesCount = 0;
  private readonly logger: WinstonLogger;
  private checking = false;

  constructor(
    connectionOptions: RedisOptions,
    { listName, channelName, retryTimeout, maxProcessingMessagesCount } : {
      listName: string,
      channelName: string,
      // prefix: string,
      retryTimeout: number,
      maxProcessingMessagesCount: number
    }
  ) {
    super();
    this.publisher = new Redis(connectionOptions);
    this.subscriber = new Redis(connectionOptions);
    this.listName = listName;
    this.channelName = channelName;
    // this.prefix = prefix;
    this.retryTimeout = retryTimeout;
    this.maxProcessingMessagesCount = maxProcessingMessagesCount;
    this.subscriber.on('message', this.checkQueue.bind(this));
    this.logger = createLogger(this.channelName);
  }

  public async init(): Promise<void> {
    await this.subscriber.subscribe(this.channelName);
    this.checkInterval = setInterval(this.checkQueue.bind(this), this.retryTimeout);
  }

  public async destroy(): Promise<void> {
    await this.subscriber.unsubscribe(this.channelName);
    clearInterval(this.checkInterval);
  }

  private async handleMessage(message: string): Promise<void> {
    this.processingMessagesCount++;
    this.processingMessages[message] = true;
    try {
      this.logger.info(`handleMessage start ${this.processingMessagesCount}, ${message}`);
      const parsed = JSON.parse(message);
      await this.emitAsync('startProcessing', parsed);
      await this.emitAsync('message', parsed);
      await this.emitAsync('finishedProcessing', parsed);
    } catch (e) {
      this.logger.error(e);
    }
    await this.publisher.lrem(this.listName, 1, message);
    this.processingMessagesCount--;
    delete this.processingMessages[message];
    this.logger.info(`handleMessage finish ${this.processingMessagesCount}, ${message}`);
    process.nextTick(() => this.checkQueue());
  }

  private async checkQueue() {
    this.logger.info(`checkQueue: ${this.processingMessagesCount}/${this.maxProcessingMessagesCount}`);
    if (this.checking || this.processingMessagesCount >= this.maxProcessingMessagesCount) return;
    this.logger.info('checkQueue 1');
    this.checking = true;
    const messages = await this.publisher.lrange(this.listName, 0, this.maxProcessingMessagesCount + 1);

    for (const message of messages) {
      if (message !== null && message !== undefined && !this.processingMessages[message]) {
        process.nextTick(() => this.handleMessage(message));
      }
    }
    this.checking = false;
  }

  public async publish(
    // id: string,
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    message: any
  ): Promise<void> {
    const serialized = JSON.stringify(message);
    await this.publisher.lpush(this.listName, serialized);
    await this.publisher.publish(this.channelName, serialized);
    // await this.connection.lpush(this.listName, id);
    // await this.connection.set(this.getKeyById(id), JSON.stringify(message));
    // await this.connection.publish(this.channelName, id);
  }

  public async getAll(): Promise<any[]> {
    return (await this.publisher.lrange(this.listName, 0, -1)).map(v => JSON.parse(v));
  }

  // public getKeyById(id: string): string {
  //   return `${this.prefix}${id}`;
  // }
}
