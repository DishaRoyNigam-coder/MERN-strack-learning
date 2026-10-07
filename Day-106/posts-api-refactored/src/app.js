// src/app.js

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import chalk from 'chalk';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { seedUsers } from './data/store.js';
import { corsOptions } from './config/cors.js';

const app = express();
app.use(cors(corsOptions));
// ============================================================
// GLOBAL MIDDLEWARE (order matters!)
// ============================================================

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

// 4. CORS — with credentials support
app.use((req, res, next) => {
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:3001',
  ];
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true'); // ← Required for cookies
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.sendStatus(200);
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
// API ROUTES
// ============================================================

app.use('/api', routes);

// ============================================================
// 404 + ERROR HANDLERS
// ============================================================

app.use(notFoundHandler);
app.use(errorHandler);

// ============================================================
// SEED USERS ON STARTUP
// ============================================================

seedUsers().catch(err => {
  console.error('Failed to seed users:', err);
});

export default app;