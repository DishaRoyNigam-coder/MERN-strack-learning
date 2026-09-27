// src/controllers/posts.controller.js

import { postsService } from '../services/posts.service.js';
import { validatePost, validateId } from '../utils/validate.js';

// ============================================================
// GET /api/posts
// ============================================================

export function getAllPosts(req, res, next) {
  try {
    const result = postsService.list(req.query);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================
// GET /api/posts/:id
// ============================================================

export function getPostById(req, res, next) {
  try {
    const id = validateId(req.params.id);
    const post = postsService.getById(id);

    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================
// POST /api/posts
// ============================================================

export function createPost(req, res, next) {
  try {
    validatePost(req.body);
    const newPost = postsService.create(req.body);

    res
      .status(201)
      .location(`/api/posts/${newPost.id}`)
      .json({
        success: true,
        message: 'Post created successfully',
        data: newPost,
      });
  } catch (error) {
    next(error);
  }
}

// ============================================================
// PUT /api/posts/:id
// ============================================================

export function replacePost(req, res, next) {
  try {
    const id = validateId(req.params.id);
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
// PATCH /api/posts/:id
// ============================================================

export function updatePost(req, res, next) {
  try {
    const id = validateId(req.params.id);
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
// DELETE /api/posts/:id
// ============================================================

export function deletePost(req, res, next) {
  try {
    const id = validateId(req.params.id);
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
// POST /api/posts/:id/like
// ============================================================

export function likePost(req, res, next) {
  try {
    const id = validateId(req.params.id);
    const result = postsService.like(id);

    res.status(200).json({
      success: true,
      message: 'Post liked',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}