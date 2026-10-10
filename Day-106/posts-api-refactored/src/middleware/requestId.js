// src/middleware/requestId.js

import crypto from 'crypto';

/**
 * Generate a unique request ID and attach it to:
 * - req.id (for logging)
 * - X-Request-Id response header (for client debugging)
 * - res.locals.requestId (for templates/views)
 */
export function requestIdMiddleware(req, res, next) {
  // Prefer client's request ID if present (helps with tracing)
  const existingId = req.headers['x-request-id'];
  const id = existingId || `req-${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;

  req.id = id;
  res.locals.requestId = id;
  res.setHeader('X-Request-Id', id);

  next();
}