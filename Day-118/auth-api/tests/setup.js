
// tests/setup.js

import { jest, beforeEach } from '@jest/globals';
import { users, passwordResetTokens } from '../src/data/store.js';

// ============================================================
// TEST ENVIRONMENT VARIABLES
// ============================================================

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET =
  'test-jwt-secret-at-least-32-characters-long-xx';
process.env.COOKIE_SECRET = 'test-cookie-secret-1234567890';
process.env.RATE_LIMIT_DISABLED = 'false';
process.env.EMAIL_SERVICE = 'none';
process.env.LOG_LEVEL = 'error';
process.env.LOG_TO_FILE = 'false';
process.env.LOG_TO_CONSOLE = 'false';

// ============================================================
// SILENCE CONSOLE DURING TESTS
// ============================================================

global.console = {
  ...console,
  log: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  http: jest.fn(),
};

// ============================================================
// RESET IN-MEMORY STORE BEFORE EVERY TEST
// ============================================================

beforeEach(() => {
  // Remove users created by previous tests
  users.length = 0;

  // Clear password reset tokens
  passwordResetTokens.clear();
});

// ============================================================
// JEST TIMEOUT
// ============================================================

jest.setTimeout(15000);