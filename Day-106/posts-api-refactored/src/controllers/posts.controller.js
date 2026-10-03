// src/controllers/posts.controller.js

import { postsService } from '../services/posts.service.js';
import { validatePost, validateId } from '../utils/validate.js';
import { ForbiddenError } from '../errors/AppError.js';
import { ROLES, roleIsAtLeast } from '../config/roles.js';

// ============================================================
// HELPER: Check if user can edit a post
// ============================================================

function canEditPost(user, post) {
  if (!user) return false;
  if (user.role === ROLES.ADMIN) return true;
  if (roleIsAtLeast(user.role, ROLES.EDITOR)) return true;
  return post.authorId === user.id;
}

// ============================================================
// HELPER: Check if user can delete a post
// ============================================================

function canDeletePost(user, post) {
  if (!user) return false;
  if (user.role === ROLES.ADMIN) return true;
  if (roleIsAtLeast(user.role, ROLES.EDITOR)) return true;
  return post.authorId === user.id;
}

// ============================================================
// GET /api/posts
// ============================================================

export function getAllPosts(req, res, next) {
  try {
    // Optional: admins can see unpublished posts by default
    const query = { ...req.query };

    if (req.user && roleIsAtLeast(req.user.role, ROLES.EDITOR)) {
      // Editors and above can query unpublished posts
    } else if (!query.published) {
      // Regular users only see published posts by default
      // (unless explicitly asking for others)
      // (This is a demo — in production, use a "status" field)
    }

    const result = postsService.list(query);

    res.status(200).json({
      success: true,
      ...result,
      viewer: req.user
        ? { id: req.user.id, name: req.user.name, role: req.user.role }
        : null,
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
      canEdit: canEditPost(req.user, post),
      canDelete: canDeletePost(req.user, post),
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
          role: req.user.role,
        },
      });
  } catch (error) {
    next(error);
  }
}

// ============================================================
// PUT /api/posts/:id — Full replace (auth + ownership or editor+)
// ============================================================

export function replacePost(req, res, next) {
  try {
    const id = validateId(req.params.id);
    const existing = postsService.getById(id);

    if (!canEditPost(req.user, existing)) {
      throw new ForbiddenError('You can only edit your own posts', {
        postAuthorId: existing.authorId,
        yourId: req.user.id,
        yourRole: req.user.role,
        hint: 'Only the author, editors, or admins can edit this post',
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
// PATCH /api/posts/:id — Partial update
// ============================================================

export function updatePost(req, res, next) {
  try {
    const id = validateId(req.params.id);
    const existing = postsService.getById(id);

    if (!canEditPost(req.user, existing)) {
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
// DELETE /api/posts/:id — Delete (ownership or editor+)
// ============================================================

export function deletePost(req, res, next) {
  try {
    const id = validateId(req.params.id);
    const existing = postsService.getById(id);

    if (!canDeletePost(req.user, existing)) {
      throw new ForbiddenError(
        'Only the author, editors, or admins can delete this post'
      );
    }

    const deleted = postsService.remove(id);

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully',
      data: deleted,
      deletedBy: {
        id: req.user.id,
        name: req.user.name,
        role: req.user.role,
      },
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
      likedBy: req.user ? req.user.name : 'anonymous',
    });
  } catch (error) {
    next(error);
  }
}