import { Request, Response, NextFunction } from 'express';

export default function setTraceId(req: Request, res: Response, next: NextFunction): void {
  if (!req.logger) return next(null);
  req.logger.info(`New request(${req.method} ${req.originalUrl}) from ${req.ip}`);
  next(null);
}
