// src/utils/pagination.js

export function parsePagination(query, defaults = { page: 1, limit: 10, maxLimit: 100 }) {
  const page = Math.max(1, parseInt(query.page) || defaults.page);
  const limit = Math.min(defaults.maxLimit, Math.max(1, parseInt(query.limit) || defaults.limit));
  return { page, limit, skip: (page - 1) * limit };
}

export function paginate(items, { page, limit, skip }) {
  const total = items.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const data = items.slice(skip, skip + limit);

  return {
    pagination: {
      page, limit, total, totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
    count: data.length,
    data,
  };
}

export function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}