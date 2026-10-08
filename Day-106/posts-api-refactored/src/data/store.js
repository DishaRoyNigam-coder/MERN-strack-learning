// src/data/store.js

import { hashPassword } from '../utils/password.js';

// ============================================================
// USERS
// ============================================================

export const users = [];

export async function seedUsers() {
  if (users.length > 0) return;

  const adminHash = await hashPassword('admin123');
  const userHash = await hashPassword('user123');
  const editorHash = await hashPassword('editor123');

  users.push(
    {
      id: "1",
      name: 'Admin User',
      email: 'admin@example.com',
      passwordHash: adminHash,
      role: 'admin',
      avatar: null, // ← New field: relative URL path
      createdAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: "2",
      name: 'Alice Johnson',
      email: 'alice@example.com',
      passwordHash: userHash,
      role: 'user',
      avatar: null,
      createdAt: '2026-01-15T10:00:00.000Z',
    },
    {
      id: "3",
      name: 'Bob Smith',
      email: 'bob@example.com',
      passwordHash: editorHash,
      role: 'editor',
      avatar: null,
      createdAt: '2026-02-10T14:30:00.000Z',
    }
  );

  console.log('✅ Seeded 3 users (admin, alice, bob)');
}

// ============================================================
// POSTS
// ============================================================

export const posts = [
  {
    id: "1",
    title: "Welcome to our platform!",
    content: "This is our very first system-generated post.",
    userId: "1",
    coverImage: null,
    createdAt: '2026-01-01T01:00:00.000Z',
    updatedAt: '2026-01-01T01:00:00.000Z'
  }
];

// ============================================================
// ID COUNTERS & GENERATORS
// ============================================================

let nextPostId = posts.length + 1;
let nextUserId = 4; // Starts at 4 since users 1, 2, and 3 are seeded

export function getNextPostId() { 
  return String(nextPostId++); 
}

export function getNextUserId() { 
  return String(nextUserId++); 
}
