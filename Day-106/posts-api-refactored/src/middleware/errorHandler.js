// src/middleware/errorHandler.js (updated)

import chalk from 'chalk';
import multer from 'multer';
import { AppError } from '../errors/AppError.js';

export function notFoundHandler(req, res, next) {
  next(new AppError(
    `Cannot ${req.method} ${req.originalUrl}`,
    404,
    'ROUTE_NOT_FOUND'
  ));
}

export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  // ============================================================
  // Normalize multer errors
  // ============================================================

  let error = err;

  if (err instanceof multer.MulterError) {
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        error = new AppError(
          'File too large',
          413,
          'FILE_TOO_LARGE',
          { field: err.field, maxSize: '5MB' }
        );
        break;
      case 'LIMIT_FILE_COUNT':
        error = new AppError('Too many files', 400, 'TOO_MANY_FILES');
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        error = new AppError(
          `Unexpected file field: ${err.field}`,
          400,
          'UNEXPECTED_FILE_FIELD',
          { field: err.field, hint: 'Use field name "avatar"' }
        );
        break;
      default:
        error = new AppError(err.message, 400, 'UPLOAD_ERROR');
    }
  } else if (!(err instanceof AppError)) {
    // Handle our own ValidationError from fileFilter
    if (err.name === 'ValidationError') {
      error = err;
    } else {
      error = new AppError(
        err.message || 'Internal server error',
        err.statusCode || 500,
        err.code || 'INTERNAL_ERROR'
      );
    }
  }

  // Log
  const statusColor = error.statusCode >= 500 ? chalk.red :
                      error.statusCode >= 400 ? chalk.yellow : chalk.gray;
  console.log('\n' + chalk.gray('─'.repeat(60)));
  console.log(chalk.bold.red('❌ ERROR'), chalk.gray(`[${new Date().toLocaleTimeString()}]`));
  console.log(chalk.gray('─'.repeat(60)));
  console.log(chalk.white('  Request:  ') + chalk.cyan(`${req.method} ${req.originalUrl}`));
  console.log(chalk.white('  Status:   ') + statusColor(error.statusCode));
  console.log(chalk.white('  Code:     ') + chalk.magenta(error.code));
  console.log(chalk.white('  Message:  ') + chalk.white(error.message));
  if (error.details) {
    console.log(chalk.white('  Details:  ') + chalk.gray(JSON.stringify(error.details)));
  }
  console.log(chalk.gray('─'.repeat(60)) + '\n');

  const response = {
    success: false,
    error: error.message,
    code: error.code,
    statusCode: error.statusCode,
    timestamp: error.timestamp || new Date().toISOString(),
    path: req.originalUrl,
  };

  if (error.details) response.details = error.details;
  if (process.env.NODE_ENV !== 'production' && error.stack) {
    response.stack = error.stack;
  }

  res.status(error.statusCode).json(response);
}