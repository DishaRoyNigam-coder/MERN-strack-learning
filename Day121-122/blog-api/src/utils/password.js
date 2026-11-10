// src/utils/password.js

import bcrypt from 'bcryptjs';
import { authConfig } from '../config/auth.js';

export async function hashPassword(password) {
  if (typeof password !== 'string') throw new TypeError('Password must be a string');
  if (password.length < 6) throw new Error('Password must be at least 6 characters');
  if (password.length > 72) throw new Error('Password cannot exceed 72 bytes');
  return bcrypt.hash(password, authConfig.bcryptRounds);
}

export async function comparePassword(password, hash) {
  if (typeof password !== 'string' || typeof hash !== 'string') return false;
  return bcrypt.compare(password, hash);
}

export function isBcryptHash(str) {
  return /^\$2[aby]?\$\d{2}\$[A-Za-z0-9./]{53}$/.test(str);
}