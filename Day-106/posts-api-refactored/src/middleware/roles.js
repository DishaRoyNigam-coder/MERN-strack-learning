// src/middleware/roles.js

import chalk from 'chalk';
import { UnauthorizedError, ForbiddenError } from '../errors/AppError.js';
import { ROLES, roleIsAtLeast, isAdminRole } from '../config/roles.js';

// ============================================================
// LOGGING HELPER
// ============================================================

function logAuthorization(action, req, details = {}) {
  const time = new Date().toLocaleTimeString();
  const icon = action === 'success' ? '✅' : '🚫';
  const color = action === 'success' ? chalk.green : chalk.red;

  console.log(
    chalk.gray(`[${time}]`) + ' ' +
    `${icon} ` +
    color(`AUTHZ:${action.toUpperCase()}`) + ' ' +
    chalk.cyan(`${req.method} ${req.originalUrl}`) +
    (req.user ? ' ' + chalk.gray(`user=${req.user.email}`) : '') +
    (req.user ? ' ' + chalk.gray(`role=${req.user.role}`) : '') +
    (details.reason ? ' ' + chalk.yellow(`(${details.reason})`) : '')
  );
}

// ============================================================
// 1. isAdmin — Admin-only access
// Must be used AFTER requireAuth
// ============================================================

export function isAdmin(req, res, next) {
  // Ensure user is authenticated
  if (!req.user) {
    return next(new UnauthorizedError('Authentication required'));
  }

  // Check if the user's role is admin
  if (!isAdminRole(req.user.role)) {
    logAuthorization('failure', req, { reason: 'Admin required' });
    return next(
      new ForbiddenError('Admin access required', {
        hint: 'This action requires administrator privileges',
      })
    );
  }

  logAuthorization('success', req, { reason: 'Admin verified' });
  next();
}

// ============================================================
// 2. isEditor — Editor or above
// ============================================================

export function isEditor(req, res, next) {
  if (!req.user) {
    return next(new UnauthorizedError('Authentication required'));
  }

  if (!roleIsAtLeast(req.user.role, ROLES.EDITOR)) {
    logAuthorization('failure', req, { reason: 'Editor+ required' });
    return next(
      new ForbiddenError('Editor access or higher required', {
        hint: 'This action requires editor privileges',
      })
    );
  }

  logAuthorization('success', req, { reason: 'Editor verified' });
  next();
}

// ============================================================
// 3. hasRole — Require one of the specified roles
// ============================================================

export function hasRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      logAuthorization('failure', req, {
        reason: `role=${req.user.role} not in [${allowedRoles.join(',')}]`,
      });
      return next(
        new ForbiddenError('Insufficient permissions', {
          hint: `This action requires one of: ${allowedRoles.join(', ')}`,
        })
      );
    }

    logAuthorization('success', req, { reason: 'Role matched' });
    next();
  };
}

// ============================================================
// 4. hasAnyRole — Alias for hasRole (for readability)
// ============================================================

export const hasAnyRole = hasRole;

// ============================================================
// 5. hasAllRoles — User must have ALL listed roles
// (Rarely used but useful for special cases)
// ============================================================

export function hasAllRoles(...requiredRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    // A single-role user can't have all roles unless there's one
    const userRoles = req.user.roles || [req.user.role];
    const missing = requiredRoles.filter(r => !userRoles.includes(r));

    if (missing.length > 0) {
      logAuthorization('failure', req, {
        reason: `missing roles: ${missing.join(',')}`,
      });
      return next(new ForbiddenError('Insufficient roles'));
    }

    next();
  };
}

// ============================================================
// 6. isSelfOrAdmin — User is editing their own profile OR is admin
// ============================================================

export function isSelfOrAdmin(getUserId = (req) => req.params.id) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    const targetId = Number(getUserId(req));
    const isSelf = req.user.id === targetId;
    const isAdmin = req.user.role === ROLES.ADMIN;

    if (!isSelf && !isAdmin) {
      logAuthorization('failure', req, {
        reason: `Not self (${req.user.id} !== ${targetId}) and not admin`,
      });
      return next(
        new ForbiddenError('You can only modify your own account')
      );
    }

    logAuthorization('success', req, { reason: isSelf ? 'Self' : 'Admin' });
    next();
  };
}

// ============================================================
// 7. requirePermission — Permission-based (for advanced use)
// ============================================================

export function requirePermission(...requiredPermissions) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    // Check if user has any of the required permissions
    const userPermissions = req.user.permissions || [];
    const hasAll = requiredPermissions.every(
      p => userPermissions.includes('*') || userPermissions.includes(p)
    );

    if (!hasAll) {
      logAuthorization('failure', req, {
        reason: `missing permissions`,
      });
      return next(new ForbiddenError('Insufficient permissions'));
    }

    next();
  };
}