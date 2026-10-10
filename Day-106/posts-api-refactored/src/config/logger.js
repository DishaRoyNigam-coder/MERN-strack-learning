// src/config/logger.js

import 'dotenv/config';

const isProduction = process.env.NODE_ENV === 'production';

export const loggerConfig = {
  level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
  dir: process.env.LOG_DIR || 'logs',
  maxSize: process.env.LOG_MAX_SIZE || '20m',
  maxFiles: process.env.LOG_MAX_FILES || '14d',
  toFile: process.env.LOG_TO_FILE !== 'false',
  toConsole: process.env.LOG_TO_CONSOLE !== 'false',

  // Pretty-print in development, JSON in production
  pretty: process.env.LOG_PRETTY === 'true' || !isProduction,

  // Service metadata — helps when you have multiple services
  service: 'posts-api',
  version: '1.0.0',
  env: process.env.NODE_ENV || 'development',
};