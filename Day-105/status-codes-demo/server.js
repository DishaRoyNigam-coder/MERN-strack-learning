// server.js

import express from 'express';
import chalk from 'chalk';
import usersRouter from './routes/users.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================
// MIDDLEWARE
// ============================================================

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logger
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
// DOCS + HEALTH
// ============================================================

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: '📊 HTTP Status Codes & Custom Errors Demo',
    version: '1.0.0',
    docs: {
      users: {
        'GET /api/users': '200 OK — list users',
        'GET /api/users/:id': '200 OK — get user | 400 if invalid id | 404 if not found',
        'POST /api/users': '201 Created — create user | 400, 409, 422 on errors',
        'PUT /api/users/:id': '200 OK — full replace | 400, 404, 409, 422',
        'PATCH /api/users/:id': '200 OK — partial update | 400, 404, 409, 422',
        'DELETE /api/users/:id': '200 OK — delete user | 400, 404',
      },
    },
    testCases: [
      'GET  /api/users',
      'GET  /api/users/1',
      'GET  /api/users/999        → 404',
      'GET  /api/users/abc        → 400',
      'POST /api/users            → 201',
      'POST /api/users (duplicate) → 409',
      'POST /api/users (invalid)  → 422',
      'PUT  /api/users/1          → 200',
      'PATCH /api/users/1         → 200',
      'DELETE /api/users/1        → 200',
      'DELETE /api/users/999      → 404',
    ],
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ success: true, status: 'healthy' });
});

// ============================================================
// ROUTES
// ============================================================

app.use('/api/users', usersRouter);

// ============================================================
// 404 + ERROR HANDLERS
// ============================================================

app.use(notFoundHandler);
app.use(errorHandler);

// ============================================================
// START
// ============================================================

app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log(chalk.bold.cyan('📊 HTTP Status Codes & Custom Errors Demo'));
  console.log('='.repeat(60));
  console.log(chalk.white(`🌐 URL:      http://localhost:${PORT}`));
  console.log(chalk.white(`📅 Started:  ${new Date().toLocaleString()}`));
  console.log(chalk.white(`📦 Node:     ${process.version}`));
  console.log('='.repeat(60));
  console.log(chalk.yellow('\n📋 Status Code Mapping:'));
  console.log(chalk.gray('   200 → GET, PUT, PATCH, DELETE success'));
  console.log(chalk.gray('   201 → POST success (with Location header)'));
  console.log(chalk.gray('   400 → Invalid ID, malformed JSON'));
  console.log(chalk.gray('   404 → Resource not found'));
  console.log(chalk.gray('   409 → Duplicate email (conflict)'));
  console.log(chalk.gray('   422 → Validation failed'));
  console.log(chalk.gray('   500 → Server bug (rare in this demo)'));
  console.log(chalk.yellow('\n🧪 Test with curl:'));
  console.log(chalk.gray('   curl http://localhost:3000/api/users'));
  console.log(chalk.gray('   curl http://localhost:3000/api/users/1'));
  console.log(chalk.gray('   curl http://localhost:3000/api/users/999'));
  console.log(chalk.gray('   curl http://localhost:3000/api/users/abc'));
  console.log('='.repeat(60) + '\n');
});