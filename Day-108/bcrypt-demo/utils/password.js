// utils/password.js

import bcrypt from 'bcryptjs';

// ============================================================
// CONFIGURATION
// ============================================================

const DEFAULT_ROUNDS = 10;

// Valid round range for bcrypt
const MIN_ROUNDS = 4;
const MAX_ROUNDS = 15;

// ============================================================
// VALIDATION
// ============================================================

function validatePassword(password) {
  if (typeof password !== 'string') {
    throw new TypeError('Password must be a string');
  }
  if (password.length === 0) {
    throw new Error('Password cannot be empty');
  }
  if (password.length > 72) {
    // bcrypt truncates at 72 bytes!
    throw new Error('Password cannot exceed 72 bytes (bcrypt limit)');
  }
}

function validateRounds(rounds) {
  if (!Number.isInteger(rounds)) {
    throw new TypeError('Rounds must be an integer');
  }
  if (rounds < MIN_ROUNDS || rounds > MAX_ROUNDS) {
    throw new RangeError(`Rounds must be between ${MIN_ROUNDS} and ${MAX_ROUNDS}`);
  }
}

// ============================================================
// HASH PASSWORD
// ============================================================

/**
 * Hash a password with bcrypt.
 * bcrypt automatically generates a random salt for each password.
 *
 * @param {string} password - The plain text password
 * @param {number} rounds - Cost factor (default: 10)
 * @returns {Promise<string>} The full hash (includes salt + cost)
 */
export async function hashPassword(password, rounds = DEFAULT_ROUNDS) {
  validatePassword(password);
  validateRounds(rounds);

  const salt = await bcrypt.genSalt(rounds);
  const hash = await bcrypt.hash(password, salt);
  return hash;
}

/**
 * Hash a password with an explicit salt (advanced use).
 *
 * @param {string} password - The plain text password
 * @param {string} salt - A bcrypt salt string
 * @returns {Promise<string>} The hash
 */
export async function hashWithSalt(password, salt) {
  validatePassword(password);
  return bcrypt.hash(password, salt);
}

// ============================================================
// COMPARE PASSWORD
// ============================================================

/**
 * Compare a plain password with a bcrypt hash.
 * The salt is extracted from the hash automatically.
 *
 * @param {string} password - The plain text password
 * @param {string} hash - The bcrypt hash from the database
 * @returns {Promise<boolean>} True if password matches
 */
export async function comparePassword(password, hash) {
  if (typeof password !== 'string' || typeof hash !== 'string') {
    return false;
  }
  return bcrypt.compare(password, hash);
}

// ============================================================
// UTILITIES
// ============================================================

/**
 * Generate a salt (usually not needed explicitly).
 */
export async function generateSalt(rounds = DEFAULT_ROUNDS) {
  validateRounds(rounds);
  return bcrypt.genSalt(rounds);
}

/**
 * Parse a bcrypt hash to extract metadata.
 *
 * @param {string} hash
 * @returns {object} { version, rounds, salt, hash }
 */
export function parseHash(hash) {
  // Format: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
  const regex = /^\$(\w+)\$(\d+)\$([A-Za-z0-9./]{22})([A-Za-z0-9./]{31})$/;
  const match = hash.match(regex);

  if (!match) {
    throw new Error('Invalid bcrypt hash format');
  }

  return {
    version: match[1],       // "2a"
    rounds: parseInt(match[2]), // 10
    salt: match[3],          // 22 chars
    hash: match[4],          // 31 chars
    full: hash,
  };
}

/**
 * Check if a string looks like a bcrypt hash.
 */
export function isBcryptHash(str) {
  return /^\$2[aby]?\$\d{2}\$[A-Za-z0-9./]{53}$/.test(str);
}

/**
 * Time how long a hash takes (for benchmarking).
 */
export async function benchmark(rounds = DEFAULT_ROUNDS) {
  const start = Date.now();
  await hashPassword('benchmark-password', rounds);
  return Date.now() - start;
}