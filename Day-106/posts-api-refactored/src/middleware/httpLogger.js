// src/middleware/httpLogger.js

import morgan from 'morgan';
import { morganStream } from '../utils/logger.js';

// ============================================================
// CUSTOM TOKENS
// ============================================================

// Request ID
morgan.token('id', (req) => req.id || '-');

// Real IP (handles proxies)
morgan.token('real-ip', (req) => {
  return req.ip ||
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.connection?.remoteAddress ||
    '-';
});

// User ID (if authenticated)
morgan.token('userId', (req) => req.userId || '-');

// User email
morgan.token('userEmail', (req) => req.user?.email || '-');

// Content length (response)
morgan.token('content-length', (req, res) => {
  const length = res.getHeader('content-length');
  return length ? length : '-';
});

// Skip function — don't log health checks
function skipHealthCheck(req) {
  return req.path === '/health' || req.path === '/favicon.ico';
}

// ============================================================
// FORMATS
// ============================================================

// Development: pretty, concise, colored
const devFormat = ':id :method :url :status :response-time ms - :userId';

// Production: structured JSON-friendly
const prodFormat = JSON.stringify({
  requestId: ':id',
  method: ':method',
  url: ':url',
  status: ':status',
  responseTime: ':response-time',
  ip: ':real-ip',
  userId: ':userId',
  userAgent: ':user-agent',
  contentLength: ':content-length',
});

// ============================================================
// EXPORTED MIDDLEWARE
// ============================================================

export function httpLogger() {
  const isProduction = process.env.NODE_ENV === 'production';

  return morgan(isProduction ? prodFormat : devFormat, {
    stream: morganStream,
    skip: skipHealthCheck,
  });
}