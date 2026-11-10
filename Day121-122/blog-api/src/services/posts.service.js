// src/services/posts.service.js

import { posts, users, categories, comments, getNextPostId } from '../data/store.js';
import { NotFoundError, BadRequestError, ForbiddenError } from '../errors/AppError.js';
import { slugify } from '../utils/pagination.js';
import {
  buildPostQuery,
  applySort,
  paginateItems,
  selectFields,
} from '../utils/queryBuilder.js';

// Join author + category + comment count
const withJoins = (post) => {
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

// ============================================================
// FILTER PIPELINE
// ============================================================

function applyFilters(items, filters, user) {
  let result = [...items];

  // Auth-aware: hide drafts from non-privileged users
  if (!filters.includeDrafts) {
    result = result.filter((p) => p.status === 'published');
  } else if (filters.status) {
    result = result.filter((p) => p.status === filters.status);
  }

  // Author
  if (filters.authorId) {
    result = result.filter((p) => p.authorId === filters.authorId);
  }

  // Category by ID
  if (filters.categoryId) {
    result = result.filter((p) => p.categoryId === filters.categoryId);
  }

  // Category by slug
  if (filters.categorySlug) {
    const cat = categories.find((c) => c.slug === filters.categorySlug);
    if (cat) {
      result = result.filter((p) => p.categoryId === cat.id);
    } else {
      result = []; // no such category
    }
  }

  // Tag (single)
  if (filters.tag) {
    result = result.filter((p) => p.tags?.includes(filters.tag));
  }

  // Tags (multiple, AND logic)
  if (filters.tags && filters.tags.length > 0) {
    result = result.filter((p) =>
      filters.tags.every((t) => p.tags?.includes(t))
    );
  }

  // Likes range
  if (filters.minLikes !== undefined) {
    result = result.filter((p) => (p.likes || 0) >= filters.minLikes);
  }
  if (filters.maxLikes !== undefined) {
    result = result.filter((p) => (p.likes || 0) <= filters.maxLikes);
  }

  // Views range
  if (filters.minViews !== undefined) {
    result = result.filter((p) => (p.views || 0) >= filters.minViews);
  }

  // Date range
  if (filters.from) {
    result = result.filter((p) => new Date(p.createdAt) >= filters.from);
  }
  if (filters.to) {
    result = result.filter((p) => new Date(p.createdAt) <= filters.to);
  }

  // Search
  if (filters.search) {
    const term = filters.search;
    result = result.filter(
      (p) =>
        p.title.toLowerCase().includes(term) ||
        p.body.toLowerCase().includes(term) ||
        p.excerpt?.toLowerCase().includes(term) ||
        p.tags?.some((t) => t.includes(term))
    );
  }

  return result;
}

// ============================================================
// SERVICE
// ============================================================

export const postsService = {
  /**
   * List posts with pagination, sorting, filtering, search.
   * @param {object} rawQuery - req.query
   * @param {object} user - req.user (optional)
   */
  list(rawQuery = {}, user = null) {
    const query = buildPostQuery(rawQuery, user);

    // 1. Filter
    let result = applyFilters(posts, query.filters, user);

    // 2. Join (before sort so we can sort by joined fields)
    result = result.map(withJoins);

    // 3. Sort
    result = applySort(result, query.sort);

    // 4. Paginate
    const paginated = paginateItems(result, {
      page: query.page,
      limit: query.limit,
    });

    // 5. Field selection (on the paginated slice only)
    const data = query.fields
      ? paginated.data.map((item) => selectFields(item, query.fields))
      : paginated.data;

    // 6. Return with query metadata (for debugging/clients)
    return {
      ...paginated,
      data,
      query: {
        page: query.page,
        limit: query.limit,
        sort: query.sort,
        fields: query.fields,
        filters: serializeFilters(query.filters),
      },
    };
  },

  getByIdOrSlug(identifier) {
    const post = posts.find(
      (p) => p.id === Number(identifier) || p.slug === identifier
    );
    if (!post) throw new NotFoundError('Post', { identifier });
    return withJoins(post);
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
    return withJoins(post);
  },

  update(id, updates, user) {
    const post = posts.find((p) => p.id === id);
    if (!post) throw new NotFoundError('Post', { id });

    const isAuthor = post.authorId === user.id;
    const isPrivileged = ['editor', 'admin'].includes(user.role);
    if (!isAuthor && !isPrivileged) {
      throw new ForbiddenError('You can only edit your own posts');
    }

    if (updates.title !== undefined) {
      if (updates.title.trim().length < 3) throw new BadRequestError('Title too short');
      post.title = updates.title.trim();
      post.slug = slugify(updates.title);
    }
    if (updates.body !== undefined) {
      if (updates.body.trim().length < 10) throw new BadRequestError('Body too short');
      post.body = updates.body.trim();
      post.excerpt = updates.body.trim().slice(0, 150) + '...';
    }
    if (updates.categoryId !== undefined) {
      const cat = categories.find((c) => c.id === Number(updates.categoryId));
      if (!cat) throw new NotFoundError('Category', { id: updates.categoryId });
      post.categoryId = cat.id;
    }
    if (updates.tags !== undefined) {
      post.tags = Array.isArray(updates.tags) ? updates.tags.map((t) => t.toLowerCase()) : [];
    }
    if (updates.status !== undefined) {
      if (!['draft', 'published'].includes(updates.status)) {
        throw new BadRequestError('Status must be draft or published');
      }
      if (!isPrivileged) throw new ForbiddenError('Only editors can publish');
      if (updates.status === 'published' && post.status !== 'published') {
        post.publishedAt = new Date().toISOString();
      }
      post.status = updates.status;
    }

    post.updatedAt = new Date().toISOString();
    return withJoins(post);
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

    for (let i = comments.length - 1; i >= 0; i--) {
      if (comments[i].postId === id) comments.splice(i, 1);
    }

    posts.splice(idx, 1);
    return post;
  },

  like(id) {
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

// Don't leak Dates into JSON in an unexpected format
function serializeFilters(filters) {
  const out = { ...filters };
  if (out.from) out.from = out.from.toISOString();
  if (out.to) out.to = out.to.toISOString();
  return out;
}