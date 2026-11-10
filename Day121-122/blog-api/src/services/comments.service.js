
import {
  comments,
  posts,
  users,
  getNextCommentId,
} from '../data/store.js';

import {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
} from '../errors/AppError.js';

import {
  buildCommentQuery,
  applySort,
  paginateItems,
} from '../utils/queryBuilder.js';

// Attach author details to a comment
const withAuthor = (comment) => {
  const author = users.find((u) => u.id === comment.authorId);

  return {
    ...comment,
    author: author
      ? {
          id: author.id,
          name: author.name,
          avatar: author.avatar,
        }
      : null,
  };
};

export const commentsService = {
  // Get all comments for a specific post with pagination and sorting
  listByPost(postId, rawQuery = {}, user = null) {
    const post = posts.find((p) => p.id === Number(postId));

    if (!post) {
      throw new NotFoundError('Post', { id: postId });
    }

    // Build pagination and sorting options
    const query = buildCommentQuery(rawQuery);

    // Get comments belonging to this post
    let result = comments.filter(
      (c) => c.postId === Number(postId)
    );

    // Public users can only see approved comments
    const isPrivileged =
      user && ['editor', 'admin'].includes(user.role);

    if (!isPrivileged) {
      result = result.filter(
        (c) => c.status === 'approved'
      );
    }

    // Attach author details
    result = result.map(withAuthor);

    // Apply sorting
    result = applySort(result, query.sort);

    // Apply pagination
    return paginateItems(result, {
      page: query.page,
      limit: query.limit,
    });
  },

  // Create a new comment
  create(postId, { body, parentId }, user) {
    const post = posts.find((p) => p.id === Number(postId));

    if (!post) {
      throw new NotFoundError('Post', { id: postId });
    }

    if (!body || body.trim().length < 2) {
      throw new BadRequestError(
        'Comment must be at least 2 characters'
      );
    }

    let parent = null;

    // Validate parent comment if this is a reply
    if (parentId) {
      parent = comments.find(
        (c) => c.id === Number(parentId)
      );

      if (!parent) {
        throw new NotFoundError('Parent comment', {
          id: parentId,
        });
      }

      if (parent.postId !== Number(postId)) {
        throw new BadRequestError(
          'Parent comment belongs to a different post'
        );
      }
    }

    const comment = {
      id: getNextCommentId(),
      postId: Number(postId),
      authorId: user.id,
      body: body.trim(),
      parentId: parent?.id || null,
      status: 'approved',
      createdAt: new Date().toISOString(),
    };

    comments.push(comment);

    return withAuthor(comment);
  },

  // Update an existing comment
  update(id, { body }, user) {
    const comment = comments.find(
      (c) => c.id === Number(id)
    );

    if (!comment) {
      throw new NotFoundError('Comment', { id });
    }

    if (
      comment.authorId !== user.id &&
      user.role !== 'admin'
    ) {
      throw new ForbiddenError(
        'You can only edit your own comments'
      );
    }

    if (!body || body.trim().length < 2) {
      throw new BadRequestError(
        'Comment must be at least 2 characters'
      );
    }

    comment.body = body.trim();
    comment.updatedAt = new Date().toISOString();

    return withAuthor(comment);
  },

  // Delete a comment and its direct replies
  remove(id, user) {
    const idx = comments.findIndex(
      (c) => c.id === Number(id)
    );

    if (idx === -1) {
      throw new NotFoundError('Comment', { id });
    }

    const comment = comments[idx];

    const isAuthor = comment.authorId === user.id;
    const isPrivileged = ['editor', 'admin'].includes(
      user.role
    );

    if (!isAuthor && !isPrivileged) {
      throw new ForbiddenError(
        'You can only delete your own comments'
      );
    }

    // Cascade delete direct replies
    for (let i = comments.length - 1; i >= 0; i--) {
      if (comments[i].parentId === comment.id) {
        comments.splice(i, 1);
      }
    }

    comments.splice(idx, 1);

    return comment;
  },

  // Approve, reject, or mark a comment as pending
  moderate(id, status, user) {
    if (!['approved', 'pending', 'rejected'].includes(status)) {
      throw new BadRequestError('Invalid status');
    }

    const comment = comments.find(
      (c) => c.id === Number(id)
    );

    if (!comment) {
      throw new NotFoundError('Comment', { id });
    }

    comment.status = status;
    comment.moderatedBy = user.id;
    comment.moderatedAt = new Date().toISOString();

    return withAuthor(comment);
  },
};
