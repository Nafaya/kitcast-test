import fs from 'fs-extra';
import config from '../../config';
import { RedisMessageQueue } from '../managers/redis-message-queue';
import { ITask } from '../services/tasks/dto/task.dto';
import { workersPool } from './workers-pool.singleton';

export const tasksMessageQueue = new RedisMessageQueue(
  config.redis.connectionOptions,
  {
    ...config.redis.tasks,
    maxProcessingMessagesCount: config.workers.workersNumber
  }
);

tasksMessageQueue.on('message', async (task: ITask) => {
  await workersPool.runTaskAsync(task);
});
tasksMessageQueue.on('startProcessing', async (task: ITask) => {
  await fs.appendFile(config.tasks.tasksStatusLoggingFile, `${new Date().toISOString()}: ${task.id} started\r\n`);
});
tasksMessageQueue.on('finishedProcessing', async (task: ITask) => {
  await fs.appendFile(config.tasks.tasksStatusLoggingFile, `${new Date().toISOString()}: ${task.id} finished\r\n`);
});

// import config from '../../config';
// import { MessageQueue } from '../managers/rabbitmq-message-queue';
// import { ITask } from '../services/tasks/dto/task.dto';
// import { workersPool } from './workers-pool.singleton';

// export const tasksMessageQueue = new MessageQueue(
//   [ config.rabbitmq.connectionOptions.uri ],
//   {},
//   {
//     queues: [
//       {
//         ...config.rabbitmq.queues.eventsQueue,
//         handler: async (msg: ITask) => {
//           await workersPool.runTaskAsync(msg);
//         }
//       }
//     ],
//     exchanges: Object.values(config.rabbitmq.exchanges),
//     prefetchCount: config.workers.workersNumber
//   }
// );
