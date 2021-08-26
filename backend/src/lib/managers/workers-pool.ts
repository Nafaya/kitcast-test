import { EventEmitter } from 'stream';
import { Worker, WorkerOptions } from 'worker_threads';
import { Logger as WinstonLogger } from 'winston';
import { createLogger } from '../utils/logger';


interface IQueueElement {
  data: any;
  reject(error?: any): void;
  resolve(thenableOrResult?: unknown):  void;
}

export class WorkersPool  extends EventEmitter {
  private initialized = false;
  private freeWorkers: Set<Worker>;
  private readonly numWorkers: number;
  private readonly filename: string;
  private readonly workerOptions?: WorkerOptions;
  private readonly logger: WinstonLogger;
  private readonly queue: IQueueElement[] = [];

  constructor(numWorkers: number, filename: string, workerOptions?: WorkerOptions) {
    super();
    this.numWorkers = numWorkers;
    this.filename = filename;
    this.workerOptions = workerOptions;
    this.init();
    this.logger = createLogger(filename);
    this.queue = [];
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public runTask(inputData: any): void {
    void this.runTaskAsync(inputData).catch(() => {
      return;
    });
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public runTaskAsync<T = any>(inputData: any): Promise<T> {
    let resolve : IQueueElement['resolve'];
    let reject : IQueueElement['reject'];
    const promise = new Promise<T>((_resolve, _reject) => {
      resolve = _resolve as IQueueElement['resolve'];
      reject = _reject;
    });

    this.queue.push({
      data: inputData,
      resolve,
      reject
    });
    this.runNext();

    return promise;
  }

  private runNext() {
    if (!this.queue.length || !this.freeWorkers.size) return;
    let respawnedWorker = false;
    const taskData = this.queue.pop();
    const worker = this.freeWorkers.values().next().value as Worker;
    this.freeWorkers.delete(worker);

    worker.postMessage(taskData.data);

    worker.on('message', (responseData: any) => {
      taskData.resolve(responseData);
      this.freeWorkers.add(worker);
    });
    worker.on('exit', exitCode => {
      if (!respawnedWorker) {
        this.logger.error(`Worker exited with exitCode ${exitCode}`);
        taskData.reject(`Worker exited with exitCode ${exitCode}`);
        respawnedWorker = true;
        this.spawnWorker();
      }
    });
    worker.on('error', (error: Error) => {
      this.logger.error(`Worker exited with error ${error}`);
      taskData.reject(`Worker exited with error ${error}`);
      if (!respawnedWorker) {
        respawnedWorker = true;
        this.spawnWorker();
      }
    });
    worker.on('messageerror', async (error) => {
      this.logger.error(`Bad response from worker ${error}`);
      await worker.terminate();
    });
  }

  private init() {
    if (this.initialized) return;
    this.freeWorkers = new Set();
    for (let i = 0; i < this.numWorkers; i++) this.spawnWorker();
    this.initialized = true;
  }

  private spawnWorker() {
    const worker = new Worker(this.filename, this.workerOptions);
    worker.on('exit', exitCode => {
      this.logger.error(`Worker exited with exitCode ${exitCode}`);
      if (this.freeWorkers.has(worker)) {
        this.freeWorkers.delete(worker);
        this.spawnWorker();
      }
    });
    worker.on('error', error => {
      this.logger.error(`Worker exited with error ${error}`);
      if (this.freeWorkers.has(worker)) {
        this.freeWorkers.delete(worker);
        this.spawnWorker();
      }
    });
    this.freeWorkers.add(worker);
  }
}
