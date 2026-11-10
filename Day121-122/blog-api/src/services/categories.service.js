// src/services/categories.service.js

import { categories, posts, getNextCategoryId } from '../data/store.js';
import { NotFoundError, ConflictError, BadRequestError } from '../errors/AppError.js';
import { slugify } from '../utils/pagination.js';

export const categoriesService = {
  list() {
    return categories.map((cat) => ({
      ...cat,
      postCount: posts.filter((p) => p.categoryId === cat.id).length,
    }));
  },

  getById(id) {
    const cat = categories.find((c) => c.id === id);
    if (!cat) throw new NotFoundError('Category', { id });
    return {
      ...cat,
      postCount: posts.filter((p) => p.categoryId === cat.id).length,
    };
  },

  getBySlug(slug) {
    const cat = categories.find((c) => c.slug === slug);
    if (!cat) throw new NotFoundError('Category', { slug });
    return cat;
  },

  create({ name, description }) {
    if (!name || name.trim().length < 2) {
      throw new BadRequestError('Category name must be at least 2 characters');
    }
    const slug = slugify(name);
    if (categories.find((c) => c.slug === slug)) {
      throw new ConflictError('Category already exists', { slug });
    }
    const cat = {
      id: getNextCategoryId(),
      name: name.trim(),
      slug,
      description: description?.trim() || '',
      createdAt: new Date().toISOString(),
    };
    categories.push(cat);
    return cat;
  },

  update(id, { name, description }) {
    const cat = categories.find((c) => c.id === id);
    if (!cat) throw new NotFoundError('Category', { id });

    if (name !== undefined) {
      const slug = slugify(name);
      const conflict = categories.find((c) => c.id !== id && c.slug === slug);
      if (conflict) throw new ConflictError('Category name already used');
      cat.name = name.trim();
      cat.slug = slug;
    }
    if (description !== undefined) cat.description = description.trim();
    cat.updatedAt = new Date().toISOString();
    return cat;
  },

  remove(id) {
    const idx = categories.findIndex((c) => c.id === id);
    if (idx === -1) throw new NotFoundError('Category', { id });

    // Check if category has posts
    const postCount = posts.filter((p) => p.categoryId === id).length;
    if (postCount > 0) {
      throw new BadRequestError(
        `Cannot delete category with ${postCount} post(s). Reassign or delete them first.`
      );
    }

    const [removed] = categories.splice(idx, 1);
    return removed;
  },
};