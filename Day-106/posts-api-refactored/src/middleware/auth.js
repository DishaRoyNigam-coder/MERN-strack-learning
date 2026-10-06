// src/middleware/auth.js

import chalk from 'chalk';
import { verifyToken } from '../utils/jwt.js';
import { extractToken } from '../utils/cookies.js';
import { UnauthorizedError } from '../errors/AppError.js';
import { users } from '../data/store.js';
import { PERMISSIONS } from '../config/roles.js';

// ============================================================
// LOGGING
// ============================================================

function logAuth(action, req, details = {}) {
  const time = new Date().toLocaleTimeString();
  const icon = action === 'success' ? '✅' :
               action === 'failure' ? '❌' : 'ℹ️';
  const color = action === 'success' ? chalk.green :
                action === 'failure' ? chalk.red : chalk.gray;

  console.log(
    chalk.gray(`[${time}]`) + ' ' +
    `${icon} ` +
    color(`AUTH:${action.toUpperCase()}`) + ' ' +
    chalk.cyan(`${req.method} ${req.originalUrl}`) +
    (details.source ? ' ' + chalk.magenta(`via=${details.source}`) : '') +
    (details.reason ? ' ' + chalk.yellow(`(${details.reason})`) : '')
  );
}

// ============================================================
// ATTACH USER
// ============================================================

function attachUser(req, user, token, decoded) {
  const { passwordHash, ...safeUser } = user;
  const userPermissions = PERMISSIONS[user.role] || [];

  req.user = {
    ...safeUser,
    permissions: userPermissions,
  };
  req.userId = user.id;
  req.userRole = user.role;
  req.token = token;
  req.tokenExp = decoded.exp;
}

// ============================================================
// requireAuth — Supports BOTH cookie and Bearer token
// ============================================================

export function requireAuth(req, res, next) {
  try {
    const { token, source } = extractToken(req);

    if (!token) {
      logAuth('failure', req, { reason: 'No token (cookie or header)' });
      throw new UnauthorizedError('Authentication required', {
        hint: 'Provide a valid cookie or Authorization: Bearer <token> header',
      });
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (error) {
      logAuth('failure', req, { reason: error.message, source });
      throw error;
    }

    const user = users.find(u => u.id === decoded.userId);
    if (!user) {
      logAuth('failure', req, { reason: 'User not found', source });
      throw new UnauthorizedError('User no longer exists');
    }

    attachUser(req, user, token, decoded);
    logAuth('success', req, { reason: user.email, source });
    next();
  } catch (error) {
    next(error);
  }
}

// ============================================================
// optionalAuth — Attach user if cookie OR header present
// ============================================================

export function optionalAuth(req, res, next) {
  try {
    const { token, source } = extractToken(req);
    if (!token) {
      req.user = null;
      return next();
    }

    try {
      const decoded = verifyToken(token);
      const user = users.find(u => u.id === decoded.userId);
      if (user) {
        attachUser(req, user, token, decoded);
      } else {
        req.user = null;
      }
    } catch (error) {
      req.user = null;
    }

    next();
  } catch (error) {
    next(error);
  }
}