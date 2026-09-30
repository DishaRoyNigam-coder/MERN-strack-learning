// src/utils/jwt.js

import jwt from 'jsonwebtoken';
import { authConfig } from '../config/auth.js';
import { UnauthorizedError } from '../errors/AppError.js';

/**
 * Sign a new JWT token
 * @param {object} payload - The data to encode (userId, role, etc.)
 * @returns {string} The signed JWT token
 */
export function signToken(payload) {
  return jwt.sign(payload, authConfig.jwtSecret, {
    expiresIn: authConfig.jwtExpiresIn,
    issuer: authConfig.jwtIssuer,
    audience: authConfig.jwtAudience,
  });
}

/**
 * Verify a JWT token
 * @param {string} token - The JWT to verify
 * @returns {object} The decoded payload
 * @throws {UnauthorizedError} If token is invalid or expired
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, authConfig.jwtSecret, {
      issuer: authConfig.jwtIssuer,
      audience: authConfig.jwtAudience,
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new UnauthorizedError('Token has expired', {
        expiredAt: error.expiredAt,
      });
    }
    if (error.name === 'JsonWebTokenError') {
      throw new UnauthorizedError('Invalid token', {
        reason: error.message,
      });
    }
    if (error.name === 'NotBeforeError') {
      throw new UnauthorizedError('Token not yet valid', {
        date: error.date,
      });
    }
    throw new UnauthorizedError('Token verification failed');
  }
}

/**
 * Decode a token without verifying (for debugging)
 * @param {string} token
 * @returns {object|null}
 */
export function decodeToken(token) {
  return jwt.decode(token);
}

/**
 * Extract the token from a Bearer header
 * @param {string} authHeader - e.g. "Bearer eyJhbGc..."
 * @returns {string|null} The token or null
 */
export function extractBearerToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7); // Remove "Bearer "
}