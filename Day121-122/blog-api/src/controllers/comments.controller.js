// src/controllers/comments.controller.js

import { commentsService } from '../services/comments.service.js';

// src/controllers/comments.controller.js
export function listComments(req, res, next) {
  try {
    const result = commentsService.listByPost(req.params.postId, req.query, req.user);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}
export function createComment(req, res, next) {
  try {
    const comment = commentsService.create(req.params.postId, req.body, req.user);
    res.status(201).json({ success: true, message: 'Comment added', data: comment });
  } catch (err) { next(err); }
}

export function updateComment(req, res, next) {
  try {
    const comment = commentsService.update(req.params.id, req.body, req.user);
    res.json({ success: true, message: 'Comment updated', data: comment });
  } catch (err) { next(err); }
}

export function deleteComment(req, res, next) {
  try {
    const removed = commentsService.remove(req.params.id, req.user);
    res.json({ success: true, message: 'Comment deleted', data: removed });
  } catch (err) { next(err); }
}

export function moderateComment(req, res, next) {
  try {
    const comment = commentsService.moderate(req.params.id, req.body.status, req.user);
    res.json({ success: true, message: 'Comment moderated', data: comment });
  } catch (err) { next(err); }
}