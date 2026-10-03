
// src/middleware/auth.js

import chalk from 'chalk';

import { verifyToken, extractBearerToken } from '../utils/jwt.js';

import {
  UnauthorizedError,
  ForbiddenError,
} from '../errors/AppError.js';

import { users } from '../data/store.js';

import { PERMISSIONS } from '../config/roles.js';


// ============================================================
// HELPER: Log authentication events
// ============================================================

function logAuth(action, req, details = {}) {
  const ip = req.ip || req.connection.remoteAddress;
  const time = new Date().toLocaleTimeString();

  const colors = {
    success: chalk.green,
    failure: chalk.red,
    info: chalk.gray,
  };

  const color = colors[action] || chalk.gray;

  const icon =
    action === 'success'
      ? '✅'
      : action === 'failure'
        ? '❌'
        : 'ℹ️';

  console.log(
    chalk.gray(`[${time}]`) +
      ' ' +
      `${icon} ` +
      color(`AUTH:${action.toUpperCase()}`) +
      ' ' +
      chalk.cyan(`${req.method} ${req.originalUrl}`) +
      ' ' +
      chalk.gray(`from ${ip}`) +
      (details.reason
        ? ' ' + chalk.yellow(`(${details.reason})`)
        : '')
  );
}


// ============================================================
// HELPER: Attach user with permissions to request
// ============================================================

function attachUser(req, user, token, decoded) {
  // Remove passwordHash before attaching user to request
  const { passwordHash, ...safeUser } = user;

  // Get permissions based on user's role
  const userPermissions = PERMISSIONS[user.role] || [];

  // Attach safe user information + permissions
  req.user = {
    ...safeUser,
    permissions: userPermissions,
  };

  // Attach additional authentication information
  req.userId = user.id;
  req.userRole = user.role;
  req.token = token;
  req.tokenExp = decoded.exp;
}


// ============================================================
// 1. requireAuth — Enforce authentication
// ============================================================

export function requireAuth(req, res, next) {
  try {
    // --- Step 1: Extract token ---
    const token = extractBearerToken(req.headers.authorization);

    if (!token) {
      logAuth('failure', req, {
        reason: 'Missing token',
      });

      throw new UnauthorizedError('Authentication required', {
        hint: 'Include header: Authorization: Bearer <token>',
      });
    }

    // --- Step 2: Verify token ---
    let decoded;

    try {
      decoded = verifyToken(token);
    } catch (error) {
      logAuth('failure', req, {
        reason: error.message,
      });

      throw error;
    }

    // --- Step 3: Look up user ---
    // Token may be valid but user may have been deleted
    const user = users.find(
      (u) => u.id === decoded.userId
    );

    if (!user) {
      logAuth('failure', req, {
        reason: 'User not found',
      });

      throw new UnauthorizedError(
        'User no longer exists',
        {
          hint: 'Please register again',
        }
      );
    }

    // --- Step 4: Attach user + permissions ---
    attachUser(req, user, token, decoded);

    // --- Step 5: Continue ---
    logAuth('success', req, {
      reason: `user=${user.email}`,
    });

    next();
  } catch (error) {
    next(error);
  }
}


// ============================================================
// 2. optionalAuth — Attach user if token present
//    But don't require authentication
// ============================================================

export function optionalAuth(req, res, next) {
  try {
    const token = extractBearerToken(
      req.headers.authorization
    );

    // No token?
    // Continue as anonymous user
    if (!token) {
      req.user = null;
      return next();
    }

    // Try to verify token
    try {
      const decoded = verifyToken(token);

      const user = users.find(
        (u) => u.id === decoded.userId
      );

      if (user) {
        // Attach user + permissions
        attachUser(req, user, token, decoded);
      } else {
        // Token is valid but user doesn't exist
        req.user = null;
      }
    } catch (error) {
      // Ignore invalid tokens in optional authentication
      req.user = null;
    }

    next();
  } catch (error) {
    next(error);
  }
}


// ============================================================
// 3. requireRole — Enforce role-based access
// Must be used AFTER requireAuth
// ============================================================

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    // Ensure requireAuth ran first
    if (!req.user) {
      return next(
        new UnauthorizedError(
          'Authentication required'
        )
      );
    }

    // Check whether user's role is allowed
    if (!allowedRoles.includes(req.user.role)) {
      logAuth('failure', req, {
        reason: `role=${req.user.role} not in [${allowedRoles.join(',')}]`,
      });

      return next(
        new ForbiddenError(
          `This action requires one of: ${allowedRoles.join(', ')}`,
          {
            requiredRoles: allowedRoles,
            yourRole: req.user.role,
          }
        )
      );
    }

    logAuth('success', req, {
      reason: `role=${req.user.role} allowed`,
    });

    next();
  };
}


// ============================================================
// 4. requireOwnership — Enforce resource ownership
// Must be used AFTER requireAuth
//
// Usage:
// router.put(
//   '/:id',
//   requireAuth,
//   requireOwnership(getResource),
//   updatePost
// )
//
// getResource is an async function:
// (req) => resource
// ============================================================

export function requireOwnership(
  getResource,
  ownerField = 'authorId'
) {
  return async (req, res, next) => {
    try {
      // Make sure user is authenticated
      if (!req.user) {
        throw new UnauthorizedError(
          'Authentication required'
        );
      }

      // Fetch the resource
      const resource = await getResource(req);

      // If resource doesn't exist,
      // let route handler deal with 404
      if (!resource) {
        return next();
      }

      // Admins bypass ownership check
      if (req.user.role === 'admin') {
        return next();
      }

      // Check ownership
      if (resource[ownerField] !== req.user.id) {
        logAuth('failure', req, {
          reason: `Not owner (user=${req.user.id}, owner=${resource[ownerField]})`,
        });

        throw new ForbiddenError(
          'You can only modify your own resources',
          {
            resourceOwnerId: resource[ownerField],
            yourId: req.user.id,
          }
        );
      }

      logAuth('success', req, {
        reason: 'ownership verified',
      });

      next();
    } catch (error) {
      next(error);
    }
  };
}


// ============================================================
// 5. requireVerified — Enforce email verification
// ============================================================

export function requireVerified(req, res, next) {
  // Make sure user is authenticated
  if (!req.user) {
    return next(
      new UnauthorizedError(
        'Authentication required'
      )
    );
  }

  // Check email verification
  if (!req.user.emailVerified) {
    return next(
      new ForbiddenError(
        'Email verification required',
        {
          hint: 'Please verify your email before continuing',
        }
      )
    );
  }

  next();
}
