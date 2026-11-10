// src/routes/posts.routes.js

import { Router } from 'express';
import {
  listPosts, getPost, createPost, updatePost, deletePost, likePost,
} from '../controllers/posts.controller.js';
import {
  listComments, createComment,
} from '../controllers/comments.controller.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { generalLimiter } from '../middleware/rateLimit.js';

const router = Router();
router.use(generalLimiter);

router.get('/', optionalAuth, listPosts);
router.get('/:id', optionalAuth, getPost);
router.post('/', requireAuth, createPost);
router.put('/:id', requireAuth, updatePost);
router.patch('/:id', requireAuth, updatePost);
router.delete('/:id', requireAuth, deletePost);
router.post('/:id/like', optionalAuth, likePost);

// Nested comments
router.get('/:postId/comments', optionalAuth, listComments);
router.post('/:postId/comments', requireAuth, createComment);

export default router;