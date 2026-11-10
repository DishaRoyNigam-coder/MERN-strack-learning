// src/controllers/posts.controller.js

import { postsService } from '../services/posts.service.js';

export function listPosts(req, res, next) {
  try {
    const result = postsService.list(req.query, req.user);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

export function getPost(req, res, next) {
  try {
    const post = postsService.getByIdOrSlug(req.params.id);
    postsService.incrementViews(post.id);
    const isAuthor = req.user && post.authorId === req.user.id;
    const isPrivileged = req.user && ['editor', 'admin'].includes(req.user.role);
    res.json({
      success: true,
      data: post,
      canEdit: isAuthor || isPrivileged,
      canDelete: isAuthor || isPrivileged,
    });
  } catch (err) { next(err); }
}

export function createPost(req, res, next) {
  try {
    const post = postsService.create(req.body, req.user);
    res.status(201).location(`/api/posts/${post.id}`).json({
      success: true, message: 'Post created', data: post,
    });
  } catch (err) { next(err); }
}

export function updatePost(req, res, next) {
  try {
    const post = postsService.update(Number(req.params.id), req.body, req.user);
    res.json({ success: true, message: 'Post updated', data: post });
  } catch (err) { next(err); }
}

export function deletePost(req, res, next) {
  try {
    const removed = postsService.remove(Number(req.params.id), req.user);
    res.json({ success: true, message: 'Post deleted', data: removed });
  } catch (err) { next(err); }
}

export function likePost(req, res, next) {
  try {
    const result = postsService.like(Number(req.params.id));
    res.json({ success: true, message: 'Post liked', data: result });
  } catch (err) { next(err); }
}