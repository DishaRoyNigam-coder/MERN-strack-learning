// src/services/posts.service.js

import { posts, users, categories, comments, getNextPostId } from '../data/store.js';
import { NotFoundError, BadRequestError, ForbiddenError } from '../errors/AppError.js';
import { slugify, parsePagination, paginate } from '../utils/pagination.js';

const withAuthorAndCategory = (post) => {
  const author = users.find((u) => u.id === post.authorId);
  const category = categories.find((c) => c.id === post.categoryId);
  return {
    ...post,
    author: author
      ? { id: author.id, name: author.name, avatar: author.avatar }
      : null,
    category: category
      ? { id: category.id, name: category.name, slug: category.slug }
      : null,
    commentCount: comments.filter((c) => c.postId === post.id).length,
  };
};

export const postsService = {
  list(query = {}) {
    let result = [...posts];

    // Auth-aware: non-editors only see published posts
    const isPrivileged = query.userRole && ['editor', 'admin'].includes(query.userRole);
    if (!isPrivileged) {
      result = result.filter((p) => p.status === 'published');
    }

    // Filtering
    const { authorId, categoryId, category, tag, status, q } = query;
    if (authorId) result = result.filter((p) => p.authorId === Number(authorId));
    if (categoryId) result = result.filter((p) => p.categoryId === Number(categoryId));
    if (category) {
      const cat = categories.find((c) => c.slug === category);
      if (cat) result = result.filter((p) => p.categoryId === cat.id);
    }
    if (tag) result = result.filter((p) => p.tags?.includes(tag.toLowerCase()));
    if (status && isPrivileged) result = result.filter((p) => p.status === status);
    if (q) {
      const term = q.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(term) ||
          p.body.toLowerCase().includes(term)
      );
    }

    // Sorting
    const { sort = 'createdAt', order = 'desc' } = query;
    const validSorts = ['id', 'title', 'createdAt', 'likes', 'views'];
    if (validSorts.includes(sort)) {
      result.sort((a, b) => {
        const aV = a[sort], bV = b[sort];
        if (aV < bV) return order === 'asc' ? -1 : 1;
        if (aV > bV) return order === 'asc' ? 1 : -1;
        return 0;
      });
    }

    const withJoins = result.map(withAuthorAndCategory);
    const pagination = parsePagination(query);
    return paginate(withJoins, pagination);
  },

  getByIdOrSlug(identifier) {
    const post = posts.find(
      (p) => p.id === Number(identifier) || p.slug === identifier
    );
    if (!post) throw new NotFoundError('Post', { identifier });
    return withAuthorAndCategory(post);
  },

  create(data, user) {
    const { title, body, categoryId, tags, status } = data;

    if (!title || title.trim().length < 3) {
      throw new BadRequestError('Title must be at least 3 characters');
    }
    if (!body || body.trim().length < 10) {
      throw new BadRequestError('Body must be at least 10 characters');
    }

    const category = categories.find((c) => c.id === Number(categoryId));
    if (!category) throw new NotFoundError('Category', { id: categoryId });

    const postStatus = ['draft', 'published'].includes(status) ? status : 'draft';
    const now = new Date().toISOString();

    const post = {
      id: getNextPostId(),
      title: title.trim(),
      slug: slugify(title),
      body: body.trim(),
      excerpt: body.trim().slice(0, 150) + (body.length > 150 ? '...' : ''),
      authorId: user.id,
      categoryId: category.id,
      status: postStatus,
      tags: Array.isArray(tags) ? tags.map((t) => t.toLowerCase()) : [],
      likes: 0,
      views: 0,
      createdAt: now,
      updatedAt: now,
      publishedAt: postStatus === 'published' ? now : null,
    };

    posts.push(post);
    return withAuthorAndCategory(post);
  },

  update(id, updates, user) {
    const post = posts.find((p) => p.id === id);
    if (!post) throw new NotFoundError('Post', { id });

    // Auth check: author or editor+
    const isAuthor = post.authorId === user.id;
    const isPrivileged = ['editor', 'admin'].includes(user.role);
    if (!isAuthor && !isPrivileged) {
      throw new ForbiddenError('You can only edit your own posts');
    }

    const allowed = ['title', 'body', 'categoryId', 'tags', 'status'];
    for (const field of allowed) {
      if (updates[field] === undefined) continue;

      if (field === 'title') {
        if (updates.title.trim().length < 3) throw new BadRequestError('Title too short');
        post.title = updates.title.trim();
        post.slug = slugify(updates.title);
      } else if (field === 'body') {
        if (updates.body.trim().length < 10) throw new BadRequestError('Body too short');
        post.body = updates.body.trim();
        post.excerpt = updates.body.trim().slice(0, 150) + '...';
      } else if (field === 'categoryId') {
        const cat = categories.find((c) => c.id === Number(updates.categoryId));
        if (!cat) throw new NotFoundError('Category', { id: updates.categoryId });
        post.categoryId = cat.id;
      } else if (field === 'tags') {
        post.tags = Array.isArray(updates.tags) ? updates.tags.map((t) => t.toLowerCase()) : [];
      } else if (field === 'status') {
        if (!['draft', 'published'].includes(updates.status)) {
          throw new BadRequestError('Status must be draft or published');
        }
        // Only privileged users can change status
        if (!isPrivileged) throw new ForbiddenError('Only editors can publish');
        if (updates.status === 'published' && post.status !== 'published') {
          post.publishedAt = new Date().toISOString();
        }
        post.status = updates.status;
      }
    }

    post.updatedAt = new Date().toISOString();
    return withAuthorAndCategory(post);
  },

  remove(id, user) {
    const idx = posts.findIndex((p) => p.id === id);
    if (idx === -1) throw new NotFoundError('Post', { id });

    const post = posts[idx];
    const isAuthor = post.authorId === user.id;
    const isPrivileged = ['editor', 'admin'].includes(user.role);
    if (!isAuthor && !isPrivileged) {
      throw new ForbiddenError('You can only delete your own posts');
    }

    // Cascade delete comments
    for (let i = comments.length - 1; i >= 0; i--) {
      if (comments[i].postId === id) comments.splice(i, 1);
    }

    posts.splice(idx, 1);
    return post;
  },

  like(id, userId) {
    const post = posts.find((p) => p.id === id);
    if (!post) throw new NotFoundError('Post', { id });
    post.likes = (post.likes || 0) + 1;
    post.updatedAt = new Date().toISOString();
    return { id: post.id, likes: post.likes };
  },

  incrementViews(id) {
    const post = posts.find((p) => p.id === id);
    if (post) post.views = (post.views || 0) + 1;
  },
};