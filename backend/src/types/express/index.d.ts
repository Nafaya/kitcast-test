import { Logger } from 'winston';

declare global{
  namespace Express {
    interface Request {
      logger? : Logger
      traceId? : string
    }
  }
}
