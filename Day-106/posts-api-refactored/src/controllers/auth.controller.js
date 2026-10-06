// src/controllers/auth.controller.js

import { authService } from '../services/auth.service.js';
import { ValidationError } from '../errors/AppError.js';
import { setAuthCookie, clearAuthCookie } from '../utils/cookies.js';

// ============================================================
// POST /api/auth/login
// ============================================================

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const errors = [];
    if (!email) errors.push({ field: 'email', message: 'Email is required' });
    if (!password) errors.push({ field: 'password', message: 'Password is required' });
    if (errors.length > 0) {
      throw new ValidationError('Login validation failed', errors);
    }

    const { token, user } = await authService.login(email, password);

    // ✅ Set JWT in httpOnly cookie
    setAuthCookie(res, token);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      // ⚠️ We no longer return the token in the body!
      // The browser will automatically send the cookie with future requests
      user,
      // For API clients (Postman, mobile), you might still want the token:
      // token, ← Commented out for security
      authMethod: 'cookie',
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================
// POST /api/auth/register
// ============================================================

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    const errors = [];
    if (!name || name.trim().length < 2) {
      errors.push({ field: 'name', message: 'Name must be at least 2 characters' });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push({ field: 'email', message: 'Valid email is required' });
    }
    if (!password || password.length < 6) {
      errors.push({ field: 'password', message: 'Password must be at least 6 characters' });
    }
    if (errors.length > 0) {
      throw new ValidationError('Registration validation failed', errors);
    }

    const { token, user } = await authService.register({ name, email, password });

    // ✅ Set JWT in httpOnly cookie
    setAuthCookie(res, token);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      user,
      authMethod: 'cookie',
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================
// POST /api/auth/logout
// ============================================================

export function logout(req, res, next) {
  try {
    // Clear the cookie
    clearAuthCookie(res);

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================
// GET /api/auth/me
// ============================================================

export function getMe(req, res, next) {
  try {
    // req.user is set by requireAuth middleware
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
}