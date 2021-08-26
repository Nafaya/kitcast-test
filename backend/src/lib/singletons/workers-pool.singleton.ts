import path from 'path';
import config from '../../config';
import { WorkersPool } from '../managers/workers-pool';

export const workersPool = new WorkersPool(
  config.workers.workersNumber,
  path.resolve(__dirname, '../workers/tasks.worker.js')
);
