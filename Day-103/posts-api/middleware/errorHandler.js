// middleware/errorHandler.js

import chalk from 'chalk';
import { AppError } from '../error/AppError.js';

export function notFoundHandler(req, res, next) {
  next(new AppError(
    `Route not found: ${req.method} ${req.originalUrl}`,
    404,
    'ROUTE_NOT_FOUND'
  ));
}

export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  const error = err instanceof AppError
    ? err
    : new AppError(err.message, err.statusCode || 500, err.code || 'INTERNAL_ERROR');

  // Log
  const statusColor = error.statusCode >= 500 ? chalk.red :
                      error.statusCode >= 400 ? chalk.yellow : chalk.gray;

  console.log('\n' + chalk.gray('─'.repeat(60)));
  console.log(chalk.bold.red('❌ ERROR'), chalk.gray(`[${new Date().toLocaleTimeString()}]`));
  console.log(chalk.gray('─'.repeat(60)));
  console.log(chalk.white('  Path:    ') + chalk.cyan(`${req.method} ${req.originalUrl}`));
  console.log(chalk.white('  Status:  ') + statusColor(error.statusCode));
  console.log(chalk.white('  Code:    ') + chalk.magenta(error.code));
  console.log(chalk.white('  Message: ') + chalk.white(error.message));
  if (error.details) {
    console.log(chalk.white('  Details: ') + chalk.gray(JSON.stringify(error.details)));
  }
  console.log(chalk.gray('─'.repeat(60)) + '\n');

  const response = {
    success: false,
    error: error.message,
    code: error.code,
    statusCode: error.statusCode,
    timestamp: error.timestamp,
    path: req.originalUrl,
  };

  if (error.details) response.details = error.details;
  if (process.env.NODE_ENV !== 'production' && error.stack) {
    response.stack = error.stack;
  }

  res.status(error.statusCode).json(response);
}