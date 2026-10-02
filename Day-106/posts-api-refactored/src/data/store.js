// src/data/store.js

import { hashPassword } from '../utils/password.js';

// ============================================================
// USERS
// ============================================================

export const users = [];

// Seed with hashed passwords (async on first import)
export async function seedUsers() {
  if (users.length > 0) return;

  const adminHash = await hashPassword('admin123');
  const userHash = await hashPassword('user123');
  const editorHash = await hashPassword('editor123');

  users.push(
    {
      id: 1,
      name: 'Admin User',
      email: 'admin@example.com',
      passwordHash: adminHash,
      role: 'admin',
      createdAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 2,
      name: 'Alice Johnson',
      email: 'alice@example.com',
      passwordHash: userHash,
      role: 'user',
      createdAt: '2026-01-15T10:00:00.000Z',
    },
    {
      id: 3,
      name: 'Bob Smith',
      email: 'bob@example.com',
      passwordHash: editorHash,
      role: 'editor',
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
    id: 1,
    title: 'Getting Started with Express',
    body: 'Express is a minimal and flexible Node.js web application framework...',
    author: 'Alice Johnson',
    authorId: 2,
    tags: ['express', 'node', 'backend'],
    published: true,
    likes: 120,
    createdAt: '2026-09-01T10:00:00.000Z',
    updatedAt: '2026-09-01T10:00:00.000Z',
  },
  {
    id: 2,
    title: 'Mastering React Hooks',
    body: 'Hooks changed the way we write React components...',
    author: 'Bob Smith',
    authorId: 3,
    tags: ['react', 'hooks', 'frontend'],
    published: true,
    likes: 340,
    createdAt: '2026-09-03T14:30:00.000Z',
    updatedAt: '2026-09-05T09:15:00.000Z',
  },
  {
    id: 3,
    title: 'REST API Best Practices',
    body: 'Designing a good REST API is a combination of art and science...',
    author: 'Admin User',
    authorId: 1,
    tags: ['rest', 'api', 'backend'],
    published: false,
    likes: 210,
    createdAt: '2026-09-05T08:45:00.000Z',
    updatedAt: '2026-09-05T08:45:00.000Z',
  },
];

let nextPostId = posts.length + 1;
let nextUserId = users.length + 1;

export function getNextPostId() {
  return nextPostId++;
}

export function getNextUserId() {
  return nextUserId++;
}