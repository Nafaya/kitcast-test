import { ITask } from '../services/tasks/dto/task.dto';

export interface IDumpTaskOutput {
    id: string,
    timeoutInSeconds: number
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function dumpTask({ id, timeoutInSeconds }: ITask): IDumpTaskOutput {
  return {
    id,
    timeoutInSeconds
  };
}
