// src/middleware/roles.js

import { UnauthorizedError, ForbiddenError } from '../errors/AppError.js';
import { ROLES, roleIsAtLeast } from '../config/roles.js';
import logger from '../utils/logger.js';

export function isAdmin(req, res, next) {
  if (!req.user) return next(new UnauthorizedError());
  if (req.user.role !== ROLES.ADMIN) {
    logger.warn('Admin access denied', { userId: req.userId, role: req.userRole });
    return next(new ForbiddenError('Admin access required'));
  }
  next();
}

export function isAtLeast(minRole) {
  return (req, res, next) => {
    if (!req.user) return next(new UnauthorizedError());
    if (!roleIsAtLeast(req.user.role, minRole)) {
      return next(new ForbiddenError(`Requires role: ${minRole} or higher`));
    }
    next();
  };
}