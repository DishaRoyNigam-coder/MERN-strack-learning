// src/data/store.js

import { hashPassword } from '../utils/password.js';

// ============================================================
// USERS
// ============================================================
export const users = [];
let nextUserId = 1;
export const getNextUserId = () => nextUserId++;

// ============================================================
// CATEGORIES
// ============================================================
export const categories = [];
let nextCategoryId = 1;
export const getNextCategoryId = () => nextCategoryId++;

// ============================================================
// POSTS
// ============================================================
export const posts = [];
let nextPostId = 1;
export const getNextPostId = () => nextPostId++;

// ============================================================
// COMMENTS
// ============================================================
export const comments = [];
let nextCommentId = 1;
export const getNextCommentId = () => nextCommentId++;

// ============================================================
// PASSWORD RESET TOKENS
// ============================================================
export const passwordResetTokens = new Map();

// ============================================================
// SEED
// ============================================================
export async function seedData() {
  if (users.length > 0) return;

  const [adminHash, editorHash, userHash] = await Promise.all([
    hashPassword('admin123456'),
    hashPassword('editor123456'),
    hashPassword('user123456'),
  ]);

  users.push(
    { id: getNextUserId(), name: 'Admin User', email: 'admin@example.com', passwordHash: adminHash, role: 'admin', avatar: null, bio: 'Platform admin.', createdAt: new Date().toISOString() },
    { id: getNextUserId(), name: 'Alice Editor', email: 'editor@example.com', passwordHash: editorHash, role: 'editor', avatar: null, bio: 'Senior editor.', createdAt: new Date().toISOString() },
    { id: getNextUserId(), name: 'Bob Reader', email: 'bob@example.com', passwordHash: userHash, role: 'user', avatar: null, bio: 'Curious reader.', createdAt: new Date().toISOString() },
  );

  categories.push(
    { id: getNextCategoryId(), name: 'JavaScript', slug: 'javascript', description: 'All about JS', createdAt: new Date().toISOString() },
    { id: getNextCategoryId(), name: 'Node.js', slug: 'nodejs', description: 'Server-side JS', createdAt: new Date().toISOString() },
    { id: getNextCategoryId(), name: 'React', slug: 'react', description: 'UI library', createdAt: new Date().toISOString() },
  );

  posts.push(
    {
      id: getNextPostId(),
      title: 'Getting Started with Node.js',
      slug: 'getting-started-with-nodejs',
      body: 'Node.js is a JavaScript runtime built on Chrome V8...',
      excerpt: 'Node.js is a JavaScript runtime...',
      authorId: 2, categoryId: 2,
      status: 'published', likes: 0, views: 0, tags: ['node', 'javascript'],
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
    },
    {
      id: getNextPostId(),
      title: 'React Hooks Deep Dive',
      slug: 'react-hooks-deep-dive',
      body: 'Hooks let you use state and lifecycle...',
      excerpt: 'Hooks let you use state...',
      authorId: 2, categoryId: 3,
      status: 'published', likes: 0, views: 0, tags: ['react', 'hooks'],
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
    },
    {
      id: getNextPostId(),
      title: 'Advanced Async Patterns (Draft)',
      slug: 'advanced-async-patterns',
      body: 'Draft content...',
      excerpt: 'Draft...',
      authorId: 1, categoryId: 1,
      status: 'draft', likes: 0, views: 0, tags: ['async'],
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      publishedAt: null,
    },
  );

  comments.push(
    { id: getNextCommentId(), postId: 1, authorId: 3, body: 'Great introduction!', parentId: null, status: 'approved', createdAt: new Date().toISOString() },
    { id: getNextCommentId(), postId: 1, authorId: 2, body: 'Thanks, Bob!', parentId: 1, status: 'approved', createdAt: new Date().toISOString() },
  );

  console.log('✅ Seeded: 3 users, 3 categories, 3 posts, 2 comments');
}