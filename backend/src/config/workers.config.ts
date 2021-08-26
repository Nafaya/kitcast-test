import { env } from './preload';


export const workersConfig: {
  workersNumber: number
} = {
  workersNumber: parseInt(env.WORKERS_NUMBER, 10) || 5
};

