// src/services/posts.service.js

import { posts, getNextId } from '../data/store.js';
import { NotFoundError } from '../errors/AppError.js';

// ============================================================
// FILTERING & SORTING (Business logic)
// ============================================================

function applyFilters(posts, query) {
  let result = [...posts];

  const { author, tag, published, q } = query;

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

  if (q) {
    const term = q.toLowerCase();
    result = result.filter(p =>
      p.title.toLowerCase().includes(term) ||
      p.body.toLowerCase().includes(term)
    );
  }

  return result;
}

function applySorting(result, { sort = 'createdAt', order = 'desc' }) {
  const validSortFields = ['id', 'title', 'author', 'createdAt', 'likes'];
  if (!validSortFields.includes(sort)) return result;

  result.sort((a, b) => {
    const aVal = a[sort];
    const bVal = b[sort];
    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });

  return result;
}

function applyFieldSelection(result, fields) {
  if (!fields) return result;
  const selected = fields.split(',').map(f => f.trim());
  return result.map(post => {
    const filtered = {};
    selected.forEach(field => {
      if (post[field] !== undefined) filtered[field] = post[field];
    });
    return filtered;
  });
}

function applyPagination(result, { page = 1, limit = 10 }) {
  const p = Math.max(1, parseInt(page) || 1);
  const l = Math.min(100, Math.max(1, parseInt(limit) || 10));
  const total = result.length;
  const totalPages = Math.ceil(total / l);
  const startIndex = (p - 1) * l;
  const data = result.slice(startIndex, startIndex + l);

  return {
    pagination: {
      page: p,
      limit: l,
      total,
      totalPages,
      hasNext: p < totalPages,
      hasPrev: p > 1,
    },
    data,
  };
}

// ============================================================
// SERVICE METHODS
// ============================================================

export const postsService = {
  // List all posts
  list(query = {}) {
    let result = applyFilters(posts, query);
    result = applySorting(result, query);
    result = applyFieldSelection(result, query.fields);
    const { pagination, data } = applyPagination(result, query);
    return { pagination, count: data.length, data };
  },

  // Get by ID
  getById(id) {
    const post = posts.find(p => p.id === id);
    if (!post) throw new NotFoundError('Post', { id });
    return post;
  },

  // Create
  create(data) {
    const now = new Date().toISOString();
    const newPost = {
      id: getNextId(),
      title: data.title.trim(),
      body: data.body.trim(),
      author: data.author.trim(),
      tags: data.tags || [],
      published: data.published || false,
      likes: 0,
      createdAt: now,
      updatedAt: now,
    };
    posts.push(newPost);
    return newPost;
  },

  // Full replace (PUT)
  replace(id, data) {
    const index = posts.findIndex(p => p.id === id);
    if (index === -1) throw new NotFoundError('Post', { id });

    const existing = posts[index];
    const updated = {
      id,
      title: data.title.trim(),
      body: data.body.trim(),
      author: data.author.trim(),
      tags: data.tags || [],
      published: data.published || false,
      likes: existing.likes,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    };

    posts[index] = updated;
    return updated;
  },

  // Partial update (PATCH)
  update(id, data) {
    const post = posts.find(p => p.id === id);
    if (!post) throw new NotFoundError('Post', { id });

    const allowed = ['title', 'body', 'author', 'tags', 'published'];
    allowed.forEach(field => {
      if (data[field] !== undefined) {
        post[field] = typeof data[field] === 'string'
          ? data[field].trim()
          : data[field];
      }
    });
    post.updatedAt = new Date().toISOString();
    return post;
  },

  // Delete
  remove(id) {
    const index = posts.findIndex(p => p.id === id);
    if (index === -1) throw new NotFoundError('Post', { id });
    const [deleted] = posts.splice(index, 1);
    return deleted;
  },

  // Custom action: like
  like(id) {
    const post = posts.find(p => p.id === id);
    if (!post) throw new NotFoundError('Post', { id });
    post.likes += 1;
    post.updatedAt = new Date().toISOString();
    return { id: post.id, likes: post.likes };
  },
};