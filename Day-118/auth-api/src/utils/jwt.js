// src/utils/jwt.js

import jwt from 'jsonwebtoken';
import { authConfig } from '../config/auth.js';
import { UnauthorizedError } from '../errors/AppError.js';

export function signToken(payload, options = {}) {
  return jwt.sign(payload, authConfig.jwtSecret, {
    expiresIn: options.expiresIn || authConfig.jwtExpiresIn,
    issuer: authConfig.jwtIssuer,
    audience: authConfig.jwtAudience,
    ...options,
  });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, authConfig.jwtSecret, {
      issuer: authConfig.jwtIssuer,
      audience: authConfig.jwtAudience,
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new UnauthorizedError('Token has expired', { expiredAt: error.expiredAt });
    }
    if (error.name === 'JsonWebTokenError') {
      throw new UnauthorizedError('Invalid token', { reason: error.message });
    }
    throw new UnauthorizedError('Token verification failed');
  }
}

export function extractBearerToken(header) {
  if (!header || typeof header !== 'string') return null;
  if (!header.startsWith('Bearer ')) return null;
  const token = header.substring(7).trim();
  return token.length > 0 ? token : null;
}