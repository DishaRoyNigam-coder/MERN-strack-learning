// src/services/auth.service.js

import crypto from 'crypto';
import { users, getNextUserId, passwordResetTokens } from '../data/store.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { signToken } from '../utils/jwt.js';
import { UnauthorizedError, ConflictError, NotFoundError } from '../errors/AppError.js';
import { sendWelcomeEmail, sendPasswordResetEmail } from './email.service.js';
import logger from '../utils/logger.js';

const toSafeUser = (user) => {
  const { passwordHash, ...safe } = user;
  return safe;
};

export const authService = {
  async register({ name, email, password }) {
    const normalizedEmail = email.toLowerCase().trim();

    if (users.find(u => u.email === normalizedEmail)) {
      throw new ConflictError('Email already registered', { field: 'email' });
    }

    const passwordHash = await hashPassword(password);
    const newUser = {
      id: getNextUserId(),
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: 'user',
      avatar: null,
      emailVerified: false,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);

    const token = signToken({ userId: newUser.id, email: newUser.email, role: newUser.role });

    // Fire-and-forget welcome email
    sendWelcomeEmail(toSafeUser(newUser)).catch(err => {
      logger.error('Welcome email failed', { email: newUser.email, error: err.message });
    });

    logger.info('User registered', { userId: newUser.id, email: newUser.email });
    return { token, user: toSafeUser(newUser) };
  },

  async login(email, password) {
    const user = users.find(u => u.email === email.toLowerCase().trim());
    if (!user) throw new UnauthorizedError('Invalid email or password');

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) throw new UnauthorizedError('Invalid email or password');

    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    logger.info('User logged in', { userId: user.id, email: user.email });
    return { token, user: toSafeUser(user) };
  },

  getProfile(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) throw new NotFoundError('User');
    return toSafeUser(user);
  },

  async updateProfile(userId, updates) {
    const user = users.find(u => u.id === userId);
    if (!user) throw new NotFoundError('User');

    if (updates.email && updates.email !== user.email) {
      const normalizedEmail = updates.email.toLowerCase().trim();
      if (users.find(u => u.id !== userId && u.email === normalizedEmail)) {
        throw new ConflictError('Email already in use');
      }
      user.email = normalizedEmail;
    }

    if (updates.name) user.name = updates.name.trim();
    user.updatedAt = new Date().toISOString();

    logger.info('Profile updated', { userId: user.id });
    return toSafeUser(user);
  },

  async changePassword(userId, currentPassword, newPassword) {
    const user = users.find(u => u.id === userId);
    if (!user) throw new NotFoundError('User');

    const valid = await comparePassword(currentPassword, user.passwordHash);
    if (!valid) throw new UnauthorizedError('Current password is incorrect');

    user.passwordHash = await hashPassword(newPassword);
    user.updatedAt = new Date().toISOString();

    logger.info('Password changed', { userId: user.id });
    return toSafeUser(user);
  },

  async requestPasswordReset(email) {
    const user = users.find(u => u.email === email.toLowerCase().trim());

    // Don't leak whether email exists — always return success
    if (!user) {
      logger.warn('Password reset requested for unknown email', { email });
      return { sent: false };
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour

    passwordResetTokens.set(token, { userId: user.id, expiresAt });

    sendPasswordResetEmail(toSafeUser(user), token).catch(err => {
      logger.error('Password reset email failed', { userId: user.id, error: err.message });
    });

    logger.info('Password reset requested', { userId: user.id });
    return { sent: true };
  },

  async resetPassword(token, newPassword) {
    const entry = passwordResetTokens.get(token);

    if (!entry) throw new UnauthorizedError('Invalid or expired reset token');
    if (entry.expiresAt < Date.now()) {
      passwordResetTokens.delete(token);
      throw new UnauthorizedError('Reset token has expired');
    }

    const user = users.find(u => u.id === entry.userId);
    if (!user) throw new NotFoundError('User');

    user.passwordHash = await hashPassword(newPassword);
    user.updatedAt = new Date().toISOString();
    passwordResetTokens.delete(token);

    logger.info('Password reset completed', { userId: user.id });
    return toSafeUser(user);
  },
};