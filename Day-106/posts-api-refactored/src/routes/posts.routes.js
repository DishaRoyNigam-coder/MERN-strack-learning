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

const router = Router();

// ============================================================
// ROUTES
// ============================================================

// GET /api/posts — List all posts
router.get('/', getAllPosts);

// GET /api/posts/:id — Get one post
router.get('/:id', getPostById);

// POST /api/posts — Create a post
router.post('/', createPost);

// PUT /api/posts/:id — Full replace
router.put('/:id', replacePost);

// PATCH /api/posts/:id — Partial update
router.patch('/:id', updatePost);

// DELETE /api/posts/:id — Delete
router.delete('/:id', deletePost);

// POST /api/posts/:id/like — Custom action
router.post('/:id/like', likePost);

export default router;