// routes/posts.js

import { Router } from 'express';
import { posts, getNextId } from '../data/posts.js';
import { validatePost, validateId } from '../utils/validate.js';
import { NotFoundError } from '../error/AppError.js';

const router = Router();

// ============================================================
// GET /api/posts — List all posts (with filtering, sorting, pagination)
// ============================================================

router.get('/', (req, res) => {
  let result = [...posts];

  // --- Filtering ---
  const { author, tag, published, q } = req.query;

  if (author) {
    result = result.filter(p =>
      p.author.toLowerCase().includes(author.toLowerCase())
    );
  }

  if (tag) {
    result = result.filter(p =>
      p.tags.some(t => t.toLowerCase() === tag.toLowerCase())
    );
  }

  if (published !== undefined) {
    const isPublished = published === 'true';
    result = result.filter(p => p.published === isPublished);
  }

  // --- Search (title + body) ---
  if (q) {
    const term = q.toLowerCase();
    result = result.filter(p =>
      p.title.toLowerCase().includes(term) ||
      p.body.toLowerCase().includes(term)
    );
  }

  // --- Sorting ---
  const { sort = 'createdAt', order = 'desc' } = req.query;
  const validSortFields = ['id', 'title', 'author', 'createdAt', 'likes'];

  if (validSortFields.includes(sort)) {
    result.sort((a, b) => {
      const aVal = a[sort];
      const bVal = b[sort];
      if (aVal < bVal) return order === 'asc' ? -1 : 1;
      if (aVal > bVal) return order === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // --- Field selection ---
  const { fields } = req.query;
  if (fields) {
    const selectedFields = fields.split(',').map(f => f.trim());
    result = result.map(post => {
      const filtered = {};
      selectedFields.forEach(field => {
        if (post[field] !== undefined) filtered[field] = post[field];
      });
      return filtered;
    });
  }

  // --- Pagination ---
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
  const total = result.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const paginatedResult = result.slice(startIndex, startIndex + limit);

  // --- Response ---
  res.status(200).json({
    success: true,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
    count: paginatedResult.length,
    data: paginatedResult,
  });
});

// ============================================================
// GET /api/posts/:id — Get a single post
// ============================================================

router.get('/:id', (req, res) => {
  const id = validateId(req.params.id);
  const post = posts.find(p => p.id === id);

  if (!post) {
    throw new NotFoundError('Post', { id });
  }

  res.status(200).json({
    success: true,
    data: post,
  });
});

// ============================================================
// POST /api/posts — Create a new post
// ============================================================

router.post('/', (req, res) => {
  // 1. Validate input
  validatePost(req.body);

  // 2. Build new post
  const now = new Date().toISOString();
  const newPost = {
    id: getNextId(),
    title: req.body.title.trim(),
    body: req.body.body.trim(),
    author: req.body.author.trim(),
    tags: req.body.tags || [],
    published: req.body.published || false,
    likes: 0,
    createdAt: now,
    updatedAt: now,
  };

  // 3. Save (in-memory)
  posts.push(newPost);

  // 4. Respond with 201 Created + Location header
  res
    .status(201)
    .location(`/api/posts/${newPost.id}`)
    .json({
      success: true,
      message: 'Post created successfully',
      data: newPost,
    });
});

// ============================================================
// PUT /api/posts/:id — Full update (replace)
// ============================================================

router.put('/:id', (req, res) => {
  const id = validateId(req.params.id);
  const index = posts.findIndex(p => p.id === id);

  if (index === -1) {
    throw new NotFoundError('Post', { id });
  }

  // PUT requires ALL fields (full replacement)
  validatePost(req.body);

  const existing = posts[index];
  const updatedPost = {
    id: existing.id,
    title: req.body.title.trim(),
    body: req.body.body.trim(),
    author: req.body.author.trim(),
    tags: req.body.tags || [],
    published: req.body.published || false,
    likes: existing.likes, // Preserve likes
    createdAt: existing.createdAt, // Preserve createdAt
    updatedAt: new Date().toISOString(), // Update timestamp
  };

  posts[index] = updatedPost;

  res.status(200).json({
    success: true,
    message: 'Post replaced successfully (PUT)',
    data: updatedPost,
  });
});

// ============================================================
// PATCH /api/posts/:id — Partial update
// ============================================================

router.patch('/:id', (req, res) => {
  const id = validateId(req.params.id);
  const post = posts.find(p => p.id === id);

  if (!post) {
    throw new NotFoundError('Post', { id });
  }

  // PATCH allows partial updates
  validatePost(req.body, true);

  // Build update object (only provided fields)
  const updates = {};
  const allowed = ['title', 'body', 'author', 'tags', 'published'];

  allowed.forEach(field => {
    if (req.body[field] !== undefined) {
      updates[field] = typeof req.body[field] === 'string'
        ? req.body[field].trim()
        : req.body[field];
    }
  });

  // Apply updates
  Object.assign(post, updates);
  post.updatedAt = new Date().toISOString();

  res.status(200).json({
    success: true,
    message: 'Post updated successfully (PATCH)',
    data: post,
  });
});

// ============================================================
// DELETE /api/posts/:id — Delete a post
// ============================================================

router.delete('/:id', (req, res) => {
  const id = validateId(req.params.id);
  const index = posts.findIndex(p => p.id === id);

  if (index === -1) {
    throw new NotFoundError('Post', { id });
  }

  const [deleted] = posts.splice(index, 1);

  // 204 No Content (standard for DELETE) — OR return deleted resource
  res.status(200).json({
    success: true,
    message: 'Post deleted successfully',
    data: deleted,
  });
});

// ============================================================
// POST /api/posts/:id/like — Custom action (increments likes)
// ============================================================

router.post('/:id/like', (req, res) => {
  const id = validateId(req.params.id);
  const post = posts.find(p => p.id === id);

  if (!post) {
    throw new NotFoundError('Post', { id });
  }

  post.likes += 1;
  post.updatedAt = new Date().toISOString();

  res.status(200).json({
    success: true,
    message: 'Post liked',
    data: { id: post.id, likes: post.likes },
  });
});

// ============================================================
// GET /api/posts/:id/comments — Nested resource (example)
// ============================================================

router.get('/:id/comments', (req, res) => {
  const id = validateId(req.params.id);
  const post = posts.find(p => p.id === id);

  if (!post) {
    throw new NotFoundError('Post', { id });
  }

  // In a real app, you'd fetch comments from a separate collection
  res.status(200).json({
    success: true,
    postId: id,
    count: 0,
    data: [],
    note: 'Comments feature coming soon',
  });
});

export default router;