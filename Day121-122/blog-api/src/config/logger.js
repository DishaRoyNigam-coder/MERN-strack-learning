// src/config/logger.js

import 'dotenv/config';

const isProduction = process.env.NODE_ENV === 'production';

export const loggerConfig = {
  level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
  dir: process.env.LOG_DIR || 'logs',
  maxSize: '20m',
  maxFiles: '14d',
  toFile: process.env.LOG_TO_FILE !== 'false',
  toConsole: process.env.LOG_TO_CONSOLE !== 'false',
  pretty: process.env.LOG_PRETTY === 'true' || !isProduction,
  service: 'auth-api',
  version: '1.0.0',
  env: process.env.NODE_ENV || 'development',
};