// src/utils/cookies.js

import { authConfig } from '../config/auth.js';

/**
 * Set the auth cookie with the JWT
 */
export function setAuthCookie(res, token) {
  res.cookie(authConfig.cookie.name, token, {
    httpOnly: authConfig.cookie.httpOnly,
    secure: authConfig.cookie.secure,
    sameSite: authConfig.cookie.sameSite,
    maxAge: authConfig.cookie.maxAge,
    path: authConfig.cookie.path,
  });
}

/**
 * Clear the auth cookie
 * Must use the SAME attributes as when set, or the browser won't clear it
 */
export function clearAuthCookie(res) {
  res.clearCookie(authConfig.cookie.name, {
    httpOnly: authConfig.cookie.httpOnly,
    secure: authConfig.cookie.secure,
    sameSite: authConfig.cookie.sameSite,
    path: authConfig.cookie.path,
  });
}

/**
 * Extract the token from a request (cookie first, then Bearer header)
 */
export function extractToken(req) {
  // 1. Try cookie first (browser-friendly)
  if (req.cookies && req.cookies[authConfig.cookie.name]) {
    return {
      token: req.cookies[authConfig.cookie.name],
      source: 'cookie',
    };
  }

  // 2. Fall back to Authorization header (mobile/API-friendly)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    if (token.length > 0) {
      return { token, source: 'bearer' };
    }
  }

  // 3. No token found
  return { token: null, source: null };
}