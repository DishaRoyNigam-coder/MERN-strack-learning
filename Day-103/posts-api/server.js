// server.js

import express from 'express';
import chalk from 'chalk';
import postsRouter from './routes/posts.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================
// GLOBAL MIDDLEWARE
// ============================================================

// Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  console.log(
    chalk.gray(`[${new Date().toLocaleTimeString()}]`) + ' ' +
    chalk.cyan(req.method.padEnd(6)) + ' ' +
    chalk.yellow(req.originalUrl)
  );

  const originalEnd = res.end;
  res.end = function (...args) {
    const duration = Date.now() - start;
    const statusColor = res.statusCode >= 500 ? chalk.red :
                        res.statusCode >= 400 ? chalk.yellow :
                        res.statusCode >= 300 ? chalk.cyan : chalk.green;
    console.log(
      chalk.gray(`[${new Date().toLocaleTimeString()}]`) + ' ' +
      chalk.cyan(req.method.padEnd(6)) + ' ' +
      chalk.yellow(req.originalUrl.padEnd(30)) + ' ' +
      statusColor(res.statusCode) + ' ' +
      chalk.magenta(`${duration}ms`)
    );
    originalEnd.apply(res, args);
  };

  next();
});

// CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// ============================================================
// ROUTES
// ============================================================

// API documentation
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: '📝 Posts API — A REST API for blog posts',
    version: '1.0.0',
    documentation: {
      posts: {
        'GET /api/posts': 'List all posts (supports ?author, ?tag, ?published, ?q, ?sort, ?order, ?page, ?limit, ?fields)',
        'GET /api/posts/:id': 'Get a single post',
        'POST /api/posts': 'Create a new post',
        'PUT /api/posts/:id': 'Full update (replace)',
        'PATCH /api/posts/:id': 'Partial update',
        'DELETE /api/posts/:id': 'Delete a post',
        'POST /api/posts/:id/like': 'Increment likes',
        'GET /api/posts/:id/comments': 'Get comments (placeholder)',
      },
    },
    examples: {
      listAll: 'GET /api/posts',
      filterByAuthor: 'GET /api/posts?author=Alice',
      filterByTag: 'GET /api/posts?tag=react',
      search: 'GET /api/posts?q=express',
      sort: 'GET /api/posts?sort=likes&order=desc',
      paginate: 'GET /api/posts?page=1&limit=2',
      fieldSelect: 'GET /api/posts?fields=id,title,author',
    },
  });
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Posts API
app.use('/api/posts', postsRouter);

// ============================================================
// 404 + ERROR HANDLERS
// ============================================================

app.use(notFoundHandler);
app.use(errorHandler);

// ============================================================
// START SERVER
// ============================================================

app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log(chalk.bold.cyan('📝 Posts REST API'));
  console.log('='.repeat(60));
  console.log(chalk.white(`🌐 URL:          http://localhost:${PORT}`));
  console.log(chalk.white(`📅 Started:      ${new Date().toLocaleString()}`));
  console.log(chalk.white(`📦 Node:         ${process.version}`));
  console.log('='.repeat(60));
  console.log(chalk.yellow('\n📋 CRUD Endpoints:'));
  console.log(chalk.gray('   GET    /api/posts                List all posts'));
  console.log(chalk.gray('   GET    /api/posts/:id            Get single post'));
  console.log(chalk.gray('   POST   /api/posts                Create a post'));
  console.log(chalk.gray('   PUT    /api/posts/:id            Full update'));
  console.log(chalk.gray('   PATCH  /api/posts/:id            Partial update'));
  console.log(chalk.gray('   DELETE /api/posts/:id            Delete a post'));
  console.log(chalk.gray('   POST   /api/posts/:id/like       Like a post'));
  console.log(chalk.yellow('\n🧪 Try these:'));
  console.log(chalk.gray('   curl http://localhost:3000/api/posts'));
  console.log(chalk.gray('   curl http://localhost:3000/api/posts/1'));
  console.log(chalk.gray('   curl http://localhost:3000/api/posts?author=Alice'));
  console.log(chalk.gray('   curl http://localhost:3000/api/posts?sort=likes&order=desc'));
  console.log('='.repeat(60) + '\n');
});