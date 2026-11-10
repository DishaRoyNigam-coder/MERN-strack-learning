// src/services/users.service.js

import { users, posts, comments } from '../data/store.js';
import { NotFoundError, ConflictError, BadRequestError } from '../errors/AppError.js';

const toSafeUser = ({ passwordHash, ...safe }) => safe;

export const usersService = {
  list(query = {}) {
    let result = [...users];
    if (query.role) result = result.filter((u) => u.role === query.role);
    if (query.q) {
      const term = query.q.toLowerCase();
      result = result.filter((u) => u.name.toLowerCase().includes(term) || u.email.includes(term));
    }
    return result.map(toSafeUser);
  },

  getById(id) {
    const user = users.find((u) => u.id === Number(id));
    if (!user) throw new NotFoundError('User', { id });
    const userPosts = posts.filter((p) => p.authorId === user.id && p.status === 'published');
    return {
      ...toSafeUser(user),
      stats: {
        postCount: userPosts.length,
        commentCount: comments.filter((c) => c.authorId === user.id).length,
      },
    };
  },

  getProfile(userId) {
    const user = users.find((u) => u.id === userId);
    if (!user) throw new NotFoundError('User');
    return toSafeUser(user);
  },

  updateProfile(userId, updates) {
    const user = users.find((u) => u.id === userId);
    if (!user) throw new NotFoundError('User');

    if (updates.name !== undefined) {
      if (updates.name.trim().length < 2) throw new BadRequestError('Name too short');
      user.name = updates.name.trim();
    }
    if (updates.email !== undefined) {
      const normalized = updates.email.toLowerCase().trim();
      if (users.find((u) => u.id !== userId && u.email === normalized)) {
        throw new ConflictError('Email already in use');
      }
      user.email = normalized;
    }
    if (updates.bio !== undefined) user.bio = updates.bio.trim();
    user.updatedAt = new Date().toISOString();
    return toSafeUser(user);
  },

  remove(id, currentUserId) {
    const idx = users.findIndex((u) => u.id === Number(id));
    if (idx === -1) throw new NotFoundError('User', { id });
    if (users[idx].id === currentUserId) {
      throw new BadRequestError('You cannot delete your own account');
    }
    const [removed] = users.splice(idx, 1);
    // Cascade
    for (let i = posts.length - 1; i >= 0; i--) if (posts[i].authorId === id) posts.splice(i, 1);
    for (let i = comments.length - 1; i >= 0; i--) if (comments[i].authorId === id) comments.splice(i, 1);
    return toSafeUser(removed);
  },
};