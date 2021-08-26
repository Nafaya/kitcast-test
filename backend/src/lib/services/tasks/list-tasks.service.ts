/* eslint-disable @typescript-eslint/require-await */
import Joi from 'joi';
import ServiceBase from '../base.service';
import { dumpTask, IDumpTaskOutput } from '../../utils/dumps';
import { ValidationError } from '../../utils/X';
import { tasksMessageQueue } from '../../singletons/tasks-message-queue.singleton';

export class ListTasksService extends ServiceBase {
  async execute(): Promise<IDumpTaskOutput[]> {
    const tasks = await tasksMessageQueue.getAll();
    return tasks.map(dumpTask);
  }

  translateError(e : Error) : never {
    this.logger.error(e);
    if (e instanceof Joi.ValidationError) {
      throw new ValidationError(e.message);
    }
    throw e;
  }
}
