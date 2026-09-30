// src/services/auth.service.js

import { users } from '../data/store.js';
import { comparePassword } from '../utils/password.js';
import { signToken } from '../utils/jwt.js';
import { UnauthorizedError, ConflictError } from '../errors/AppError.js';
import { hashPassword } from '../utils/password.js';
import { getNextUserId } from '../data/store.js';

export const authService = {
  /**
   * Authenticate a user with email + password
   * Returns the user and a signed JWT
   */
  async login(email, password) {
    // 1. Find user by email
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      // Don't reveal whether email exists (security best practice)
      throw new UnauthorizedError('Invalid email or password');
    }

    // 2. Compare password with hash
    const isValid = await comparePassword(password, user.password);

    if (!isValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // 3. Generate JWT
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // 4. Return token and safe user data (no password!)
    const { password: _, ...safeUser } = user;

    return { token, user: safeUser };
  },

  /**
   * Register a new user
   */
  async register({ name, email, password }) {
    // Check for existing email
    const exists = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      throw new ConflictError('Email already registered', { field: 'email' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const newUser = {
      id: getNextUserId(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: 'user',
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);

    // Generate token
    const token = signToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    const { password: _, ...safeUser } = newUser;

    return { token, user: safeUser };
  },

  /**
   * Get the current user from a JWT payload
   */
  getCurrentUser(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) {
      throw new UnauthorizedError('User no longer exists');
    }
    const { password: _, ...safeUser } = user;
    return safeUser;
  },
};