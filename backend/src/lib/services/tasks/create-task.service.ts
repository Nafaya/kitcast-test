/* eslint-disable @typescript-eslint/require-await */
import Joi from 'joi';
import { v4 as uuidv4 } from 'uuid';
import ServiceBase from '../base.service';
import { dumpTask, IDumpTaskOutput } from '../../utils/dumps';
import { ValidationError } from '../../utils/X';
import { tasksMessageQueue } from '../../singletons/tasks-message-queue.singleton';

export interface ICreateTaskServiceInput { timeoutInSeconds: number }

export class CreateTaskService extends ServiceBase {
  static validationSchema = Joi.object({
    timeoutInSeconds: Joi.number().positive()
  });

  validate(params : unknown): ICreateTaskServiceInput {
    const result = CreateTaskService.validationSchema.validate(params);

    if (result.error) throw result.error;

    return result.value as ICreateTaskServiceInput;
  }

  async execute({ timeoutInSeconds } : ICreateTaskServiceInput): Promise<IDumpTaskOutput> {
    const task = { id: uuidv4(), timeoutInSeconds };
    await tasksMessageQueue.publish(task);
    return dumpTask(task);
  }

  translateError(e : Error) : never {
    this.logger.error(e);
    if (e instanceof Joi.ValidationError) {
      throw new ValidationError(e.message);
    }
    throw e;
  }
}
