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

const router = Router();

// Public routes
router.post('/login', login);
router.post('/register', register);
router.post('/logout', logout);

// Protected routes
router.get('/me', requireAuth, getMe);

// Avatar upload — multipart/form-data with field "avatar"
router.post(
  '/me/avatar',
  requireAuth,
  uploadAvatarMiddleware.single('avatar'),
  uploadAvatar
);

// Avatar delete
router.delete('/me/avatar', requireAuth, deleteAvatar);

export default router;