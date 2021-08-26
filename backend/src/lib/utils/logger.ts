import 'colors';
import { createLogger as createWinstonLogger, format, transports, Logger as WinstonLogger } from 'winston';
import { TransformableInfo } from 'logform';
import config from '../../config';

const pretty_log = config.logger.pretty;

export function createLogger(label?: string | { (): string }, tags?: unknown) : WinstonLogger {
  return createWinstonLogger({
    level: config.logger.logLevel,
    format: format.combine(
      format.timestamp(),
      ...label ? [ typeof label === 'function' ? { transform: (info: TransformableInfo): TransformableInfo => { info.label = label(); return info; } } : format.label({ label }) ] : [],
      ...tags ? [ { transform: (info: TransformableInfo): TransformableInfo => { info.tags = tags; return info; } } ] : [],
      format.metadata(),
      format.errors({ stack: true }),
      ...pretty_log ? [
        format.colorize(),
        format.printf((info: TransformableInfo) => {
          const l = info.metadata.label;
          let m = info.message as any;
          if (m instanceof Error) m = m;
          else if (typeof m === 'object') m = JSON.stringify(m);
          return `${info.metadata.timestamp} ${info.level} ${l ? `[${l}]` : ''} - ${m} ${info.stack ? `\r\n${info.stack}` : ''}`;
        })
      ] : [ format.json() ]
    ),
    transports: [ new transports.Console() ]
  });
}

const defaultLogger = createLogger();

export default defaultLogger;
