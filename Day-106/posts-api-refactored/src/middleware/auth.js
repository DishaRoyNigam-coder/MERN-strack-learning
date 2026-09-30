// src/middleware/auth.js

import { verifyToken, extractBearerToken } from '../utils/jwt.js';
import { UnauthorizedError, ForbiddenError } from '../errors/AppError.js';
import { users } from '../data/store.js';

/**
 * Middleware: Require a valid JWT token
 * Attaches req.user if valid, otherwise throws 401
 */
export function requireAuth(req, res, next) {
  try {
    const token = extractBearerToken(req.headers.authorization);

    if (!token) {
      throw new UnauthorizedError('Missing authentication token', {
        hint: 'Include "Authorization: Bearer <token>" header',
      });
    }

    // Verify token
    const decoded = verifyToken(token);

    // Find user (ensures user still exists)
    const user = users.find(u => u.id === decoded.userId);
    if (!user) {
      throw new UnauthorizedError('User no longer exists');
    }

    // Attach user to request
    const { password: _, ...safeUser } = user;
    req.user = safeUser;
    req.userId = user.id;
    req.userRole = user.role;

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Middleware: Require a specific role
 * Must be used AFTER requireAuth
 * @param  {...string} roles - Allowed roles
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `This action requires one of: ${roles.join(', ')}`,
          { requiredRoles: roles, yourRole: req.user.role }
        )
      );
    }

    next();
  };
}

/**
 * Middleware: Optional authentication
 * Attaches req.user if a token is present, but doesn't require it
 */
export function optionalAuth(req, res, next) {
  try {
    const token = extractBearerToken(req.headers.authorization);
    if (!token) return next();

    const decoded = verifyToken(token);
    const user = users.find(u => u.id === decoded.userId);
    if (user) {
      const { password: _, ...safeUser } = user;
      req.user = safeUser;
      req.userId = user.id;
      req.userRole = user.role;
    }
    next();
  } catch (error) {
    // Ignore invalid tokens in optional auth
    next();
  }
}