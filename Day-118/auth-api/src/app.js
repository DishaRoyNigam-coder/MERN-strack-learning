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
  securityHeaders, crossOriginForPublicFiles, logSecurityConfig,
} from './middleware/security.js';
import { generalLimiter } from './middleware/rateLimit.js';
import { seedUsers } from './data/store.js';
import { verifyEmailConnection } from './services/email.service.js';
import logger from './utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Trust proxy (for correct IPs behind load balancers)
app.set('trust proxy', 1);

// 1. Security headers
app.use(securityHeaders());

// 2. Request ID
app.use(requestIdMiddleware);

// 3. HTTP logger
app.use(httpLogger());

// 4. CORS
app.use(cors(corsOptions));

// 5. Cookie parser
app.use(cookieParser(process.env.COOKIE_SECRET || 'cookie-secret'));

// 6. Body parsers
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// 7. Global rate limit
app.use('/api', generalLimiter);

// Static files
app.use(express.static(path.join(__dirname, '../public')));
app.use(
  '/uploads',
  crossOriginForPublicFiles(),
  express.static(uploadConfig.rootDir, { maxAge: '1d', etag: true })
);

// Health check
app.get('/health', (req, res) => {
  res.json({ success: true, status: 'healthy', uptime: process.uptime() });
});

// Routes
app.use('/api', routes);

// 404 + error
app.use(notFoundHandler);
app.use(errorHandler);

// Startup
logSecurityConfig();
seedUsers().catch(err => logger.error('Seed failed', { error: err.message }));
verifyEmailConnection().catch(err => logger.error('Email check failed', { error: err.message }));

export default app;