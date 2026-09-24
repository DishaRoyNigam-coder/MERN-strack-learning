// utils/validate.js

import { ValidationError, BadRequestError } from '../error/AppError.js';

export function validatePost(data, isUpdate = false) {
  const errors = [];

  // Title validation
  if (!isUpdate || data.title !== undefined) {
    if (!data.title || typeof data.title !== 'string') {
      errors.push({ field: 'title', message: 'Title is required and must be a string' });
    } else if (data.title.trim().length < 3) {
      errors.push({ field: 'title', message: 'Title must be at least 3 characters' });
    } else if (data.title.trim().length > 200) {
      errors.push({ field: 'title', message: 'Title must be at most 200 characters' });
    }
  }

  // Body validation
  if (!isUpdate || data.body !== undefined) {
    if (!data.body || typeof data.body !== 'string') {
      errors.push({ field: 'body', message: 'Body is required and must be a string' });
    } else if (data.body.trim().length < 10) {
      errors.push({ field: 'body', message: 'Body must be at least 10 characters' });
    }
  }

  // Author validation
  if (!isUpdate || data.author !== undefined) {
    if (!data.author || typeof data.author !== 'string') {
      errors.push({ field: 'author', message: 'Author is required and must be a string' });
    }
  }

  // Tags validation (optional)
  if (data.tags !== undefined) {
    if (!Array.isArray(data.tags)) {
      errors.push({ field: 'tags', message: 'Tags must be an array' });
    } else if (data.tags.some(t => typeof t !== 'string')) {
      errors.push({ field: 'tags', message: 'All tags must be strings' });
    }
  }

  // Published validation (optional)
  if (data.published !== undefined && typeof data.published !== 'boolean') {
    errors.push({ field: 'published', message: 'Published must be a boolean' });
  }

  if (errors.length > 0) {
    throw new ValidationError('Please check the following fields', errors);
  }
}

export function validateId(id) {
  const parsed = parseInt(id);
  if (isNaN(parsed) || parsed < 1) {
    throw new BadRequestError('Invalid ID', { id, reason: 'ID must be a positive integer' });
  }
  return parsed;
}