import { Response, Request, RequestHandler, NextFunction } from 'express';
import { createLogger } from '../utils/logger';
import ServiceBase from '../services/base.service';

function defaultSuccessResponseHandler(req: Request, res: Response, next: NextFunction, result: Record<string, unknown>) : void {
  res.send(result);
}
function defaultFailureResponseHandler(req: Request, res: Response, next: NextFunction, error: Error) : void {
  next(error);
}

export function makeServiceRunner(
  ServiceClass: typeof ServiceBase,
  paramBuilder: (x: Request) => Record<string, unknown> = () => ({}),
  contextBuilder: (x: Request) => Record<string, unknown> = () => ({}),
  successResponseHandler: (req: Request, res: Response, next: NextFunction, result: Record<string, unknown>) => void = defaultSuccessResponseHandler,
  failureResponseHandler: (req: Request, res: Response, next: NextFunction, error: Error) => void = defaultFailureResponseHandler
) : RequestHandler {
  const name = ServiceClass.name;
  return async (req, res, next) => {
    if (!req.traceId || !req.logger) throw new Error('!req.traceId || !req.logger');

    const traceId = req.traceId;
    const logger = req.logger;
    try {
      const context = contextBuilder(req);
      const params = paramBuilder(req);
      logger.info(`Executing service ${name} with params ${JSON.stringify(params)} and context ${JSON.stringify(context)}`);

      const service = new ServiceClass({ context, logger: createLogger(`${traceId}(${name})`), traceId });
      const result = await service.run(params);

      logger.info(`Service ${name} successfully finished with result ${JSON.stringify(result)}`);

      successResponseHandler(req, res, next, result);
    } catch (e) {
      logger.warn(e);
      failureResponseHandler(req, res, next, e);
    }
  };
}
