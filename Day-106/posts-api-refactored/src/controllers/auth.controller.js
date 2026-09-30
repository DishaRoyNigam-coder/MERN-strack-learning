// src/controllers/auth.controller.js

import { authService } from '../services/auth.service.js';
import { ValidationError } from '../errors/AppError.js';

// ============================================================
// POST /api/auth/login
// ============================================================

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // Validate input
    const errors = [];
    if (!email || typeof email !== 'string') {
      errors.push({ field: 'email', message: 'Email is required' });
    }
    if (!password || typeof password !== 'string') {
      errors.push({ field: 'password', message: 'Password is required' });
    }
    if (errors.length > 0) {
      throw new ValidationError('Login validation failed', errors);
    }

    // Authenticate
    const { token, user } = await authService.login(email, password);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      tokenType: 'Bearer',
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      user,
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

    // Validate input
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

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      tokenType: 'Bearer',
      user,
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================
// GET /api/auth/me  (requires auth)
// ============================================================

export async function getMe(req, res, next) {
  try {
    // req.user was set by requireAuth middleware
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
}