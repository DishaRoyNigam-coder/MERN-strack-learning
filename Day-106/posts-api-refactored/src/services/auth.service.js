// src/services/auth.service.js
import { users } from '../data/store.js';
import { comparePassword, hashPassword } from '../utils/password.js';
import { signToken } from '../utils/jwt.js';
import { UnauthorizedError, ConflictError } from '../errors/AppError.js';
import { getNextUserId } from '../data/store.js';
import { sendWelcomeEmail } from './email.service.js';
import logger from '../utils/logger.js';

export const authService = {
  async login(email, password) {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) throw new UnauthorizedError('Invalid email or password');

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) throw new UnauthorizedError('Invalid email or password');

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Added: Log user login success
    logger.info('User logged in', { userId: user.id, email: user.email });

    const { passwordHash: _, ...safeUser } = user;
    return { token, user: safeUser };
  },

  async register({ name, email, password }) {
    const exists = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      throw new ConflictError('Email already registered', { field: 'email' });
    }

    const hashedPassword = await hashPassword(password);
    const newUser = {
      id: getNextUserId(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash: hashedPassword,
      role: 'user',
      avatar: null,
      emailVerified: false,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);

    const token = signToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    // Added: Log user registration success
    logger.info('User registered', {
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    const { passwordHash: _, ...safeUser } = newUser;

    // ✅ FIRE-AND-FORGET: Send welcome email but don't block signup
    sendWelcomeEmail(safeUser).catch(err => {
      logger.error('Failed to send welcome email', { 
        email: safeUser.email, 
        error: err.message 
      });
    });

    return { token, user: safeUser };
  },

  getCurrentUser(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) throw new UnauthorizedError('User no longer exists');

    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  },
};
