// config/index.js

import 'dotenv/config';
import chalk from 'chalk';

// ============================================================
// 1. VALIDATE REQUIRED VARIABLES
// ============================================================

const REQUIRED_VARS = [
  'NODE_ENV',
  'PORT',
  'DATABASE_URL',
  'JWT_SECRET',
];

const missing = REQUIRED_VARS.filter(key => !process.env[key]);

if (missing.length > 0) {
  console.error(chalk.bgRed.white.bold('\n ❌ MISSING ENVIRONMENT VARIABLES '));
  console.error(chalk.red('\nThe following variables are required but not set:'));
  missing.forEach(key => console.error(chalk.red(`  - ${key}`)));
  console.error(chalk.yellow('\n💡 Tip: Copy .env.example to .env and fill in the values.\n'));
  process.exit(1);
}

// ============================================================
// 2. HELPER FUNCTIONS
// ============================================================

const getString = (key, fallback = '') => process.env[key] || fallback;
const getNumber = (key, fallback = 0) => {
  const value = process.env[key];
  return value !== undefined ? Number(value) : fallback;
};
const getBoolean = (key, fallback = false) => {
  const value = process.env[key];
  if (value === undefined) return fallback;
  return value === 'true' || value === '1';
};
const getArray = (key, fallback = []) => {
  const value = process.env[key];
  return value ? value.split(',').map(s => s.trim()) : fallback;
};

// ============================================================
// 3. EXPORT CONFIG
// ============================================================

export const config = {
  // --- Server ---
  env: getString('NODE_ENV', 'development'),
  isDevelopment: getString('NODE_ENV') === 'development',
  isProduction: getString('NODE_ENV') === 'production',
  isTest: getString('NODE_ENV') === 'test',
  port: getNumber('PORT', 3000),
  host: getString('HOST', 'localhost'),

  // --- Database ---
  database: {
    url: getString('DATABASE_URL'),
    name: getString('DATABASE_NAME', 'app'),
  },

  // --- Auth ---
  jwt: {
    secret: getString('JWT_SECRET'),
    expiresIn: getString('JWT_EXPIRES_IN', '7d'),
  },
  bcryptRounds: getNumber('BCRYPT_ROUNDS', 10),

  // --- Third-party ---
  stripe: {
    secretKey: getString('STRIPE_SECRET_KEY'),
    publicKey: getString('STRIPE_PUBLIC_KEY'),
  },
  sendgrid: {
    apiKey: getString('SENDGRID_API_KEY'),
  },

  // --- CORS ---
  clientUrl: getString('CLIENT_URL', 'http://localhost:5173'),
  allowedOrigins: getArray('ALLOWED_ORIGINS', ['http://localhost:5173']),

  // --- Feature flags ---
  features: {
    logging: getBoolean('ENABLE_LOGGING', true),
    rateLimit: getBoolean('ENABLE_RATE_LIMIT', false),
    rateLimitMax: getNumber('RATE_LIMIT_MAX', 100),
  },

  // --- Admin ---
  admin: {
    email: getString('ADMIN_EMAIL'),
    // NOTE: Never actually store passwords in env for production!
    // This is for demo purposes only.
    password: getString('ADMIN_PASSWORD'),
  },
};

// ============================================================
// 4. HELPER: Print config (with secrets masked)
// ============================================================

export function printConfig() {
  const masked = {
    env: config.env,
    port: config.port,
    host: config.host,
    database: {
      url: maskSecret(config.database.url),
      name: config.database.name,
    },
    jwt: {
      secret: maskSecret(config.jwt.secret),
      expiresIn: config.jwt.expiresIn,
    },
    stripe: {
      secretKey: maskSecret(config.stripe.secretKey),
      publicKey: maskSecret(config.stripe.publicKey),
    },
    sendgrid: {
      apiKey: maskSecret(config.sendgrid.apiKey),
    },
    cors: {
      clientUrl: config.clientUrl,
      allowedOrigins: config.allowedOrigins,
    },
    features: config.features,
    admin: {
      email: config.admin.email,
      password: maskSecret(config.admin.password),
    },
  };

  return masked;
}

function maskSecret(value) {
  if (!value) return '(not set)';
  if (value.length <= 8) return '***';
  return value.substring(0, 4) + '***' + value.substring(value.length - 4);
}

export default config;