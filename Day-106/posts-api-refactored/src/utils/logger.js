// src/utils/logger.js

import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';
import { fileURLToPath } from 'url';
import { loggerConfig } from '../config/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOG_DIR = path.join(__dirname, '../..', loggerConfig.dir);

// ============================================================
// SENSITIVE DATA REDACTION
// ============================================================

const SENSITIVE_KEYS = [
  'password',
  'passwordHash',
  'confirmPassword',
  'currentPassword',
  'newPassword',
  'token',
  'accessToken',
  'refreshToken',
  'authorization',
  'cookie',
  'cookies',
  'secret',
  'apiKey',
  'creditCard',
  'cardNumber',
  'cvv',
  'ssn',
  'resetToken',
];

/**
 * Recursively redact sensitive keys from an object.
 */
function redact(obj, seen = new WeakSet()) {
  if (obj === null || typeof obj !== 'object') return obj;

  // Prevent circular reference issues
  if (seen.has(obj)) return '[Circular]';
  seen.add(obj);

  if (Array.isArray(obj)) {
    return obj.map(item => redact(item, seen));
  }

  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();

    if (SENSITIVE_KEYS.some(sk => lowerKey.includes(sk.toLowerCase()))) {
      result[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      result[key] = redact(value, seen);
    } else {
      result[key] = value;
    }
  }
  return result;
}

// ============================================================
// CUSTOM FORMATS
// ============================================================

/**
 * Add service metadata to every log entry.
 */
const addServiceMetadata = winston.format((info) => {
  info.service = loggerConfig.service;
  info.version = loggerConfig.version;
  info.env = loggerConfig.env;
  info.hostname = process.env.HOSTNAME || 'localhost';
  return info;
});

/**
 * Redact sensitive fields from metadata.
 */
const redactSensitive = winston.format((info) => {
  return redact(info);
});

/**
 * Pretty-print format for development.
 */
const prettyFormat = winston.format.printf(({ level, message, timestamp, ...meta }) => {
  const ts = timestamp ? new Date(timestamp).toLocaleTimeString() : '';
  const levelColors = {
    error: '\x1b[31m',   // red
    warn: '\x1b[33m',    // yellow
    info: '\x1b[32m',    // green
    http: '\x1b[36m',    // cyan
    debug: '\x1b[90m',   // gray
  };
  const reset = '\x1b[0m';
  const color = levelColors[level] || '';

  // Remove extra metadata from print
  const { service, version, env, hostname, ...extras } = meta;
  const extrasStr = Object.keys(extras).length > 0
    ? '\n  ' + JSON.stringify(extras, null, 2).split('\n').join('\n  ')
    : '';

  return `${color}[${ts}] ${level.toUpperCase().padEnd(5)}${reset} ${message}${extrasStr}`;
});

// ============================================================
// TRANSPORTS
// ============================================================

const transports = [];

// Console transport (development + optional production)
if (loggerConfig.toConsole) {
  transports.push(
    new winston.transports.Console({
      format: loggerConfig.pretty
        ? winston.format.combine(
            winston.format.colorize({ all: false }),
            winston.format.timestamp(),
            redactSensitive(),
            addServiceMetadata(),
            prettyFormat
          )
        : winston.format.combine(
            winston.format.timestamp(),
            redactSensitive(),
            addServiceMetadata(),
            winston.format.json()
          ),
    })
  );
}

// File transports (rotated daily)
if (loggerConfig.toFile) {
  // All logs
  transports.push(
    new winston.transports.DailyRotateFile({
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
        addServiceMetadata(),
        winston.format.json()
      ),
    })
  );

  // Error logs only
  transports.push(
    new winston.transports.DailyRotateFile({
      dirname: LOG_DIR,
      filename: 'error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: loggerConfig.maxSize,
      maxFiles: '30d', // Keep errors longer
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        redactSensitive(),
        addServiceMetadata(),
        winston.format.json()
      ),
    })
  );
}

// ============================================================
// CREATE THE LOGGER
// ============================================================

const logger = winston.createLogger({
  level: loggerConfig.level,
  levels: winston.config.npm.levels, // error, warn, info, http, debug
  transports,
  // Don't exit on uncaught exceptions — log and continue if possible
  exitOnError: false,
});

// ============================================================
// STREAM FOR MORGAN
// ============================================================

/**
 * Morgan expects a `write` method that it calls with the log line.
 */
export const morganStream = {
  write: (message) => {
    // Morgan adds a trailing newline — strip it
    logger.http(message.trim());
  },
};

// ============================================================
// CONVENIENCE WRAPPERS
// ============================================================

export function logError(message, meta = {}) {
  logger.error(message, meta);
}

export function logWarn(message, meta = {}) {
  logger.warn(message, meta);
}

export function logInfo(message, meta = {}) {
  logger.info(message, meta);
}

export function logHttp(message, meta = {}) {
  logger.http(message, meta);
}

export function logDebug(message, meta = {}) {
  logger.debug(message, meta);
}

export default logger;