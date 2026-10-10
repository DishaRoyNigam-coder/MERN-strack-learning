// src/app.js

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { corsOptions } from './config/cors.js';
import { uploadConfig } from './config/upload.js';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { requestIdMiddleware } from './middleware/requestId.js';
import { httpLogger } from './middleware/httpLogger.js';
import { seedUsers } from './data/store.js';
import { verifyEmailConnection } from './services/email.service.js';
import logger from './utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ============================================================
// GLOBAL MIDDLEWARE (ORDER MATTERS!)
// ============================================================

// 1. Trust proxy (for correct IPs behind a load balancer)
app.set('trust proxy', 1);

// 2. Request ID — must come FIRST so all logs have it
app.use(requestIdMiddleware);

// 3. HTTP request logger (morgan → winston)
app.use(httpLogger());

// 4. CORS
app.use(cors(corsOptions));

// 5. Cookie parser
app.use(cookieParser(process.env.COOKIE_SECRET || 'cookie-secret'));

// 6. Body parsers
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ============================================================
// STARTUP LOG
// ============================================================

logger.info('Application initializing', {
  nodeVersion: process.version,
  environment: process.env.NODE_ENV || 'development',
});

// ============================================================
// STATIC FILES
// ============================================================

app.use(express.static(path.join(__dirname, '../public')));

app.use(
  '/uploads',
  (req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Security-Policy', "default-src 'none'");
    next();
  },
  express.static(uploadConfig.rootDir, {
    maxAge: '1d',
    etag: true,
  })
);

// ============================================================
// HEALTH CHECK (not rate-limited, not logged)
// ============================================================

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    requestId: req.id,
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
// STARTUP TASKS
// ============================================================

seedUsers().catch(err => logger.error('Failed to seed users', { error: err.message }));

verifyEmailConnection().catch(err =>
  logger.error('Email verification failed', { error: err.message })
);

export default app;