import path from 'path';
import fs from 'fs-extra';
import { env } from './preload';


export const tasksConfig: {
  tasksStatusLoggingFile: string
} = {
  tasksStatusLoggingFile: path.resolve(process.cwd(), env.TASK_LOGGING_FILE)
};


fs.ensureFileSync(tasksConfig.tasksStatusLoggingFile);
