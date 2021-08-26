import { CreateTaskService } from '../../services/tasks/create-task.service';
import { ListTasksService } from '../../services/tasks/list-tasks.service';
import { makeServiceRunner } from '../utils';

export default {
  create: makeServiceRunner(CreateTaskService, req => ({ ...req.body as Record<string, unknown> })),
  list: makeServiceRunner(ListTasksService, req => ({ ...req.params }))
};
