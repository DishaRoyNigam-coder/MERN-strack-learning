// src/routes/index.js

import { Router } from 'express';
import authRouter from './auth.routes.js';
import postsRouter from './posts.routes.js';
import adminRouter from './admin.routes.js';

const router = Router();

router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: '📝 Posts API with RBAC',
    version: '3.0.0',
    roles: {
      user: 'Can create posts, edit/delete own posts',
      editor: 'Can edit/delete any post, publish content',
      moderator: 'Can ban users, moderate content',
      admin: 'Full access to everything',
    },
    endpoints: {
      auth: {
        'POST /api/auth/register': 'Create a new account (role: user)',
        'POST /api/auth/login': 'Login and get a JWT',
        'GET /api/auth/me': 'Get current user (requires token)',
      },
      posts: {
        'GET /api/posts': 'List all posts (public)',
        'GET /api/posts/:id': 'Get single post (public)',
        'POST /api/posts': 'Create post (any authenticated user)',
        'PUT /api/posts/:id': 'Replace post (author or editor+)',
        'PATCH /api/posts/:id': 'Update post (author or editor+)',
        'DELETE /api/posts/:id': 'Delete post (author or editor+)',
        'POST /api/posts/:id/like': 'Like a post (public)',
      },
      admin: {
        'GET /api/admin/users': 'List all users (admin only)',
        'GET /api/admin/users/:id': 'Get user by ID (admin only)',
        'PATCH /api/admin/users/:id/role': 'Change user role (admin only)',
        'DELETE /api/admin/users/:id': 'Delete user (admin only)',
        'GET /api/admin/stats': 'Dashboard stats (admin only)',
      },
    },
  });
});

router.use('/auth', authRouter);
router.use('/posts', postsRouter);
router.use('/admin', adminRouter);

export default router;