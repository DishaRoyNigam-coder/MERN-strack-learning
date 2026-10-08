// src/app.js

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import chalk from 'chalk';
import routes from './routes/index.js';
import { uploadConfig } from './config/upload.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { seedUsers } from './data/store.js';
import { corsOptions } from './config/cors.js';
import { verifyEmailConnection } from './services/email.service.js';
import { emailConfig } from './config/email.js';

const app = express();

// ============================================================
// GLOBAL MIDDLEWARE (order matters!)
// ============================================================

// 0. CORS (configured once, via config/cors.js)
app.use(cors(corsOptions));

// 1. Cookie parser — MUST come before auth middleware
app.use(cookieParser(process.env.COOKIE_SECRET || 'cookie-secret'));

// 2. Body parsers
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// 3. Request logger
app.use((req, res, next) => {
  const start = Date.now();
  const originalEnd = res.end;

  res.end = function (...args) {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const statusColor = status >= 500 ? chalk.red :
                        status >= 400 ? chalk.yellow :
                        status >= 300 ? chalk.cyan : chalk.green;
    console.log(
      chalk.gray(`[${new Date().toLocaleTimeString()}]`) + ' ' +
      chalk.cyan(req.method.padEnd(6)) + ' ' +
      chalk.yellow(req.originalUrl.padEnd(30)) + ' ' +
      statusColor(status) + ' ' +
      chalk.magenta(`${duration}ms`)
    );
    originalEnd.apply(res, args);
  };

  next();
});

// ============================================================
// HEALTH CHECK
// ============================================================

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// ============================================================
// SERVE UPLOADED FILES
// ============================================================

app.use(
  '/uploads',
  // Security headers
  (req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Security-Policy', "default-src 'none'");
    next();
  },
  // Static file serving
  express.static(uploadConfig.rootDir, {
    maxAge: '1d', // Cache for 1 day
    etag: true,
    lastModified: true,
  })
);

// ============================================================
// API ROUTES
// ============================================================

app.use('/api', routes);

// ============================================================
// 404 + ERROR HANDLERS
// ============================================================

app.use(notFoundHandler);
app.use(errorHandler);

// ============================================================
// SEED USERS + VERIFY EMAIL ON STARTUP
// ============================================================

seedUsers().catch(err =>
  console.error('Failed to seed users:', err)
);

verifyEmailConnection().catch(err =>
  console.error('Email verification failed:', err.message)
);

export default app;