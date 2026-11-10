// src/controllers/auth.controller.js

import { authService } from '../services/auth.service.js';
import { ValidationError } from '../errors/AppError.js';
import { setAuthCookie, clearAuthCookie } from '../utils/cookies.js';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    const errors = [];
    if (!name || name.trim().length < 2) errors.push({ field: 'name', message: 'Name must be at least 2 characters' });
    if (!email || !emailRegex.test(email)) errors.push({ field: 'email', message: 'Valid email is required' });
    if (!password || password.length < 6) errors.push({ field: 'password', message: 'Password must be at least 6 characters' });

    if (errors.length) throw new ValidationError('Registration validation failed', errors);

    const { token, user } = await authService.register({ name, email, password });
    setAuthCookie(res, token);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token, // also returned for API clients
      tokenType: 'Bearer',
      user,
    });
  } catch (err) { next(err); }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const errors = [];
    if (!email) errors.push({ field: 'email', message: 'Email is required' });
    if (!password) errors.push({ field: 'password', message: 'Password is required' });
    if (errors.length) throw new ValidationError('Login validation failed', errors);

    const { token, user } = await authService.login(email, password);
    setAuthCookie(res, token);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      tokenType: 'Bearer',
      user,
    });
  } catch (err) { next(err); }
}

export function logout(req, res, next) {
  try {
    clearAuthCookie(res);
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (err) { next(err); }
}

export function getMe(req, res, next) {
  try {
    const user = authService.getProfile(req.userId);
    res.status(200).json({ success: true, user });
  } catch (err) { next(err); }
}

export async function updateMe(req, res, next) {
  try {
    const updates = {};
    if (req.body.name !== undefined) updates.name = req.body.name;
    if (req.body.email !== undefined) {
      if (!emailRegex.test(req.body.email)) {
        throw new ValidationError('Invalid email', [{ field: 'email', message: 'Valid email is required' }]);
      }
      updates.email = req.body.email;
    }

    const user = await authService.updateProfile(req.userId, updates);
    res.status(200).json({ success: true, message: 'Profile updated', user });
  } catch (err) { next(err); }
}

export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;

    const errors = [];
    if (!currentPassword) errors.push({ field: 'currentPassword', message: 'Current password is required' });
    if (!newPassword || newPassword.length < 6) errors.push({ field: 'newPassword', message: 'New password must be at least 6 characters' });
    if (errors.length) throw new ValidationError('Validation failed', errors);

    await authService.changePassword(req.userId, currentPassword, newPassword);
    res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (err) { next(err); }
}

export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) throw new ValidationError('Email is required');

    await authService.requestPasswordReset(email);

    // Always return success to prevent email enumeration
    res.status(200).json({
      success: true,
      message: 'If that email exists, a reset link has been sent.',
    });
  } catch (err) { next(err); }
}

export async function resetPassword(req, res, next) {
  try {
    const { token, newPassword } = req.body;
    const errors = [];
    if (!token) errors.push({ field: 'token', message: 'Reset token is required' });
    if (!newPassword || newPassword.length < 6) errors.push({ field: 'newPassword', message: 'Password must be at least 6 characters' });
    if (errors.length) throw new ValidationError('Validation failed', errors);

    await authService.resetPassword(token, newPassword);
    res.status(200).json({ success: true, message: 'Password reset successfully' });
  } catch (err) { next(err); }
}

export function uploadAvatarHandler(req, res, next) {
  try {
    if (!req.file) throw new ValidationError('No file uploaded');

    const user = req.user;
    const users = require('../data/store.js').users;
    const dbUser = users.find(u => u.id === user.id);

    const relativePath = `avatars/${req.file.filename}`;
    dbUser.avatar = `/uploads/${relativePath}`;

    res.status(200).json({
      success: true,
      message: 'Avatar uploaded',
      avatar: dbUser.avatar,
    });
  } catch (err) { next(err); }
}