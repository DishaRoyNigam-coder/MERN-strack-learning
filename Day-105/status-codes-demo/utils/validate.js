// utils/validate.js

import { ValidationError, BadRequestError } from '../errors/index.js';

export function validateUser(data, { partial = false } = {}) {
  const errors = [];

  // Name
  if (!partial || data.name !== undefined) {
    if (typeof data.name !== 'string' || data.name.trim().length < 2) {
      errors.push({
        field: 'name',
        message: 'Name must be a string with at least 2 characters',
        received: data.name,
      });
    }
  }

  // Email
  if (!partial || data.email !== undefined) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (typeof data.email !== 'string' || !emailRegex.test(data.email)) {
      errors.push({
        field: 'email',
        message: 'Valid email is required',
        received: data.email,
      });
    }
  }

  // Age (optional)
  if (data.age !== undefined) {
    const age = Number(data.age);
    if (isNaN(age) || age < 0 || age > 150) {
      errors.push({
        field: 'age',
        message: 'Age must be between 0 and 150',
        received: data.age,
      });
    }
  }

  // Role (optional)
  if (data.role !== undefined) {
    const validRoles = ['user', 'admin', 'moderator'];
    if (!validRoles.includes(data.role)) {
      errors.push({
        field: 'role',
        message: `Role must be one of: ${validRoles.join(', ')}`,
        received: data.role,
      });
    }
  }

  if (errors.length > 0) {
    throw new ValidationError('Please fix the following fields', errors);
  }
}

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