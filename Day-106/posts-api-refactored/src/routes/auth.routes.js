// src/routes/auth.routes.js

import { Router } from 'express';
import {
  login,
  register,
  logout,
  getMe,
  uploadAvatar,
  deleteAvatar,
} from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { uploadAvatar as uploadAvatarMiddleware } from '../middleware/upload.js';
import {
  loginLimiter,
  registerLimiter,
  passwordResetLimiter,
  uploadLimiter,
} from '../middleware/rateLimit.js';

const router = Router();

// ============================================================
// PUBLIC ROUTES (with rate limiting!)
// ============================================================

// 🔐 Login — 5 attempts per 15 min per IP+email
router.post('/login', loginLimiter, login);

// 📝 Register — 3 signups per hour per IP
router.post('/register', registerLimiter, register);

// 🚪 Logout — no limit needed
router.post('/logout', logout);

// ============================================================
// PROTECTED ROUTES
// ============================================================

router.get('/me', requireAuth, getMe);

// Upload — 10 uploads per hour per user
router.post(
  '/me/avatar',
  requireAuth,
  uploadLimiter,
  uploadAvatarMiddleware.single('avatar'),
  uploadAvatar
);

router.delete('/me/avatar', requireAuth, deleteAvatar);

export default router;