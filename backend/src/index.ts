import { Server } from 'http';
import Bluebird from 'bluebird';
import app from './app';
import { createLogger } from './lib/utils/logger';
import { tasksMessageQueue } from './lib/singletons/tasks-message-queue.singleton';

const logger = createLogger('App');
let server : null | Server = null;

shutUp().catch(e => {
  console.error(e);
  process.exit(1);
});

async function shutUp(): Promise<void> {
  await tasksMessageQueue.init();
  await Bluebird.fromCallback(cb => {
    const PORT = process.env.APP_PORT ?? 3000;

    server = app.listen(PORT, () => {
      logger.info(`App is listening at ${PORT}`);
      cb(null);
    });
  });
}

async function shutDown(): Promise<void> {
  try {
    logger.info('Closing server');
    await Bluebird.fromCallback(cb => { server?.close(cb) ?? cb(null); });

    logger.info('Stopping message queue');
    await tasksMessageQueue.destroy();

    logger.info('Exit');
    process.exit(0);
  } catch (e) {
    logger.error(e);
    process.exit(1);
  }
}

// Subscribe to system signals
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal caught');

  shutDown().catch(console.error);
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal caught');

  shutDown().catch(console.error);
});
