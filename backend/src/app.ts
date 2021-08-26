import express, { Request, Response, NextFunction } from 'express';
import middlewares from './lib/middlewares';
import routers from './lib/routers';
import { NotFoundError, ValidationError } from './lib/utils/X';

const app = express();
app.use(middlewares.setTraceId);
app.use(middlewares.setLogger);
app.use(middlewares.logRequestBasicInfo);
app.use(middlewares.json);
app.use(middlewares.text);
app.use(middlewares.urlencoded);
app.use(middlewares.cors);

app.use(routers.tasks);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  if (err instanceof NotFoundError) {
    res.status(404).send({
      error: {
        message: err.message || 'Something went wrong. Try again later'
      }
    });
  } else if (err instanceof ValidationError) {
    res.status(400).send({
      error: {
        message: err.message || 'Something went wrong. Try again later'
      }
    });
  } else {
    res.status(500).send({
      error: {
        message: 'Something went wrong. Try again later'
      }
    });
  }
});

export default app;
