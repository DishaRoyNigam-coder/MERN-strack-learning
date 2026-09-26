// middleware/errorHandler.js

import chalk from 'chalk';
import { AppError } from '../errors/index.js';
import { STATUS_TEXT } from '../utils/statusCodes.js';

export function notFoundHandler(req, res, next) {
  next(new AppError(
    `Cannot ${req.method} ${req.originalUrl}`,
    404,
    'ROUTE_NOT_FOUND'
  ));
}

export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  // Normalize
  let error = err instanceof AppError
    ? err
    : normalizeUnknownError(err);

  // Log
  logError(error, req);

  // Response
  const isDev = process.env.NODE_ENV !== 'production';
  const response = {
    success: false,
    error: error.message,
    code: error.code,
    statusCode: error.statusCode,
    statusText: STATUS_TEXT[error.statusCode] || 'Unknown',
    timestamp: error.timestamp,
    path: req.originalUrl,
    method: req.method,
  };

  if (error.details) response.details = error.details;
  if (isDev && error.stack) response.stack = error.stack;

  res.status(error.statusCode).json(response);
}

function normalizeUnknownError(err) {
  // Body parser errors
  if (err.type === 'entity.parse.failed') {
    return new AppError('Invalid JSON in request body', 400, 'INVALID_JSON', { original: err.message });
  }
  if (err.type === 'entity.too.large') {
    return new AppError('Request body too large', 413, 'PAYLOAD_TOO_LARGE');
  }

  // Default
  return new AppError(
    err.message || 'Internal server error',
    err.statusCode || 500,
    err.code || 'INTERNAL_ERROR'
  );
}

function logError(error, req) {
  const statusColor = error.statusCode >= 500 ? chalk.red :
                      error.statusCode >= 400 ? chalk.yellow : chalk.gray;
  const icon = error.statusCode >= 500 ? '🔴' :
               error.statusCode >= 400 ? '🟡' : '⚪';

  console.log('\n' + chalk.gray('─'.repeat(60)));
  console.log(`${icon} ${chalk.bold.red('ERROR')} ${chalk.gray(`[${new Date().toLocaleTimeString()}]`)}`);
  console.log(chalk.gray('─'.repeat(60)));
  console.log(chalk.white('  Request:  ') + chalk.cyan(`${req.method} ${req.originalUrl}`));
  console.log(chalk.white('  Status:   ') + statusColor(`${error.statusCode} ${STATUS_TEXT[error.statusCode] || ''}`));
  console.log(chalk.white('  Code:     ') + chalk.magenta(error.code));
  console.log(chalk.white('  Message:  ') + chalk.white(error.message));
  if (error.details) {
    console.log(chalk.white('  Details:  ') + chalk.gray(JSON.stringify(error.details, null, 2).replace(/\n/g, '\n            ')));
  }
  console.log(chalk.gray('─'.repeat(60)) + '\n');
}