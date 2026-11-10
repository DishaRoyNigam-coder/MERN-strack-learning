// src/config/rateLimits.js

const num = (key, def) => Number(process.env[key]) || def;
const disabled = process.env.RATE_LIMIT_DISABLED === 'true';

export const rateLimits = {
  disabled,
  login: { windowMs: 15 * 60 * 1000, max: num('RATE_LIMIT_LOGIN_MAX', 5) },
  register: { windowMs: 60 * 60 * 1000, max: num('RATE_LIMIT_REGISTER_MAX', 3) },
  passwordReset: { windowMs: 60 * 60 * 1000, max: num('RATE_LIMIT_PASSWORD_RESET_MAX', 3) },
  general: { windowMs: 60 * 1000, max: num('RATE_LIMIT_GENERAL_MAX', 100) },
};