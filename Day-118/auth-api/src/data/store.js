// src/data/store.js

import { hashPassword } from '../utils/password.js';

export const users = [];
export const passwordResetTokens = new Map(); // token → { userId, expiresAt }

let nextUserId = 1;

export function getNextUserId() { return nextUserId++; }

export async function seedUsers() {
  if (users.length > 0) return;

  const adminHash = await hashPassword('admin123456');
  const userHash = await hashPassword('user123456');

  users.push(
    {
      id: getNextUserId(),
      name: 'Admin User',
      email: 'admin@example.com',
      passwordHash: adminHash,
      role: 'admin',
      avatar: null,
      emailVerified: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: getNextUserId(),
      name: 'Alice Johnson',
      email: 'alice@example.com',
      passwordHash: userHash,
      role: 'user',
      avatar: null,
      emailVerified: false,
      createdAt: new Date().toISOString(),
    }
  );

  console.log('✅ Seeded 2 users: admin@example.com, alice@example.com');
}