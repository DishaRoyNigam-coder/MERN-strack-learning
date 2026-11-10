// src/config/auth.js

import 'dotenv/config';

const required = ['JWT_SECRET'];
const missing = required.filter(k => !process.env[k]);
if (missing.length > 0) {
  console.error(`❌ Missing env vars: ${missing.join(', ')}`);
  process.exit(1);
}

const isProduction = process.env.NODE_ENV === 'production';

export const authConfig = {
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  jwtIssuer: process.env.JWT_ISSUER || 'auth-api',
  jwtAudience: process.env.JWT_AUDIENCE || 'auth-api-users',
  bcryptRounds: Number(process.env.BCRYPT_ROUNDS) || 10,

  cookie: {
    name: process.env.COOKIE_NAME || 'auth_token',
    maxAge: Number(process.env.COOKIE_MAX_AGE) || 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    path: '/',
  },
};