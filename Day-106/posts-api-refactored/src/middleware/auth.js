
// src/middleware/auth.js

import logger from '../utils/logger.js';
import { verifyToken } from '../utils/jwt.js';
import { extractToken } from '../utils/cookies.js';
import { UnauthorizedError } from '../errors/AppError.js';
import { users } from '../data/store.js';
import { PERMISSIONS } from '../config/roles.js';

// ============================================================
// LOGGING
// ============================================================

function logAuth(action, req, details = {}) {
  const { source, reason, userId, email } = details;

  if (action === 'success') {
    logger.debug('Auth success', {
      userId,
      email,
      source,
      method: req.method,
      url: req.originalUrl,
    });
    return;
  }

  if (action === 'failure') {
    logger.warn('Auth failure', {
      reason,
      source,
      ip: req.ip,
      method: req.method,
      url: req.originalUrl,
    });
  }
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

    // No token provided.
    if (!token) {
      const error = new UnauthorizedError(
        'Authentication required',
        {
          hint:
            'Provide a valid cookie or Authorization: Bearer <token> header',
        }
      );

      logAuth('failure', req, {
        reason: 'No token (cookie or header)',
        source,
      });

      throw error;
    }

    // Verify the token.
    let decoded;

    try {
      decoded = verifyToken(token);
    } catch (error) {
      logAuth('failure', req, {
        reason: error.message,
        source,
      });

      throw error;
    }

    // Find the authenticated user.
    const user = users.find((u) => u.id === decoded.userId);

    if (!user) {
      const error = new UnauthorizedError(
        'User no longer exists'
      );

      logAuth('failure', req, {
        reason: 'User not found',
        source,
      });

      throw error;
    }

    // Attach user information to the request.
    attachUser(req, user, token, decoded);

    // Log successful authentication.
    logAuth('success', req, {
      userId: user.id,
      email: user.email,
      source,
    });

    next();
  } catch (error) {
    next(error);
  }
}

// ============================================================
// optionalAuth — Attach user if cookie OR header is present
// ============================================================

export function optionalAuth(req, res, next) {
  try {
    const { token } = extractToken(req);

    // Authentication is optional.
    if (!token) {
      req.user = null;
      return next();
    }

    try {
      const decoded = verifyToken(token);
      const user = users.find((u) => u.id === decoded.userId);

      if (user) {
        attachUser(req, user, token, decoded);
      } else {
        req.user = null;
      }
    } catch (error) {
      // Invalid or expired tokens do not block optional access.
      req.user = null;
    }

    next();
  } catch (error) {
    next(error);
  }
}
