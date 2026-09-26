// routes/users.js

import { Router } from 'express';
import { users, getNextId } from '../data/users.js';
import {
  BadRequestError,
  NotFoundError,
  ConflictError,
} from '../errors/index.js';
import { validateUser, validateId } from '../utils/validate.js';

const router = Router();

// ============================================================
// GET /api/users — List all users (200 OK)
// ============================================================

router.get('/', (req, res) => {
  // Query filtering
  let result = [...users];
  const { role, search } = req.query;

  if (role) {
    result = result.filter(u => u.role === role);
  }
  if (search) {
    const term = search.toLowerCase();
    result = result.filter(u =>
      u.name.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term)
    );
  }

  // ✅ 200 OK
  res.status(200).json({
    success: true,
    count: result.length,
    data: result,
  });
});

// ============================================================
// GET /api/users/:id — Get single user (200 or 404)
// ============================================================

router.get('/:id', (req, res) => {
  const id = validateId(req.params.id); // throws 400 if invalid
  const user = users.find(u => u.id === id);

  if (!user) {
    throw new NotFoundError('User', { id }); // throws 404
  }

  // ✅ 200 OK
  res.status(200).json({
    success: true,
    data: user,
  });
});

// ============================================================
// POST /api/users — Create user (201 or 400/409/422)
// ============================================================

router.post('/', (req, res) => {
  // Validate body → throws 422 if invalid
  validateUser(req.body);

  // Check duplicate email → throws 409 if exists
  const exists = users.find(
    u => u.email.toLowerCase() === req.body.email.toLowerCase()
  );
  if (exists) {
    throw new ConflictError('Email already registered', {
      field: 'email',
      value: req.body.email,
      existingUserId: exists.id,
    });
  }

  const newUser = {
    id: getNextId(),
    name: req.body.name.trim(),
    email: req.body.email.toLowerCase().trim(),
    age: req.body.age ? Number(req.body.age) : null,
    role: req.body.role || 'user',
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);

  // ✅ 201 Created with Location header
  res
    .status(201)
    .location(`/api/users/${newUser.id}`)
    .json({
      success: true,
      message: 'User created successfully',
      data: newUser,
    });
});

// ============================================================
// PUT /api/users/:id — Full replace (200 or 400/404/409/422)
// ============================================================

router.put('/:id', (req, res) => {
  const id = validateId(req.params.id);
  const index = users.findIndex(u => u.id === id);

  if (index === -1) {
    throw new NotFoundError('User', { id });
  }

  // Full validation (all fields required)
  validateUser(req.body, { partial: false });

  // Check email conflict with OTHER users
  const emailConflict = users.find(
    u => u.id !== id && u.email.toLowerCase() === req.body.email.toLowerCase()
  );
  if (emailConflict) {
    throw new ConflictError('Email already in use', {
      field: 'email',
      value: req.body.email,
    });
  }

  const updated = {
    id,
    name: req.body.name.trim(),
    email: req.body.email.toLowerCase().trim(),
    age: req.body.age ? Number(req.body.age) : null,
    role: req.body.role || 'user',
    createdAt: users[index].createdAt, // preserve
    updatedAt: new Date().toISOString(),
  };

  users[index] = updated;

  // ✅ 200 OK
  res.status(200).json({
    success: true,
    message: 'User replaced (PUT)',
    data: updated,
  });
});

// ============================================================
// PATCH /api/users/:id — Partial update (200 or 400/404/409/422)
// ============================================================

router.patch('/:id', (req, res) => {
  const id = validateId(req.params.id);
  const user = users.find(u => u.id === id);

  if (!user) {
    throw new NotFoundError('User', { id });
  }

  // Partial validation (only provided fields)
  validateUser(req.body, { partial: true });

  // Email conflict check
  if (req.body.email) {
    const conflict = users.find(
      u => u.id !== id && u.email.toLowerCase() === req.body.email.toLowerCase()
    );
    if (conflict) {
      throw new ConflictError('Email already in use', { field: 'email' });
    }
  }

  // Apply updates
  const allowed = ['name', 'email', 'age', 'role'];
  allowed.forEach(field => {
    if (req.body[field] !== undefined) {
      user[field] = typeof req.body[field] === 'string'
        ? req.body[field].trim()
        : req.body[field];
    }
  });
  user.updatedAt = new Date().toISOString();

  // ✅ 200 OK
  res.status(200).json({
    success: true,
    message: 'User updated (PATCH)',
    data: user,
  });
});

// ============================================================
// DELETE /api/users/:id — Delete (200 or 404)
// ============================================================

router.delete('/:id', (req, res) => {
  const id = validateId(req.params.id);
  const index = users.findIndex(u => u.id === id);

  if (index === -1) {
    throw new NotFoundError('User', { id });
  }

  const [deleted] = users.splice(index, 1);

  // ✅ 200 OK (returning deleted resource confirms the action)
  res.status(200).json({
    success: true,
    message: 'User deleted',
    data: deleted,
  });
});

export default router;