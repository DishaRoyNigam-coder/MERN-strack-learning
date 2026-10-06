// src/config/auth.js

import 'dotenv/config';

if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET is missing from environment variables');
  process.exit(1);
}

if (process.env.JWT_SECRET.length < 32) {
  console.warn('⚠️  JWT_SECRET should be at least 32 characters for security');
}

const isProduction = process.env.NODE_ENV === 'production';

export const authConfig = {
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  jwtIssuer: process.env.JWT_ISSUER || 'posts-api',
  jwtAudience: process.env.JWT_AUDIENCE || 'posts-api-users',
  bcryptRounds: Number(process.env.BCRYPT_ROUNDS) || 10,

  // ============================================================
  // COOKIE CONFIGURATION
  // ============================================================

  cookie: {
    name: 'auth_token',       // Cookie name
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    httpOnly: true,           // Prevents JavaScript access
    secure: isProduction,     // HTTPS only in production
    sameSite: isProduction ? 'strict' : 'lax', // CSRF protection
    path: '/',                // Available on all paths
  },
};