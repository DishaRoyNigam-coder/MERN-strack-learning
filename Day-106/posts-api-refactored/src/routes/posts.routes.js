// src/routes/posts.routes.js

import { Router } from 'express';
import {
  getAllPosts,
  getPostById,
  createPost,
  replacePost,
  updatePost,
  deletePost,
  likePost,
} from '../controllers/posts.controller.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = Router();

// ============================================================
// PUBLIC ROUTES
// ============================================================

router.get('/', optionalAuth, getAllPosts);
router.get('/:id', optionalAuth, getPostById);
router.post('/:id/like', optionalAuth, likePost);

// ============================================================
// 🔐 PROTECTED ROUTES
// ============================================================

// ⭐ THE KEY ROUTE — POST /api/posts requires authentication
router.post('/', requireAuth, createPost);

// These require auth; ownership/role checked in controller
router.put('/:id', requireAuth, replacePost);
router.patch('/:id', requireAuth, updatePost);
router.delete('/:id', requireAuth, deletePost);

export default router;