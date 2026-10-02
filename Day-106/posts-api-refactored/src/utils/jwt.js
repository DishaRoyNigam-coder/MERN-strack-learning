// src/utils/jwt.js

import jwt from 'jsonwebtoken';
import { authConfig } from '../config/auth.js';
import { UnauthorizedError } from '../errors/AppError.js';

// ============================================================
// SIGN TOKEN
// ============================================================

export function signToken(payload, options = {}) {
  return jwt.sign(
    payload,
    authConfig.jwtSecret,
    {
      expiresIn: options.expiresIn || authConfig.jwtExpiresIn,
      issuer: authConfig.jwtIssuer,
      audience: authConfig.jwtAudience,
      ...options,
    }
  );
}

// ============================================================
// VERIFY TOKEN
// ============================================================

export function verifyToken(token) {
  try {
    return jwt.verify(token, authConfig.jwtSecret, {
      issuer: authConfig.jwtIssuer,
      audience: authConfig.jwtAudience,
    });
  } catch (error) {
    // Distinguish between token error types for better debugging
    switch (error.name) {
      case 'TokenExpiredError':
        throw new UnauthorizedError('Token has expired', {
          expiredAt: error.expiredAt,
          hint: 'Please log in again',
        });
      case 'JsonWebTokenError':
        throw new UnauthorizedError('Invalid token', {
          reason: error.message,
        });
      case 'NotBeforeError':
        throw new UnauthorizedError('Token not yet valid', {
          date: error.date,
        });
      default:
        throw new UnauthorizedError('Token verification failed');
    }
  }
}

// ============================================================
// DECODE TOKEN (without verification, for debugging)
// ============================================================

export function decodeToken(token) {
  return jwt.decode(token, { complete: true });
}

// ============================================================
// EXTRACT BEARER TOKEN
// ============================================================

export function extractBearerToken(authHeader) {
  if (!authHeader) return null;
  if (typeof authHeader !== 'string') return null;
  if (!authHeader.startsWith('Bearer ')) return null;

  const token = authHeader.substring(7).trim();
  return token.length > 0 ? token : null;
}