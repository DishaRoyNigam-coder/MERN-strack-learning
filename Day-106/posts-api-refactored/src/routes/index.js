// src/routes/index.js

import { Router } from 'express';
import postsRouter from './posts.routes.js';

const router = Router();

// API index — lists all available endpoints
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: '📝 Posts API',
    version: '1.0.0',
    endpoints: {
      posts: {
        'GET /api/posts': 'List all posts',
        'GET /api/posts/:id': 'Get a single post',
        'POST /api/posts': 'Create a new post',
        'PUT /api/posts/:id': 'Full replace',
        'PATCH /api/posts/:id': 'Partial update',
        'DELETE /api/posts/:id': 'Delete a post',
        'POST /api/posts/:id/like': 'Increment likes',
      },
    },
  });
});

// Mount sub-routers
router.use('/posts', postsRouter);

export default router;