// src/middleware/errorHandler.js

import multer from 'multer';
import { AppError } from '../errors/AppError.js';
import logger from '../utils/logger.js';

export function notFoundHandler(req, res, next) {
  next(new AppError(
    `Cannot ${req.method} ${req.originalUrl}`,
    404,
    'ROUTE_NOT_FOUND'
  ));
}

export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  // Normalize multer errors
  let error = err;
  if (err instanceof multer.MulterError) {
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        error = new AppError('File too large', 413, 'FILE_TOO_LARGE');
        break;
      case 'LIMIT_FILE_COUNT':
        error = new AppError('Too many files', 400, 'TOO_MANY_FILES');
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        error = new AppError(
          `Unexpected file field: ${err.field}`,
          400,
          'UNEXPECTED_FILE_FIELD'
        );
        break;
      default:
        error = new AppError(err.message, 400, 'UPLOAD_ERROR');
    }
  } else if (!(err instanceof AppError) && err.name !== 'ValidationError') {
    error = new AppError(
      err.message || 'Internal server error',
      err.statusCode || 500,
      err.code || 'INTERNAL_ERROR'
    );
  }

  // ============================================================
  // LOG THE ERROR
  // ============================================================

  const logMeta = {
    requestId: req.id,
    method: req.method,
    url: req.originalUrl,
    statusCode: error.statusCode,
    code: error.code,
    userId: req.userId,
    ip: req.ip,
  };

  // 5xx = error level, 4xx = warn level
  if (error.statusCode >= 500) {
    logger.error(error.message, {
      ...logMeta,
      stack: error.stack,
      details: error.details,
    });
  } else {
    logger.warn(error.message, {
      ...logMeta,
      details: error.details,
    });
  }

  // ============================================================
  // SEND RESPONSE
  // ============================================================

  const response = {
    success: false,
    error: error.message,
    code: error.code,
    statusCode: error.statusCode,
    requestId: req.id,
    timestamp: error.timestamp || new Date().toISOString(),
    path: req.originalUrl,
  };

  if (error.details) response.details = error.details;
  if (process.env.NODE_ENV !== 'production' && error.stack) {
    response.stack = error.stack;
  }

  res.status(error.statusCode).json(response);
}