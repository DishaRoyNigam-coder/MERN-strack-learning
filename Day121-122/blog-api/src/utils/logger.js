// src/utils/logger.js

import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';
import { fileURLToPath } from 'url';
import { loggerConfig } from '../config/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOG_DIR = path.join(__dirname, '../..', loggerConfig.dir);

const SENSITIVE_KEYS = [
  'password', 'passwordHash', 'confirmPassword', 'currentPassword',
  'newPassword', 'token', 'accessToken', 'refreshToken', 'resetToken',
  'authorization', 'cookie', 'cookies', 'secret', 'apiKey',
];

function redact(obj, seen = new WeakSet()) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (seen.has(obj)) return '[Circular]';
  seen.add(obj);
  if (Array.isArray(obj)) return obj.map(i => redact(i, seen));

  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const lk = key.toLowerCase();
    if (SENSITIVE_KEYS.some(sk => lk.includes(sk.toLowerCase()))) {
      result[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      result[key] = redact(value, seen);
    } else {
      result[key] = value;
    }
  }
  return result;
}

const addMetadata = winston.format((info) => {
  info.service = loggerConfig.service;
  info.version = loggerConfig.version;
  info.env = loggerConfig.env;
  return info;
});

const redactSensitive = winston.format((info) => redact(info));

const prettyFormat = winston.format.printf(({ level, message, timestamp, ...meta }) => {
  const ts = timestamp ? new Date(timestamp).toLocaleTimeString() : '';
  const colors = { error: '\x1b[31m', warn: '\x1b[33m', info: '\x1b[32m', http: '\x1b[36m', debug: '\x1b[90m' };
  const reset = '\x1b[0m';
  const c = colors[level] || '';
  const { service, version, env, ...rest } = meta;
  const extras = Object.keys(rest).length ? '\n  ' + JSON.stringify(rest, null, 2).split('\n').join('\n  ') : '';
  return `${c}[${ts}] ${level.toUpperCase().padEnd(5)}${reset} ${message}${extras}`;
});

const transports = [];

if (loggerConfig.toConsole) {
  transports.push(new winston.transports.Console({
    format: loggerConfig.pretty
      ? winston.format.combine(winston.format.timestamp(), redactSensitive(), addMetadata(), prettyFormat)
      : winston.format.combine(winston.format.timestamp(), redactSensitive(), addMetadata(), winston.format.json()),
  }));
}

if (loggerConfig.toFile) {
  transports.push(new winston.transports.DailyRotateFile({
    dirname: LOG_DIR,
    filename: 'app-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: loggerConfig.maxSize,
    maxFiles: loggerConfig.maxFiles,
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      redactSensitive(),
      addMetadata(),
      winston.format.json()
    ),
  }));

  transports.push(new winston.transports.DailyRotateFile({
    dirname: LOG_DIR,
    filename: 'error-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: loggerConfig.maxSize,
    maxFiles: '30d',
    level: 'error',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      redactSensitive(),
      addMetadata(),
      winston.format.json()
    ),
  }));
}

const logger = winston.createLogger({
  level: loggerConfig.level,
  levels: winston.config.npm.levels,
  transports,
  exitOnError: false,
});

export const morganStream = { write: (msg) => logger.http(msg.trim()) };

export default logger;