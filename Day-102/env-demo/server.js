// server.js

import express from 'express';
import chalk from 'chalk';
import config, { printConfig } from './config/index.js';

const app = express();
const { port, host, env } = config;

// ============================================================
// MIDDLEWARE
// ============================================================

app.use(express.json());

// Logger (conditionally enabled)
if (config.features.logging) {
  app.use((req, res, next) => {
    console.log(
      chalk.gray(`[${new Date().toLocaleTimeString()}]`) + ' ' +
      chalk.cyan(req.method.padEnd(6)) + ' ' +
      chalk.yellow(req.originalUrl)
    );
    next();
  });
}

// CORS
app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (config.allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

// ============================================================
// ROUTES
// ============================================================

// --- Root ---
app.get('/', (req, res) => {
  res.json({
    message: '🔐 Environment Variables Demo',
    environment: env,
    isDevelopment: config.isDevelopment,
    isProduction: config.isProduction,
    endpoints: {
      config: 'GET /config (masked)',
      configRaw: 'GET /config/raw (dev only)',
      db: 'GET /db',
      features: 'GET /features',
    },
  });
});

// --- Show config (masked) ---
app.get('/config', (req, res) => {
  res.json({
    environment: env,
    config: printConfig(),
  });
});

// --- Show raw config (DEVELOPMENT ONLY!) ---
app.get('/config/raw', (req, res) => {
  if (config.isProduction) {
    return res.status(403).json({
      error: 'Not available in production',
      message: 'Raw config is only available in development',
    });
  }

  res.json({
    warning: '⚠️  Raw config exposed! Development only.',
    config,
  });
});

// --- Database info ---
app.get('/db', (req, res) => {
  // Never expose the full DATABASE_URL
  const url = new URL(config.database.url.replace('mongodb://', 'http://'));

  res.json({
    host: url.hostname,
    port: url.port || 'default',
    database: config.database.name,
    connectionString: `${url.protocol}//***:***@${url.host}/${config.database.name}`,
  });
});

// --- Feature flags ---
app.get('/features', (req, res) => {
  res.json({
    environment: env,
    features: config.features,
  });
});

// --- Simulated protected route ---
app.get('/api/secret', (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Missing Authorization header' });
  }

  const token = authHeader.replace('Bearer ', '');

  // In production, this would verify a real JWT
  if (token !== config.jwt.secret) {
    return res.status(403).json({ error: 'Invalid token' });
  }

  res.json({
    message: '🎉 You accessed the secret!',
    jwtExpiresIn: config.jwt.expiresIn,
  });
});

// --- 404 handler ---
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
  });
});

// ============================================================
// START SERVER
// ============================================================

app.listen(port, host, () => {
  const envColor = config.isProduction ? chalk.red :
                   config.isDevelopment ? chalk.green :
                   chalk.yellow;

  console.log('\n' + '='.repeat(60));
  console.log(chalk.bold.cyan('🔐 Environment Variables Demo'));
  console.log('='.repeat(60));
  console.log(chalk.white(`🌐 URL:          http://${host}:${port}`));
  console.log(chalk.white(`🔧 Environment:  `) + envColor(env.toUpperCase()));
  console.log(chalk.white(`📅 Started:      ${new Date().toLocaleString()}`));
  console.log(chalk.white(`📦 Node:         ${process.version}`));
  console.log('='.repeat(60));
  console.log(chalk.yellow('\n⚙️  Loaded Config:'));
  console.log(chalk.gray(`   Port:           ${port}`));
  console.log(chalk.gray(`   Database:       ${config.database.name}`));
  console.log(chalk.gray(`   JWT Expires:    ${config.jwt.expiresIn}`));
  console.log(chalk.gray(`   Client URL:     ${config.clientUrl}`));
  console.log(chalk.gray(`   Logging:        ${config.features.logging ? '✅' : '❌'}`));
  console.log(chalk.gray(`   Rate Limit:     ${config.features.rateLimit ? '✅' : '❌'}`));
  console.log(chalk.yellow('\n🧪 Try these endpoints:'));
  console.log(chalk.gray('   GET  /'));
  console.log(chalk.gray('   GET  /config'));
  console.log(chalk.gray('   GET  /config/raw         (dev only)'));
  console.log(chalk.gray('   GET  /db'));
  console.log(chalk.gray('   GET  /features'));
  console.log(chalk.gray('   GET  /api/secret         (needs Bearer token)'));
  console.log('='.repeat(60) + '\n');
});