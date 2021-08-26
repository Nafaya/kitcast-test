import { v4 } from 'uuid';
import { Request, Response, NextFunction } from 'express';

// declare module 'express' {
//   interface Request {
//     traceId? : string
//   }
// }

export default function setTraceId(req: Request, res: Response, next: NextFunction): void {
  req.traceId = v4();
  next(null);
}
