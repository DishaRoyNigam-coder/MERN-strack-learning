// src/utils/password.js

import bcrypt from 'bcryptjs';
import { authConfig } from '../config/auth.js';

/**
 * Hash a password with bcrypt
 * @param {string} plainPassword
 * @returns {Promise<string>} The hash
 */
export async function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, authConfig.bcryptRounds);
}

/**
 * Compare a plain password with a hash
 * @param {string} plainPassword
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
export async function comparePassword(plainPassword, hash) {
  return bcrypt.compare(plainPassword, hash);
}