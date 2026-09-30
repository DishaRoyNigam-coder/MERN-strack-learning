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
import { requireAuth, requireRole, optionalAuth } from '../middleware/auth.js';

const router = Router();

// ============================================================
// PUBLIC / OPTIONAL AUTH ROUTES
// ============================================================

router.get('/', optionalAuth, getAllPosts);
router.get('/:id', optionalAuth, getPostById);
router.post('/:id/like', optionalAuth, likePost);

// ============================================================
// PROTECTED ROUTES (require login)
// ============================================================

router.post('/', requireAuth, createPost);
router.put('/:id', requireAuth, replacePost);
router.patch('/:id', requireAuth, updatePost);
router.delete('/:id', requireAuth, requireRole('admin', 'editor'), deletePost);

export default router;