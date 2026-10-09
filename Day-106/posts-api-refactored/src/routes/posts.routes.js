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
import { generalLimiter } from '../middleware/rateLimit.js';

const router = Router();

// Apply the general limiter to all routes in this router
router.use(generalLimiter);

// Public routes
router.get('/', optionalAuth, getAllPosts);
router.get('/:id', optionalAuth, getPostById);

// 🔥 Like has its own tighter limit (uses generalLimiter keyGenerator)
router.post('/:id/like', optionalAuth, likePost);

// Protected routes
router.post('/', requireAuth, createPost);
router.put('/:id', requireAuth, replacePost);
router.patch('/:id', requireAuth, updatePost);
router.delete('/:id', requireAuth, deletePost);

export default router;