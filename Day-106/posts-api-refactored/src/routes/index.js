// src/routes/index.js

import { Router } from 'express';
import authRouter from './auth.routes.js';
import postsRouter from './posts.routes.js';

const router = Router();

router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: '📝 Posts API with JWT Authentication',
    version: '2.0.0',
    endpoints: {
      auth: {
        'POST /api/auth/register': 'Create a new account',
        'POST /api/auth/login': 'Login and get a JWT token',
        'GET /api/auth/me': 'Get current user (requires token)',
      },
      posts: {
        'GET /api/posts': 'List all posts (public)',
        'GET /api/posts/:id': 'Get single post (public)',
        'POST /api/posts': 'Create post (requires auth)',
        'PUT /api/posts/:id': 'Replace post (requires auth)',
        'PATCH /api/posts/:id': 'Update post (requires auth)',
        'DELETE /api/posts/:id': 'Delete post (requires admin/editor)',
        'POST /api/posts/:id/like': 'Like a post (public)',
      },
    },
  });
});

router.use('/auth', authRouter);
router.use('/posts', postsRouter);

export default router;