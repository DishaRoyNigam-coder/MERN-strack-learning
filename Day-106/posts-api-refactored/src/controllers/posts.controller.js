// src/controllers/posts.controller.js

import { postsService } from '../services/posts.service.js';
import { validatePost, validateId } from '../utils/validate.js';
import { ForbiddenError } from '../errors/AppError.js';

// ============================================================
// GET /api/posts — List all posts (public)
// ============================================================

export function getAllPosts(req, res, next) {
  try {
    const result = postsService.list(req.query);

    res.status(200).json({
      success: true,
      ...result,
      viewer: req.user ? { id: req.user.id, name: req.user.name } : null,
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================
// GET /api/posts/:id — Get one post (public)
// ============================================================

export function getPostById(req, res, next) {
  try {
    const id = validateId(req.params.id);
    const post = postsService.getById(id);

    res.status(200).json({
      success: true,
      data: post,
      canEdit: req.user
        ? req.user.id === post.authorId || req.user.role === 'admin'
        : false,
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================
// POST /api/posts — Create a post (PROTECTED by requireAuth)
// ============================================================

export function createPost(req, res, next) {
  try {
    // req.user is guaranteed by requireAuth middleware
    validatePost(req.body);

    const postData = {
      ...req.body,
      author: req.user.name,
      authorId: req.user.id,
    };

    const newPost = postsService.create(postData);

    res
      .status(201)
      .location(`/api/posts/${newPost.id}`)
      .json({
        success: true,
        message: 'Post created successfully',
        data: newPost,
        createdBy: {
          id: req.user.id,
          name: req.user.name,
        },
      });
  } catch (error) {
    next(error);
  }
}

// ============================================================
// PUT /api/posts/:id — Full replace (requireAuth + ownership)
// ============================================================

export function replacePost(req, res, next) {
  try {
    const id = validateId(req.params.id);
    const existing = postsService.getById(id);

    // Ownership check: only author or admin
    if (existing.authorId !== req.user.id && req.user.role !== 'admin') {
      throw new ForbiddenError('You can only edit your own posts', {
        postAuthorId: existing.authorId,
        yourId: req.user.id,
      });
    }

    validatePost(req.body);
    const updated = postsService.replace(id, req.body);

    res.status(200).json({
      success: true,
      message: 'Post replaced successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================
// PATCH /api/posts/:id — Partial update (requireAuth + ownership)
// ============================================================

export function updatePost(req, res, next) {
  try {
    const id = validateId(req.params.id);
    const existing = postsService.getById(id);

    if (existing.authorId !== req.user.id && req.user.role !== 'admin') {
      throw new ForbiddenError('You can only edit your own posts');
    }

    validatePost(req.body, { partial: true });
    const updated = postsService.update(id, req.body);

    res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================
// DELETE /api/posts/:id — Delete (requireAuth + role check)
// ============================================================

export function deletePost(req, res, next) {
  try {
    const id = validateId(req.params.id);
    const existing = postsService.getById(id);

    // Authorization: only author, admin, or editor
    const isAuthor = existing.authorId === req.user.id;
    const isPrivileged = ['admin', 'editor'].includes(req.user.role);

    if (!isAuthor && !isPrivileged) {
      throw new ForbiddenError(
        'Only the author, admin, or editor can delete this post'
      );
    }

    const deleted = postsService.remove(id);

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully',
      data: deleted,
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================
// POST /api/posts/:id/like — Like a post (optionalAuth)
// ============================================================

export function likePost(req, res, next) {
  try {
    const id = validateId(req.params.id);
    const result = postsService.like(id);

    res.status(200).json({
      success: true,
      message: 'Post liked',
      data: result,
      likedBy: req.user ? req.user.name : 'anonymous',
    });
  } catch (error) {
    next(error);
  }
}