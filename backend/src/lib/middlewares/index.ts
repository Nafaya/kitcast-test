import bodyParser from 'body-parser';
import cors from 'cors';
import setTraceId from './set-trace-id.middleware';
import setLogger from './set-logger.middleware';
import logRequestBasicInfo from './log-request-basic-info.middleware';

export default {
  setTraceId,
  setLogger,
  logRequestBasicInfo,
  json: bodyParser.json({
    limit: 1024 * 1024,
    verify: (_req, _res, buf) => {
      try {
        JSON.parse(buf.toString());
      } catch (e) {
        throw new Error('Broken json');
      }
    }
  }),
  text: bodyParser.text({ limit: 1024 * 1024 }),
  urlencoded: bodyParser.urlencoded({ extended: true, limit: 1024 * 1024 }),
  cors: cors({ origin: '*' })
};
