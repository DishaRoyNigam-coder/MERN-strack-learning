// src/routes/index.js

import { Router } from 'express';
import authRouter from './auth.routes.js';
import postsRouter from './posts.routes.js';
import categoriesRouter from './categories.routes.js';
import usersRouter from './users.routes.js';
import commentsRouter from './comments.routes.js';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    success: true,
    message: '📝 Blog API',
    version: '1.0.0',
    resources: ['users', 'posts', 'comments', 'categories'],
    endpoints: {
      auth: {
        'POST /api/auth/register': 'Create account',
        'POST /api/auth/login': 'Login',
        'POST /api/auth/logout': 'Logout',
        'GET /api/auth/me': 'Current user (auth)',
      },
      posts: {
        'GET /api/posts': 'List (filter, sort, paginate, search)',
        'GET /api/posts/:id': 'Get by id or slug',
        'POST /api/posts': 'Create (auth)',
        'PATCH /api/posts/:id': 'Update (author or editor)',
        'DELETE /api/posts/:id': 'Delete (author or editor)',
        'POST /api/posts/:id/like': 'Like',
        'GET /api/posts/:postId/comments': 'List comments',
        'POST /api/posts/:postId/comments': 'Add comment (auth)',
      },
      categories: {
        'GET /api/categories': 'List all',
        'GET /api/categories/:idOrSlug': 'Get one',
        'POST /api/categories': 'Create (editor+)',
        'PATCH /api/categories/:id': 'Update (editor+)',
        'DELETE /api/categories/:id': 'Delete (admin)',
      },
      comments: {
        'PATCH /api/comments/:id': 'Edit own comment',
        'DELETE /api/comments/:id': 'Delete (author or editor)',
        'PATCH /api/comments/:id/moderate': 'Moderate (editor+)',
      },
      users: {
        'GET /api/users': 'List (admin)',
        'GET /api/users/:id': 'Public profile',
        'GET /api/auth/me': 'Own profile (auth)',
        'PATCH /api/auth/me': 'Update own profile (auth)',
        'DELETE /api/users/:id': 'Delete (admin)',
      },
    },
  });
});

router.use('/auth', authRouter);
router.use('/posts', postsRouter);
router.use('/categories', categoriesRouter);
router.use('/comments', commentsRouter);
router.use('/users', usersRouter);

export default router;