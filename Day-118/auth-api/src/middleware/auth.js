// src/middleware/auth.js

import { verifyToken } from '../utils/jwt.js';
import { extractToken } from '../utils/cookies.js';
import { UnauthorizedError } from '../errors/AppError.js';
import { users } from '../data/store.js';
import { PERMISSIONS } from '../config/roles.js';
import logger from '../utils/logger.js';

function attachUser(req, user, token, decoded) {
  const { passwordHash, ...safeUser } = user;
  req.user = { ...safeUser, permissions: PERMISSIONS[user.role] || [] };
  req.userId = user.id;
  req.userRole = user.role;
  req.token = token;
  req.tokenExp = decoded.exp;
}

export function requireAuth(req, res, next) {
  try {
    const { token, source } = extractToken(req);
    if (!token) {
      throw new UnauthorizedError('Authentication required', {
        hint: 'Send Authorization: Bearer <token> or include the auth cookie',
      });
    }

    const decoded = verifyToken(token);
    const user = users.find(u => u.id === decoded.userId);
    if (!user) throw new UnauthorizedError('User no longer exists');

    attachUser(req, user, token, decoded);
    logger.debug('Auth success', { userId: user.id, source });
    next();
  } catch (error) {
    logger.warn('Auth failure', { reason: error.message, url: req.originalUrl });
    next(error);
  }
}

export function optionalAuth(req, res, next) {
  try {
    const { token } = extractToken(req);
    if (!token) return next();
    try {
      const decoded = verifyToken(token);
      const user = users.find(u => u.id === decoded.userId);
      if (user) attachUser(req, user, token, decoded);
    } catch { /* ignore */ }
    next();
  } catch (error) {
    next(error);
  }
}