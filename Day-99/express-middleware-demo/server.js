// server.js

import express from 'express';
import chalk from 'chalk';
import {
  requestLogger,
  requestId,
  requestTimer,
  authenticate,
  rateLimiter,
  validateBody,
  cors,
  errorHandler,
  notFound,
} from './middleware/logger.js';

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================
// GLOBAL MIDDLEWARE (runs on every request)
// ============================================================

// 1. CORS
app.use(cors);

// 2. Request ID
app.use(requestId);

// 3. Request timer
app.use(requestTimer);

// 4. Custom logger (THE STAR OF TODAY)
app.use(requestLogger);

// 5. Rate limiter (10 requests per minute)
app.use(rateLimiter(20, 60000));

// 6. Parse JSON bodies
app.use(express.json());

// 7. Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// ============================================================
// ROUTES
// ============================================================

// --- Root ---
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Express Middleware Demo',
    requestId: req.id,
    uptime: `${process.uptime().toFixed(2)}s`,
    endpoints: {
      health: 'GET /health',
      public: 'GET /api/public',
      protected: 'GET /api/protected (requires Bearer secret-token)',
      users: 'GET /api/users',
      createUser: 'POST /api/users (validation demo)',
      slow: 'GET /api/slow (3 second delay)',
      error: 'GET /api/error (throws an error)',
    },
  });
});

// --- Health check (public) ---
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    requestId: req.id,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// --- Public endpoint ---
app.get('/api/public', (req, res) => {
  res.json({
    message: 'This is a public endpoint',
    requestId: req.id,
  });
});

// ============================================================
// PROTECTED ROUTES (uses authenticate middleware)
// ============================================================

const users = [
  { id: 1, name: 'Alice', email: 'alice@example.com' },
  { id: 2, name: 'Bob', email: 'bob@example.com' },
];

// --- Protected endpoint (requires auth) ---
app.get('/api/protected', authenticate, (req, res) => {
  res.json({
    message: 'This is a protected endpoint',
    user: req.user,
    requestId: req.id,
  });
});

// --- Get all users ---
app.get('/api/users', authenticate, (req, res) => {
  res.json({
    count: users.length,
    users,
    requestedBy: req.user.name,
  });
});

// ============================================================
// VALIDATION DEMO (uses validateBody middleware)
// ============================================================

app.post('/api/users',
  authenticate,
  validateBody({
    name: { required: true, type: 'string', minLength: 2, maxLength: 50 },
    email: { required: true, type: 'string', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    age: { required: false, type: 'number' },
  }),
  (req, res) => {
    const newUser = {
      id: users.length + 1,
      ...req.body,
    };
    users.push(newUser);

    res.status(201).json({
      message: 'User created',
      user: newUser,
    });
  }
);

// ============================================================
// PERFORMANCE DEMOS
// ============================================================

// --- Slow endpoint (3 second delay) ---
app.get('/api/slow', (req, res) => {
  setTimeout(() => {
    res.json({
      message: 'Sorry for the wait!',
      requestId: req.id,
      duration: `${Date.now() - req.startTime}ms`,
    });
  }, 3000);
});

// --- Error endpoint (throws an error) ---
app.get('/api/error', (req, res, next) => {
  const error = new Error('This is a simulated error!');
  error.statusCode = 500;
  next(error);
});

// --- Custom status code demo ---
app.get('/api/teapot', (req, res) => {
  res.status(418).json({
    message: "I'm a teapot!",
    requestId: req.id,
  });
});

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'public')));

// ============================================================
// 404 HANDLER (must be after all routes)
// ============================================================

app.use(notFound);

// ============================================================
// ERROR HANDLER (must be LAST)
// ============================================================

app.use(errorHandler);

// ============================================================
// START SERVER
// ============================================================

app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log(chalk.bold.cyan('🚀 Express Middleware Demo Server'));
  console.log('='.repeat(60));
  console.log(chalk.white(`🌐 URL:          http://localhost:${PORT}`));
  console.log(chalk.white(`📅 Started:      ${new Date().toLocaleString()}`));
  console.log(chalk.white(`📦 Node:         ${process.version}`));
  console.log('='.repeat(60));
  console.log(chalk.yellow('\n📋 Middleware Registered (in order):'));
  console.log(chalk.gray('   1. CORS'));
  console.log(chalk.gray('   2. Request ID'));
  console.log(chalk.gray('   3. Request Timer'));
  console.log(chalk.gray('   4. Custom Logger ← Today\'s star!'));
  console.log(chalk.gray('   5. Rate Limiter (20/min)'));
  console.log(chalk.gray('   6. JSON Parser'));
  console.log(chalk.gray('   7. URL-Encoded Parser'));
  console.log(chalk.gray('   8. Routes'));
  console.log(chalk.gray('   9. 404 Handler'));
  console.log(chalk.gray('  10. Error Handler'));
  console.log(chalk.yellow('\n🧪 Try these endpoints:'));
  console.log(chalk.gray('   GET  /'));
  console.log(chalk.gray('   GET  /health'));
  console.log(chalk.gray('   GET  /api/public'));
  console.log(chalk.gray('   GET  /api/protected     (needs Authorization header)'));
  console.log(chalk.gray('   GET  /api/users         (needs Authorization header)'));
  console.log(chalk.gray('   POST /api/users         (validation demo)'));
  console.log(chalk.gray('   GET  /api/slow'));
  console.log(chalk.gray('   GET  /api/error'));
  console.log(chalk.gray('   GET  /api/teapot'));
  console.log('='.repeat(60) + '\n');
});