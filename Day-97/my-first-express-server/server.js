// server.js

import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================
// 1. GET / - Root endpoint
// ============================================================

app.get('/', (req, res) => {
  res.json({
    message: '🚀 Welcome to the Express API',
    version: '1.0.0',
    endpoints: {
      root: '/',
      health: '/health',
      info: '/info',
      greet: '/greet?name=YourName',
      users: '/api/users',
      userById: '/api/users/:id',
    },
  });
});

// ============================================================
// 2. GET /health - Health check endpoint
// ============================================================

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// ============================================================
// 3. GET /info - Server info
// ============================================================

app.get('/info', (req, res) => {
  res.json({
    name: 'My First Express Server',
    version: '1.0.0',
    nodeVersion: process.version,
    platform: process.platform,
    environment: process.env.NODE_ENV || 'development',
    memory: {
      total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)} MB`,
      used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
    },
  });
});

// ============================================================
// 4. GET /greet - Greeting with query params
// ============================================================

app.get('/greet', (req, res) => {
  const name = req.query.name || 'Guest';
  res.json({
    message: `👋 Hello, ${name}!`,
    timestamp: new Date().toISOString(),
  });
});

// ============================================================
// 5. GET /api/users - List all users
// ============================================================

const users = [
  { id: 1, name: 'Alice', email: 'alice@example.com', role: 'admin' },
  { id: 2, name: 'Bob', email: 'bob@example.com', role: 'user' },
  { id: 3, name: 'Carol', email: 'carol@example.com', role: 'user' },
];

app.get('/api/users', (req, res) => {
  res.json({
    count: users.length,
    users,
  });
});

// ============================================================
// 6. GET /api/users/:id - Get user by ID (dynamic route)
// ============================================================

app.get('/api/users/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const user = users.find(u => u.id === id);

  if (!user) {
    return res.status(404).json({
      error: 'User not found',
      id,
    });
  }

  res.json(user);
});
// Add this before the 404 handler

app.get('/home', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Express Server</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Segoe UI', sans-serif;
          background: linear-gradient(135deg, #0f172a, #1e293b);
          color: #e2e8f0;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 40px 50px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          text-align: center;
          max-width: 600px;
        }
        h1 { font-size: 2.5rem; margin-bottom: 12px; }
        p { color: #94a3b8; margin-bottom: 20px; }
        .badge {
          display: inline-block;
          background: #3b82f6;
          color: #fff;
          padding: 4px 16px;
          border-radius: 30px;
          font-weight: 600;
          font-size: 0.85rem;
          margin-bottom: 16px;
        }
        .endpoints {
          text-align: left;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 12px;
          padding: 16px;
          margin-top: 16px;
        }
        .endpoints code {
          color: #60a5fa;
          font-family: 'Courier New', monospace;
          font-size: 0.85rem;
          display: block;
          padding: 4px 0;
        }
      </style>
    </head>
    <body>
      <div class="card">
        <span class="badge">✅ Server Online</span>
        <h1>🚀 Express Server</h1>
        <p>Your first REST API is up and running!</p>
        <div class="endpoints">
          <code>GET /</code>
          <code>GET /health</code>
          <code>GET /info</code>
          <code>GET /greet?name=YourName</code>
          <code>GET /api/users</code>
          <code>GET /api/users/:id</code>
        </div>
      </div>
    </body>
    </html>
  `);
});

// ============================================================
// 7. 404 Handler (must be after all routes)
// ============================================================

app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
  });
});

// ============================================================
// 8. START THE SERVER
// ============================================================

app.listen(PORT, () => {
  console.log('\n' + '='.repeat(50));
  console.log('🚀 Express Server Started!');
  console.log('='.repeat(50));
  console.log(`🌐 URL:          http://localhost:${PORT}`);
  console.log(`📅 Started at:   ${new Date().toLocaleString()}`);
  console.log(`🔧 Environment:  ${process.env.NODE_ENV || 'development'}`);
  console.log(`📦 Node version: ${process.version}`);
  console.log('='.repeat(50) + '\n');
});