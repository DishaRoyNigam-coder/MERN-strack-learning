
import express from 'express';
import {
  listComments,
  createComment,
} from '../controllers/comments.controller.js';
import {
  listPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  likePost,
} from '../controllers/posts.controller.js';

import {
  requireAuth,
  optionalAuth,
} from '../middleware/auth.js';

const router = express.Router();

// GET /api/posts/meta
// Public query documentation
router.get('/meta', (req, res) => {
  res.json({
    success: true,
    pagination: {
      page: 'Positive integer, default 1',
      limit: 'Positive integer, default 10, maximum 100',
    },
    sorting: {
      sort: 'Comma-separated fields: id, title, createdAt, updatedAt, publishedAt, likes, views',
      order: 'Comma-separated values: asc or desc (default desc)',
      example: '?sort=likes,createdAt&order=desc,asc',
    },
    filtering: {
      authorId: 'Author ID (number)',
      categoryId: 'Category ID (number)',
      category: 'Category slug (e.g., nodejs)',
      status: 'draft or published (privileged users only)',
      tag: 'Single tag',
      tags: 'Comma-separated tags (AND logic)',
      minLikes: 'Minimum likes (number)',
      maxLikes: 'Maximum likes (number)',
      minViews: 'Minimum views (number)',
      from: 'Start date (ISO date)',
      to: 'End date (ISO date)',
      q: 'Search in title, body, excerpt, and tags',
    },
    fieldSelection: {
      fields: 'Comma-separated fields: id, title, slug, excerpt, body, authorId, categoryId, status, tags, likes, views, createdAt, updatedAt, publishedAt, author, category, commentCount',
      example: '?fields=id,title,author,likes',
    },
    examples: [
      'GET /api/posts?page=1&limit=10',
      'GET /api/posts?sort=likes&order=desc',
      'GET /api/posts?authorId=2&status=published',
      'GET /api/posts?category=nodejs&sort=createdAt&order=desc',
      'GET /api/posts?tags=node,express',
      'GET /api/posts?q=async&fields=id,title,likes',
      'GET /api/posts?minLikes=5&from=2026-01-01&to=2026-12-31',
    ],
  });
});

// GET /api/posts
// Public users see published posts; authenticated editors can see drafts.
router.get('/', optionalAuth, listPosts);

// POST /api/posts
// Login required.
router.post('/', requireAuth, createPost);
// GET /api/posts/:postId/comments
// Public list, optional authentication
router.get('/:postId/comments', optionalAuth, listComments);

// POST /api/posts/:postId/comments
// Login required
router.post('/:postId/comments', requireAuth, createComment);
// GET /api/posts/:id
// Optional authentication provides canEdit/canDelete information.
router.get('/:id', optionalAuth, getPost);

// PATCH /api/posts/:id
// Login required.
router.patch('/:id', requireAuth, updatePost);

// DELETE /api/posts/:id
// Login required.
router.delete('/:id', requireAuth, deletePost);

// POST /api/posts/:id/like
router.post('/:id/like', likePost);

export default router;
