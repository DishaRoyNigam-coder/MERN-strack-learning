// middleware/logger.js

import chalk from 'chalk';

// ============================================================
// 1. REQUEST LOGGER MIDDLEWARE
// ============================================================

export function requestLogger(req, res, next) {
  const start = Date.now();
  const timestamp = new Date().toLocaleTimeString();

  // Log the incoming request
  console.log(
    chalk.gray(`[${timestamp}]`) + ' ' +
    chalk.bold.cyan(req.method.padEnd(6)) + ' ' +
    chalk.yellow(req.originalUrl)
  );

  // Capture the original res.end to log when response is sent
  const originalEnd = res.end;
  res.end = function (...args) {
    const duration = Date.now() - start;
    const statusColor = res.statusCode >= 500 ? chalk.red :
                        res.statusCode >= 400 ? chalk.yellow :
                        res.statusCode >= 300 ? chalk.cyan :
                        chalk.green;

    console.log(
      chalk.gray(`[${new Date().toLocaleTimeString()}]`) + ' ' +
      chalk.bold.cyan(req.method.padEnd(6)) + ' ' +
      chalk.yellow(req.originalUrl.padEnd(30)) + ' ' +
      statusColor(res.statusCode) + ' ' +
      chalk.magenta(`${duration}ms`)
    );

    // Call the original end
    originalEnd.apply(res, args);
  };

  next();
}

// ============================================================
// 2. REQUEST TIMER MIDDLEWARE
// ============================================================

export function requestTimer(req, res, next) {
  req.startTime = Date.now();
  next();
}

// ============================================================
// 3. REQUEST ID MIDDLEWARE
// ============================================================

export function requestId(req, res, next) {
  req.id = Math.random().toString(36).substring(2, 15);
  res.setHeader('X-Request-Id', req.id);
  next();
}

// ============================================================
// 4. AUTHENTICATION MIDDLEWARE
// ============================================================

export function authenticate(req, res, next) {
  const token = req.headers['authorization'];

  // Skip auth for public routes
  if (req.path === '/' || req.path === '/login' || req.path === '/health') {
    return next();
  }

  if (!token) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Missing authorization token',
    });
  }

  // Simulate token validation
  if (token !== 'Bearer secret-token') {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Invalid token',
    });
  }

  req.user = { id: 1, name: 'Alice', role: 'admin' };
  next();
}

// ============================================================
// 5. RATE LIMITER MIDDLEWARE
// ============================================================

const requestCounts = new Map();

export function rateLimiter(maxRequests = 10, windowMs = 60000) {
  return (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();

    if (!requestCounts.has(ip)) {
      requestCounts.set(ip, []);
    }

    const timestamps = requestCounts.get(ip);
    const validTimestamps = timestamps.filter(t => now - t < windowMs);

    if (validTimestamps.length >= maxRequests) {
      return res.status(429).json({
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Max ${maxRequests} requests per ${windowMs / 1000}s`,
        retryAfter: Math.ceil((validTimestamps[0] + windowMs - now) / 1000),
      });
    }

    validTimestamps.push(now);
    requestCounts.set(ip, validTimestamps);

    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', maxRequests - validTimestamps.length);

    next();
  };
}

// ============================================================
// 6. VALIDATION MIDDLEWARE
// ============================================================

export function validateBody(schema) {
  return (req, res, next) => {
    const errors = [];

    for (const [field, rules] of Object.entries(schema)) {
      const value = req.body?.[field];

      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push(`${field} is required`);
        continue;
      }

      if (value !== undefined) {
        if (rules.type && typeof value !== rules.type) {
          errors.push(`${field} must be a ${rules.type}`);
        }
        if (rules.minLength && value.length < rules.minLength) {
          errors.push(`${field} must be at least ${rules.minLength} characters`);
        }
        if (rules.maxLength && value.length > rules.maxLength) {
          errors.push(`${field} must be at most ${rules.maxLength} characters`);
        }
        if (rules.pattern && !rules.pattern.test(value)) {
          errors.push(`${field} format is invalid`);
        }
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        error: 'Validation failed',
        errors,
      });
    }

    next();
  };
}

// ============================================================
// 7. CORS MIDDLEWARE (custom)
// ============================================================

export function cors(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
}

// ============================================================
// 8. ERROR HANDLER MIDDLEWARE
// ============================================================

export function errorHandler(err, req, res, next) {
  console.error(chalk.red('❌ Error:'), err.message);
  console.error(chalk.gray(err.stack));

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    error: message,
    requestId: req.id,
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
  });
}

// ============================================================
// 9. NOT FOUND HANDLER
// ============================================================

export function notFound(req, res, next) {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}