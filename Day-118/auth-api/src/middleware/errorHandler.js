// src/middleware/errorHandler.js

import multer from 'multer';
import { AppError } from '../errors/AppError.js';
import logger from '../utils/logger.js';

export function notFoundHandler(req, res, next) {
  next(new AppError(`Cannot ${req.method} ${req.originalUrl}`, 404, 'ROUTE_NOT_FOUND'));
}

export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  let error = err;

  if (err instanceof multer.MulterError) {
    const map = {
      LIMIT_FILE_SIZE: ['File too large', 413, 'FILE_TOO_LARGE'],
      LIMIT_FILE_COUNT: ['Too many files', 400, 'TOO_MANY_FILES'],
      LIMIT_UNEXPECTED_FILE: [`Unexpected field: ${err.field}`, 400, 'UNEXPECTED_FIELD'],
    };
    const [msg, code, c] = map[err.code] || [err.message, 400, 'UPLOAD_ERROR'];
    error = new AppError(msg, code, c);
  } else if (!(err instanceof AppError)) {
    error = new AppError(
      err.message || 'Internal server error',
      err.statusCode || 500,
      err.code || 'INTERNAL_ERROR'
    );
  }

  const meta = {
    requestId: req.id, method: req.method, url: req.originalUrl,
    statusCode: error.statusCode, code: error.code, userId: req.userId, ip: req.ip,
  };

  if (error.statusCode >= 500) {
    logger.error(error.message, { ...meta, stack: error.stack, details: error.details });
  } else {
    logger.warn(error.message, { ...meta, details: error.details });
  }

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
  if (process.env.NODE_ENV !== 'production' && error.stack) response.stack = error.stack;

  res.status(error.statusCode).json(response);
}