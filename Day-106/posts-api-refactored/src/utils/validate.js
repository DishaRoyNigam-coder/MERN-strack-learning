// src/utils/validate.js

import { ValidationError, BadRequestError } from '../errors/AppError.js';

export function validateId(id) {
  const numId = Number(id);
  if (!Number.isInteger(numId) || numId < 1) {
    throw new BadRequestError('Invalid ID format', {
      id,
      reason: 'ID must be a positive integer',
    });
  }
  return numId;
}

export function validatePost(data, { partial = false } = {}) {
  const errors = [];

  if (!partial || data.title !== undefined) {
    if (typeof data.title !== 'string' || data.title.trim().length < 3) {
      errors.push({ field: 'title', message: 'Title must be at least 3 characters' });
    }
  }

  if (!partial || data.body !== undefined) {
    if (typeof data.body !== 'string' || data.body.trim().length < 10) {
      errors.push({ field: 'body', message: 'Body must be at least 10 characters' });
    }
  }

  if (!partial || data.author !== undefined) {
    if (typeof data.author !== 'string' || data.author.trim().length < 2) {
      errors.push({ field: 'author', message: 'Author must be at least 2 characters' });
    }
  }

  if (data.tags !== undefined) {
    if (!Array.isArray(data.tags)) {
      errors.push({ field: 'tags', message: 'Tags must be an array' });
    } else if (data.tags.some(t => typeof t !== 'string')) {
      errors.push({ field: 'tags', message: 'All tags must be strings' });
    }
  }

  if (data.published !== undefined && typeof data.published !== 'boolean') {
    errors.push({ field: 'published', message: 'Published must be a boolean' });
  }

  if (errors.length > 0) {
    throw new ValidationError('Please fix the following fields', errors);
  }
}