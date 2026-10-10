// src/routes/auth.routes.js

import { Router } from 'express';
import {
  register, login, logout, getMe, updateMe, changePassword,
  forgotPassword, resetPassword, uploadAvatarHandler,
} from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { uploadAvatar } from '../middleware/upload.js';
import {
  loginLimiter, registerLimiter, passwordResetLimiter,
} from '../middleware/rateLimit.js';

const router = Router();

// Public
router.post('/register', registerLimiter, register);
router.post('/login', loginLimiter, login);
router.post('/logout', logout);
router.post('/forgot-password', passwordResetLimiter, forgotPassword);
router.post('/reset-password', resetPassword);

// Protected
router.get('/me', requireAuth, getMe);
router.patch('/me', requireAuth, updateMe);
router.patch('/me/password', requireAuth, changePassword);
router.post('/me/avatar', requireAuth, uploadAvatar.single('avatar'), uploadAvatarHandler);

export default router;