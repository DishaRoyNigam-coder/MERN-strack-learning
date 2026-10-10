// src/utils/cookies.js
import { authConfig } from '../config/auth.js';
import { extractBearerToken } from './jwt.js';

export function setAuthCookie(res, token) {
  res.cookie(authConfig.cookie.name, token, {
    httpOnly: authConfig.cookie.httpOnly,
    secure: authConfig.cookie.secure,
    sameSite: authConfig.cookie.sameSite,
    maxAge: authConfig.cookie.maxAge,
    path: authConfig.cookie.path,
  });
}

export function clearAuthCookie(res) {
  res.clearCookie(authConfig.cookie.name, {
    httpOnly: authConfig.cookie.httpOnly,
    secure: authConfig.cookie.secure,
    sameSite: authConfig.cookie.sameSite,
    path: authConfig.cookie.path,
  });
}

export function extractToken(req) {
  if (req.cookies && req.cookies[authConfig.cookie.name]) {
    return { token: req.cookies[authConfig.cookie.name], source: 'cookie' };
  }
  const token = extractBearerToken(req.headers.authorization);
  if (token) return { token, source: 'bearer' };
  return { token: null, source: null };
}