// src/middleware/rateLimit.js

import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { rateLimits } from '../config/rateLimits.js';
import logger from '../utils/logger.js';

function createLimiter(name, { windowMs, max }, extra = {}) {
  if (rateLimits.disabled) return (req, res, next) => next();

  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: 'Too many requests',
      code: 'RATE_LIMITED',
      statusCode: 429,
    },
    standardHeaders: 'draft-7',
    legacyHeaders: true,
    handler: (req, res, next, options) => {
      logger.warn('Rate limit hit', {
        limiter: name, ip: req.ip, method: req.method, url: req.originalUrl,
      });
      res.status(options.statusCode).json(options.message);
    },
    keyGenerator: extra.keyGenerator || ((req) => ipKeyGenerator(req)),
    skipSuccessfulRequests: extra.skipSuccessfulRequests ?? false,
    ...extra,
  });
}

export const loginLimiter = createLimiter('login', rateLimits.login, {
  keyGenerator: (req) => `${ipKeyGenerator(req)}-${(req.body?.email || '').toLowerCase()}`,
  skipSuccessfulRequests: true,
});

export const registerLimiter = createLimiter('register', rateLimits.register);

export const passwordResetLimiter = createLimiter('password-reset', rateLimits.passwordReset, {
  keyGenerator: (req) => `${ipKeyGenerator(req)}-${(req.body?.email || '').toLowerCase()}`,
});

export const generalLimiter = createLimiter('general', rateLimits.general, {
  keyGenerator: (req) => req.userId ? `user-${req.userId}` : ipKeyGenerator(req),
});