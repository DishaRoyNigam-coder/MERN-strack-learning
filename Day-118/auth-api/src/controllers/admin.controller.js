// src/controllers/admin.controller.js

import { users } from '../data/store.js';
import { BadRequestError, NotFoundError } from '../errors/AppError.js';
import { ROLE_HIERARCHY } from '../config/roles.js';

export function listUsers(req, res, next) {
  try {
    const safeUsers = users.map(({ passwordHash, ...u }) => u);
    res.json({ success: true, count: safeUsers.length, data: safeUsers });
  } catch (err) { next(err); }
}

export function updateRole(req, res, next) {
  try {
    const id = Number(req.params.id);
    const { role } = req.body;

    if (!Number.isInteger(id)) throw new BadRequestError('Invalid user ID');
    if (!ROLE_HIERARCHY.includes(role)) {
      throw new BadRequestError('Invalid role', { valid: ROLE_HIERARCHY });
    }
    if (id === req.userId) throw new BadRequestError('Cannot change your own role');

    const user = users.find(u => u.id === id);
    if (!user) throw new NotFoundError('User');

    user.role = role;
    user.updatedAt = new Date().toISOString();

    const { passwordHash, ...safe } = user;
    res.json({ success: true, message: `Role changed to ${role}`, user: safe });
  } catch (err) { next(err); }
}

export function deleteUser(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (id === req.userId) throw new BadRequestError('Cannot delete yourself');

    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) throw new NotFoundError('User');

    const [removed] = users.splice(idx, 1);
    const { passwordHash, ...safe } = removed;
    res.json({ success: true, message: 'User deleted', user: safe });
  } catch (err) { next(err); }
}