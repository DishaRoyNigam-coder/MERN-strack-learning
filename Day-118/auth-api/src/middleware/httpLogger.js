// src/middleware/httpLogger.js

import morgan from 'morgan';
import { morganStream } from '../utils/logger.js';

morgan.token('id', (req) => req.id || '-');
morgan.token('userId', (req) => req.userId || '-');

const isProd = process.env.NODE_ENV === 'production';

export function httpLogger() {
  const format = isProd
    ? JSON.stringify({
        requestId: ':id', method: ':method', url: ':url', status: ':status',
        responseTime: ':response-time', ip: ':remote-addr', userId: ':userId',
      })
    : ':id :method :url :status :response-time ms - user=:userId';

  return morgan(format, {
    stream: morganStream,
    skip: (req) => req.path === '/health' || req.path === '/favicon.ico',
  });
}