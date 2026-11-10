
// tests/setup.js
import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

import { jest } from '@jest/globals';

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



// ============================================================
// JEST TIMEOUT
// ============================================================

jest.setTimeout(15000);