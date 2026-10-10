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
import {
  securityHeaders,
  crossOriginForPublicFiles,
  logSecurityConfig,
  cspReportHandler,
} from './middleware/security.js';
import { seedUsers } from './data/store.js';
import { verifyEmailConnection } from './services/email.service.js';
import logger from './utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ============================================================
// GLOBAL MIDDLEWARE (ORDER MATTERS!)
// ============================================================

// 1. Trust proxy (for correct IPs + HSTS behind a load balancer)
app.set('trust proxy', 1);

// 2. Security headers — MUST be early so they apply to everything
app.use(securityHeaders());

// 3. Request ID
app.use(requestIdMiddleware);

// 4. HTTP request logger
app.use(httpLogger());

// 5. CORS — comes AFTER security headers
app.use(cors(corsOptions));

// 6. Cookie parser
app.use(cookieParser(process.env.COOKIE_SECRET || 'cookie-secret'));

// 7. Body parsers
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ============================================================
// CSP VIOLATION REPORTING
// ============================================================

app.post(
  '/api/csp-report',
  express.json({ type: ['application/json', 'application/csp-report'] }),
  cspReportHandler
);

// ============================================================
// STATIC FILES
// ============================================================

app.use(express.static(path.join(__dirname, '../public')));

// Uploads — relaxed CORP because the React app loads these cross-origin
app.use(
  '/uploads',
  crossOriginForPublicFiles(), // ← Allow cross-origin reads of images
  (req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    next();
  },
  express.static(uploadConfig.rootDir, {
    maxAge: '1d',
    etag: true,
  })
);

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
// STARTUP
// ============================================================

logSecurityConfig();

seedUsers().catch(err => logger.error('Failed to seed users', { error: err.message }));
verifyEmailConnection().catch(err => logger.error('Email verification failed', { error: err.message }));

export default app;