// src/middleware/rateLimit.js

import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import chalk from 'chalk';
import { rateLimits } from '../config/rateLimits.js';

// ============================================================
// LOG RATE LIMIT HITS
// ============================================================

function logLimitHit(req, limiterName) {
  const time = new Date().toLocaleTimeString();
  const ip = req.ip;

  console.log(
    chalk.gray(`[${time}]`) + ' ' +
    chalk.bgYellow.black(' 🚫 RATE LIMIT ') + ' ' +
    chalk.yellow(limiterName) + ' ' +
    chalk.cyan(`${req.method} ${req.originalUrl}`) + ' ' +
    chalk.gray(`from ${ip}`)
  );

  // In production, send to monitoring/alerting
  // e.g., metrics.increment('rate_limit.hit', { endpoint, ip });
}

// ============================================================
// FACTORY: Create a limiter
// ============================================================

function createLimiter(name, { windowMs, max }, extraOptions = {}) {
  // In test/disabled mode, return a no-op middleware
  if (rateLimits.disabled) {
    return (req, res, next) => next();
  }

  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: 'Too many requests',
      code: 'RATE_LIMITED',
      statusCode: 429,
      message: 'You have exceeded the rate limit. Please try again later.',
    },
    standardHeaders: 'draft-7', // RateLimit-* headers
    legacyHeaders: true,        // Also send X-RateLimit-*

    // Custom handler for logging
    handler: (req, res, next, options) => {
      logLimitHit(req, name);
      res.status(options.statusCode).json(options.message);
    },

    // Skip successful requests for login (only count failures)
    skipSuccessfulRequests: extraOptions.skipSuccessfulRequests ?? false,
    skipFailedRequests: extraOptions.skipFailedRequests ?? false,

    // Custom key generator
    keyGenerator: extraOptions.keyGenerator || ((req) => ipKeyGenerator(req)),

    // Skip certain requests
    skip: extraOptions.skip || (() => false),

    ...extraOptions,
  });
}

// ============================================================
// 1. LOGIN LIMITER — Prevents brute force
// ============================================================
// Key insight: We use IP + email as key, so an attacker can't
// brute force a single account from one IP, but ALSO can't
// lock out all accounts from one IP by hitting the shared limit.

export const loginLimiter = createLimiter('login', rateLimits.login, {
  keyGenerator: (req) => {
    const email = (req.body?.email || 'unknown').toLowerCase().trim();
    return `${ipKeyGenerator(req)}-${email}`;
  },
  // Only count failed logins toward the limit — successful logins
  // don't consume the quota, so normal users aren't punished.
  skipSuccessfulRequests: true,
});

// ============================================================
// 2. REGISTER LIMITER — Prevents spam signups
// ============================================================

export const registerLimiter = createLimiter('register', rateLimits.register, {
  keyGenerator: (req) => ipKeyGenerator(req),
});

// ============================================================
// 3. PASSWORD RESET LIMITER — Prevents email bombing
// ============================================================

export const passwordResetLimiter = createLimiter(
  'password-reset',
  rateLimits.passwordReset,
  {
    keyGenerator: (req) => {
      const email = (req.body?.email || 'unknown').toLowerCase().trim();
      return `pwreset-${email}-${ipKeyGenerator(req)}`;
    },
  }
);

// ============================================================
// 4. UPLOAD LIMITER — Prevents disk filling
// ============================================================

export const uploadLimiter = createLimiter('upload', rateLimits.upload, {
  keyGenerator: (req) => {
    // Prefer authenticated user ID
    if (req.userId) return `user-${req.userId}`;
    return ipKeyGenerator(req);
  },
});

// ============================================================
// 5. GENERAL API LIMITER — Prevents scraping
// ============================================================

export const generalLimiter = createLimiter('general', rateLimits.general, {
  keyGenerator: (req) => {
    // Prefer authenticated user, fall back to IP
    if (req.userId) return `user-${req.userId}`;
    return ipKeyGenerator(req);
  },
  // Skip health checks — they should never be rate-limited
  skip: (req) => req.path === '/health',
});

// ============================================================
// 6. STRICT LIMITER — For especially sensitive operations
// ============================================================

export const strictLimiter = createLimiter('strict', {
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
});