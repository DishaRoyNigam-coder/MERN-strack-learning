
// src/middleware/rateLimit.js

import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import logger from '../utils/logger.js';
import { rateLimits } from '../config/rateLimits.js';

// ============================================================
// LOG RATE LIMIT HITS
// ============================================================

function logLimitHit(req, limiterName) {
  logger.warn('Rate limit hit', {
    limiter: limiterName,
    ip: req.ip,
    method: req.method,
    url: req.originalUrl,
    userId: req.userId,
  });

  // In production, your logger can send these events
  // to a centralized logging or monitoring service.
}

// ============================================================
// FACTORY: CREATE A LIMITER
// ============================================================

function createLimiter(name, { windowMs, max }, extraOptions = {}) {
  // In test/disabled mode, return a no-op middleware.
  if (rateLimits.disabled) {
    return (req, res, next) => next();
  }

  return rateLimit({
    windowMs,
    max,

    // Response returned when the rate limit is exceeded.
    message: {
      success: false,
      error: 'Too many requests',
      code: 'RATE_LIMITED',
      statusCode: 429,
      message:
        'You have exceeded the rate limit. Please try again later.',
    },

    standardHeaders: 'draft-7',
    legacyHeaders: true,

    // Custom handler for logging rate limit hits.
    handler: (req, res, next, options) => {
      logLimitHit(req, name);
      res.status(options.statusCode).json(options.message);
    },

    // Configure request counting behavior.
    skipSuccessfulRequests:
      extraOptions.skipSuccessfulRequests ?? false,

    skipFailedRequests:
      extraOptions.skipFailedRequests ?? false,

    // Custom key generator.
    keyGenerator:
      extraOptions.keyGenerator || ((req) => ipKeyGenerator(req.ip)),

    // Skip certain requests when required.
    skip: extraOptions.skip || (() => false),

    // Apply any additional limiter-specific options.
    ...extraOptions,
  });
}

// ============================================================
// 1. LOGIN LIMITER — PREVENTS BRUTE-FORCE ATTACKS
// ============================================================

export const loginLimiter = createLimiter(
  'login',
  rateLimits.login,
  {
    // Separate limits by IP address and email address.
    keyGenerator: (req) => {
      const email = (req.body?.email || 'unknown')
        .toLowerCase()
        .trim();

      return `${ipKeyGenerator(req.ip)}-${email}`;
    },

    // Successful logins do not count toward the limit.
    skipSuccessfulRequests: true,
  }
);

// ============================================================
// 2. REGISTER LIMITER — PREVENTS SPAM SIGNUPS
// ============================================================

export const registerLimiter = createLimiter(
  'register',
  rateLimits.register,
  {
    keyGenerator: (req) => ipKeyGenerator(req.ip),
  }
);

// ============================================================
// 3. PASSWORD RESET LIMITER — PREVENTS EMAIL BOMBING
// ============================================================

export const passwordResetLimiter = createLimiter(
  'password-reset',
  rateLimits.passwordReset,
  {
    // Track password reset requests by email and IP.
    keyGenerator: (req) => {
      const email = (req.body?.email || 'unknown')
        .toLowerCase()
        .trim();

      return `pwreset-${email}-${ipKeyGenerator(req.ip)}`;
    },
  }
);

// ============================================================
// 4. UPLOAD LIMITER — HELPS PREVENT DISK ABUSE
// ============================================================

export const uploadLimiter = createLimiter(
  'upload',
  rateLimits.upload,
  {
    // Prefer the authenticated user's ID.
    // Otherwise, use the request IP address.
    keyGenerator: (req) => {
      if (req.userId) {
        return `user-${req.userId}`;
      }

      return ipKeyGenerator(req.ip);
    },
  }
);

// ============================================================
// 5. GENERAL API LIMITER — HELPS PREVENT SCRAPING
// ============================================================

export const generalLimiter = createLimiter(
  'general',
  rateLimits.general,
  {
    // Prefer the authenticated user's ID.
    // Otherwise, use the request IP address.
    keyGenerator: (req) => {
      if (req.userId) {
        return `user-${req.userId}`;
      }

      return ipKeyGenerator(req.ip);
    },

    // Health checks should not be rate-limited.
    skip: (req) => req.path === '/health',
  }
);

// ============================================================
// 6. STRICT LIMITER — SENSITIVE OPERATIONS
// ============================================================

export const strictLimiter = createLimiter(
  'strict',
  {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
  }
);
