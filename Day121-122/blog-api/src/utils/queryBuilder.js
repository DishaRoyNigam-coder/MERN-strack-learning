
// ============================================================
// POST QUERY BUILDER
// ============================================================

const POST_SORTABLE_FIELDS = [
  'id',
  'title',
  'createdAt',
  'updatedAt',
  'publishedAt',
  'likes',
  'views',
];

const POST_FILTERABLE_FIELDS = [
  'authorId',
  'categoryId',
  'status',
  'tag',
];

const POST_SELECTABLE_FIELDS = [
  'id',
  'title',
  'slug',
  'excerpt',
  'body',
  'authorId',
  'categoryId',
  'status',
  'tags',
  'likes',
  'views',
  'createdAt',
  'updatedAt',
  'publishedAt',
  'author',
  'category',
  'commentCount',
];

const POST_DEFAULT_LIMIT = 10;
const POST_MAX_LIMIT = 100;


// ============================================================
// SHARED PARSING HELPERS
// ============================================================

/**
 * Parse and validate a positive integer.
 */
function parseIntParam(
  value,
  { min = 1, max = Number.MAX_SAFE_INTEGER, fallback } = {}
) {
  const n = parseInt(value, 10);

  if (isNaN(n)) return fallback;

  return Math.min(Math.max(n, min), max);
}


/**
 * Parse comma-separated and repeated query parameters.
 *
 * Supports:
 * ?tags=react,node,express
 *
 * Also supports:
 * ?tags=react&tags=node&tags=express
 */
function parseList(
  value,
  { allowed = null, toLowerCase = false } = {}
) {
  if (!value) return [];

  // Support both single and repeated query parameters.
  const arr = Array.isArray(value) ? value : [value];

  const items = arr
    .flatMap((v) => String(v).split(','))
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => (toLowerCase ? s.toLowerCase() : s));

  // Filter values against an allowed list if provided.
  if (allowed) {
    return items.filter((item) => allowed.includes(item));
  }

  return items;
}


// ============================================================
// POST SORTING
// ============================================================

/**
 * Parse sort and order parameters.
 *
 * Supports:
 * ?sort=createdAt&order=desc
 *
 * Also supports multiple sorting:
 * ?sort=likes,createdAt&order=desc,asc
 */
function parseSort(sortParam, orderParam) {
  const sorts = parseList(sortParam);
  const orders = parseList(orderParam);

  const validSorts = sorts
    .map((field, index) => ({
      field,
      order: orders[index] || 'desc',
    }))
    .filter(({ field }) => POST_SORTABLE_FIELDS.includes(field))
    .map(({ field, order }) => ({
      field,
      order: order === 'asc' ? 'asc' : 'desc',
    }));

  // Default sorting.
  if (validSorts.length === 0) {
    return [
      { field: 'createdAt', order: 'desc' },
      { field: 'id', order: 'desc' },
    ];
  }

  // Add stable tiebreaker.
  if (!validSorts.some((s) => s.field === 'id')) {
    validSorts.push({
      field: 'id',
      order: 'desc',
    });
  }

  return validSorts;
}


// ============================================================
// POST FIELD SELECTION
// ============================================================

/**
 * Parse field selection.
 *
 * Example:
 * ?fields=id,title,author
 */
function parseFields(fieldsParam) {
  if (!fieldsParam) return null;

  const fields = parseList(fieldsParam);

  const valid = fields.filter((field) =>
    POST_SELECTABLE_FIELDS.includes(field)
  );

  return valid.length > 0 ? valid : null;
}


// ============================================================
// BUILD POST QUERY
// ============================================================

/**
 * Build the query object for posts.
 *
 * @param {object} rawQuery - req.query
 * @param {object} user - req.user (optional)
 */
export function buildPostQuery(rawQuery = {}, user = null) {

  // --- Pagination ---

  const page = parseIntParam(rawQuery.page, {
    min: 1,
    fallback: 1,
  });

  const limit = parseIntParam(rawQuery.limit, {
    min: 1,
    max: POST_MAX_LIMIT,
    fallback: POST_DEFAULT_LIMIT,
  });


  // --- Sorting ---

  const sort = parseSort(
    rawQuery.sort,
    rawQuery.order
  );


  // --- Field Selection ---

  const fields = parseFields(rawQuery.fields);


  // --- Filters ---

  const filters = {};

  if (rawQuery.authorId) {
    const authorId = parseInt(rawQuery.authorId, 10);

    if (!isNaN(authorId)) {
      filters.authorId = authorId;
    }
  }

  if (rawQuery.categoryId) {
    const categoryId = parseInt(rawQuery.categoryId, 10);

    if (!isNaN(categoryId)) {
      filters.categoryId = categoryId;
    }
  }

  if (rawQuery.category) {
    filters.categorySlug = String(rawQuery.category)
      .toLowerCase()
      .trim();
  }

  if (rawQuery.status) {
    const status = String(rawQuery.status)
      .toLowerCase()
      .trim();

    if (['draft', 'published'].includes(status)) {
      filters.status = status;
    }
  }

  if (rawQuery.tag) {
    filters.tag = String(rawQuery.tag)
      .toLowerCase()
      .trim();
  }

  if (rawQuery.tags) {
    // Multiple tags use AND logic.
    // Supports comma-separated and repeated parameters.
    filters.tags = parseList(rawQuery.tags, {
      toLowerCase: true,
    });
  }


  // --- Range Filters ---

  if (rawQuery.minLikes !== undefined) {
    const n = parseInt(rawQuery.minLikes, 10);

    if (!isNaN(n)) {
      filters.minLikes = n;
    }
  }

  if (rawQuery.maxLikes !== undefined) {
    const n = parseInt(rawQuery.maxLikes, 10);

    if (!isNaN(n)) {
      filters.maxLikes = n;
    }
  }

  if (rawQuery.minViews !== undefined) {
    const n = parseInt(rawQuery.minViews, 10);

    if (!isNaN(n)) {
      filters.minViews = n;
    }
  }


  // --- Date Range ---

  if (rawQuery.from) {
    const d = new Date(rawQuery.from);

    if (!isNaN(d.getTime())) {
      filters.from = d;
    }
  }

  if (rawQuery.to) {
    const d = new Date(rawQuery.to);

    if (!isNaN(d.getTime())) {
      filters.to = d;
    }
  }


  // --- Search ---

  if (rawQuery.q && String(rawQuery.q).trim()) {
    filters.search = String(rawQuery.q)
      .trim()
      .toLowerCase();
  }


  // --- Auth-Aware Filtering ---

  // Admin and editor can see drafts.
  // Other users can see only published posts.
  const isPrivileged =
    user && ['editor', 'admin'].includes(user.role);

  filters.includeDrafts = Boolean(isPrivileged);


  return {
    page,
    limit,
    sort,
    fields,
    filters,
  };
}


// ============================================================
// CATEGORY QUERY BUILDER
// ============================================================

const CATEGORY_SORTABLE_FIELDS = [
  'id',
  'name',
  'createdAt',
];


/**
 * Build category query.
 */
export function buildCategoryQuery(rawQuery = {}) {

  const page = parseIntParam(rawQuery.page, {
    min: 1,
    fallback: 1,
  });

  const limit = parseIntParam(rawQuery.limit, {
    min: 1,
    max: 100,
    fallback: 20,
  });

  const sorts = parseList(rawQuery.sort);
  const orders = parseList(rawQuery.order);

  const sort = sorts
    .map((field, index) => ({
      field,
      order: orders[index] || 'asc',
    }))
    .filter(({ field }) =>
      CATEGORY_SORTABLE_FIELDS.includes(field)
    )
    .map(({ field, order }) => ({
      field,
      order: order === 'desc' ? 'desc' : 'asc',
    }));

  if (sort.length === 0) {
    sort.push({
      field: 'name',
      order: 'asc',
    });
  }

  if (!sort.some((s) => s.field === 'id')) {
    sort.push({
      field: 'id',
      order: 'asc',
    });
  }

  const filters = {};

  if (rawQuery.q) {
    filters.search = String(rawQuery.q)
      .trim()
      .toLowerCase();
  }

  return {
    page,
    limit,
    sort,
    filters,
  };
}


// ============================================================
// COMMENT QUERY BUILDER
// ============================================================

const COMMENT_SORTABLE_FIELDS = [
  'id',
  'createdAt',
];


/**
 * Build comment query.
 */
export function buildCommentQuery(rawQuery = {}) {

  const page = parseIntParam(rawQuery.page, {
    min: 1,
    fallback: 1,
  });

  const limit = parseIntParam(rawQuery.limit, {
    min: 1,
    max: 50,
    fallback: 20,
  });

  const sorts = parseList(rawQuery.sort);
  const orders = parseList(rawQuery.order);

  const sort = sorts
    .map((field, index) => ({
      field,
      order: orders[index] || 'desc',
    }))
    .filter(({ field }) =>
      COMMENT_SORTABLE_FIELDS.includes(field)
    )
    .map(({ field, order }) => ({
      field,
      order: order === 'asc' ? 'asc' : 'desc',
    }));

  if (sort.length === 0) {
    sort.push({
      field: 'createdAt',
      order: 'desc',
    });
  }

  if (!sort.some((s) => s.field === 'id')) {
    sort.push({
      field: 'id',
      order: 'desc',
    });
  }

  return {
    page,
    limit,
    sort,
  };
}


// ============================================================
// SHARED HELPERS
// ============================================================

/**
 * Sort items using multiple sorting conditions.
 */
export function applySort(items, sort) {

  return [...items].sort((a, b) => {

    for (const { field, order } of sort) {

      const aV = a[field];
      const bV = b[field];

      if (aV === bV) continue;

      const cmp = aV < bV ? -1 : 1;

      return order === 'asc' ? cmp : -cmp;
    }

    return 0;
  });
}


/**
 * Apply offset-based pagination.
 */
export function paginateItems(items, { page, limit }) {

  const total = items.length;

  const totalPages = Math.ceil(total / limit) || 1;

  const skip = (page - 1) * limit;

  const data = items.slice(skip, skip + limit);

  return {

    pagination: {
      page,
      limit,
      total,
      totalPages,

      hasNext: page < totalPages,
      hasPrev: page > 1,

      nextPage: page < totalPages ? page + 1 : null,
      prevPage: page > 1 ? page - 1 : null,
    },

    count: data.length,

    data,
  };
}


/**
 * Return only selected fields.
 */
export function selectFields(item, fields) {

  if (!fields) return item;

  const result = {};

  for (const field of fields) {

    if (item[field] !== undefined) {
      result[field] = item[field];
    }
  }

  return result;
}
