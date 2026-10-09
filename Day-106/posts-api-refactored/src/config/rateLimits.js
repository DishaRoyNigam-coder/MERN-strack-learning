// src/config/rateLimits.js

import 'dotenv/config';

const disabled = process.env.RATE_LIMIT_DISABLED === 'true';

const num = (key, def) => Number(process.env[key]) || def;

export const rateLimits = {
  disabled,

  // --- Login: strict limit to slow brute force ---
  login: {
    windowMs: num('RATE_LIMIT_LOGIN_WINDOW_MS', 15 * 60 * 1000), // 15 min
    max: num('RATE_LIMIT_LOGIN_MAX', 5),
  },

  // --- Register: prevent mass account creation ---
  register: {
    windowMs: num('RATE_LIMIT_REGISTER_WINDOW_MS', 60 * 60 * 1000), // 1 hour
    max: num('RATE_LIMIT_REGISTER_MAX', 3),
  },

  // --- Password reset: prevent email bombing ---
  passwordReset: {
    windowMs: num('RATE_LIMIT_PASSWORD_RESET_WINDOW_MS', 60 * 60 * 1000),
    max: num('RATE_LIMIT_PASSWORD_RESET_MAX', 3),
  },

  // --- Upload: prevent disk filling ---
  upload: {
    windowMs: num('RATE_LIMIT_UPLOAD_WINDOW_MS', 60 * 60 * 1000),
    max: num('RATE_LIMIT_UPLOAD_MAX', 10),
  },

  // --- General API: prevent scraping ---
  general: {
    windowMs: num('RATE_LIMIT_GENERAL_WINDOW_MS', 60 * 1000), // 1 min
    max: num('RATE_LIMIT_GENERAL_MAX', 100),
  },
};