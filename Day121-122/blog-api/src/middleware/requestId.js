// src/middleware/requestId.js

import crypto from 'crypto';

export function requestIdMiddleware(req, res, next) {
  const existing = req.headers['x-request-id'];
  const id = existing || `req-${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
  req.id = id;
  res.locals.requestId = id;
  res.setHeader('X-Request-Id', id);
  next();
}