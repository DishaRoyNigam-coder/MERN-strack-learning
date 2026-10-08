// src/controllers/auth.controller.js

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { users } from '../data/store.js';
import { uploadConfig } from '../config/upload.js';
import { NotFoundError, ValidationError } from '../errors/AppError.js';
import { authService } from '../services/auth.service.js';
import { setAuthCookie, clearAuthCookie } from '../utils/cookies.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================
// POST /api/auth/register
// ============================================================
export async function register(req, res, next) {
  try {
    const result = await authService.register(req.body);
    setAuthCookie(res, result.token);
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: { user: result.user }
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================
// POST /api/auth/login
// ============================================================
export async function login(req, res, next) {
  try {
    const result = await authService.login(req.body);
    setAuthCookie(res, result.token);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      data: { user: result.user }
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================
// POST /api/auth/logout
// ============================================================
export async function logout(req, res, next) {
  try {
    clearAuthCookie(res);
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================
// GET /api/auth/me
// Fetch current logged-in user profile
// ============================================================
export async function getMe(req, res, next) {
  try {
    // Find user using ID attached by your auth middleware (req.userId)
    const user = users.find(u => u.id === req.userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    // Strip password out before sending
    const { passwordHash, ...safeUser } = user;

    res.status(200).json({
      success: true,
      data: { user: safeUser }
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================
// POST /api/auth/me/avatar
// Upload a profile picture (multipart/form-data)
// ============================================================
export async function uploadAvatar(req, res, next) {
  try {
    if (!req.file) {
      throw new ValidationError('No file uploaded', {
        hint: 'Use form-data with field name "avatar"',
      });
    }

    const user = users.find(u => u.id === req.userId);
    if (!user) {
      fs.unlink(req.file.path, () => {});
      throw new NotFoundError('User');
    }

    if (user.avatar) {
      const oldPath = path.join(
        __dirname,
        '../../',
        user.avatar.replace('/uploads/', 'uploads/')
      );
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    const relativePath = path.relative(
      path.join(__dirname, '../..'),
      req.file.path
    ).replace(/\\/g, '/');

    const publicUrl = `/${relativePath}`;

    user.avatar = publicUrl;
    user.updatedAt = new Date().toISOString();

    const { passwordHash, ...safeUser } = user;

    res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: {
        user: safeUser,
        file: {
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
          mimeType: req.file.mimetype,
          url: publicUrl,
        },
      },
    });
  } catch (error) {
    if (req.file && !req.file.saved) {
      fs.unlink(req.file.path, () => {});
    }
    next(error);
  }
}

// ============================================================
// DELETE /api/auth/me/avatar
// Remove the profile picture
// ============================================================
export async function deleteAvatar(req, res, next) {
  try {
    const user = users.find(u => u.id === req.userId);
    if (!user) throw new NotFoundError('User');

    if (!user.avatar) {
      throw new ValidationError('No avatar to delete');
    }

    const filePath = path.join(
      __dirname,
      '../..',
      user.avatar.replace('/uploads/', 'uploads/')
    );

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    user.avatar = null;
    user.updatedAt = new Date().toISOString();

    const { passwordHash, ...safeUser } = user;

    res.status(200).json({
      success: true,
      message: 'Avatar deleted',
      data: { user: safeUser },
    });
  } catch (error) {
    next(error);
  }
}
