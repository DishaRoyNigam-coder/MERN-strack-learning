// server.js

import express from 'express';
import { users, posts } from './data/users.js';

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================
// MIDDLEWARE
// ============================================================

// Parse JSON bodies
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
});

// ============================================================
// ROOT ENDPOINT
// ============================================================

app.get('/', (req, res) => {
  res.json({
    message: '🚀 Express Routing Demo',
    version: '1.0.0',
    endpoints: {
      users: {
        all: 'GET /api/users',
        byId: 'GET /api/users/:id',
        filter: 'GET /api/users?role=admin&country=USA',
        pagination: 'GET /api/users?page=1&limit=3',
        sort: 'GET /api/users?sort=name&order=asc',
      },
      search: {
        basic: 'GET /api/search?q=express',
        advanced: 'GET /api/search?q=react&type=posts&limit=5',
      },
      posts: {
        all: 'GET /api/posts',
        byId: 'GET /api/posts/:id',
        byUser: 'GET /api/users/:userId/posts',
      },
    },
  });
});

// ============================================================
// 1. GET /api/users - Get all users (with query support)
// ============================================================

app.get('/api/users', (req, res) => {
  let result = [...users];

  // --- Filtering ---
  const { role, country, search } = req.query;

  if (role) {
    result = result.filter(u => u.role.toLowerCase() === role.toLowerCase());
  }

  if (country) {
    result = result.filter(u => u.country.toLowerCase() === country.toLowerCase());
  }

  if (search) {
    const term = search.toLowerCase();
    result = result.filter(u =>
      u.name.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term)
    );
  }

  // --- Sorting ---
  const { sort, order = 'asc' } = req.query;

  if (sort) {
    result.sort((a, b) => {
      const aVal = a[sort];
      const bVal = b[sort];
      if (aVal < bVal) return order === 'asc' ? -1 : 1;
      if (aVal > bVal) return order === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // --- Pagination ---
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || result.length;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedResult = result.slice(startIndex, endIndex);

  res.json({
    total: result.length,
    page,
    limit,
    totalPages: Math.ceil(result.length / limit),
    count: paginatedResult.length,
    users: paginatedResult,
  });
});

// ============================================================
// 2. GET /api/users/:id - Get user by ID (route param)
// ============================================================

app.get('/api/users/:id', (req, res) => {
  // Convert to number
  const id = parseInt(req.params.id);

  // Validate
  if (isNaN(id)) {
    return res.status(400).json({
      error: 'Invalid ID',
      message: 'ID must be a number',
      received: req.params.id,
    });
  }

  // Find user
  const user = users.find(u => u.id === id);

  if (!user) {
    return res.status(404).json({
      error: 'User not found',
      message: `No user exists with ID ${id}`,
    });
  }

  // Include user's posts
  const userPosts = posts.filter(p => p.userId === id);

  res.json({
    ...user,
    postCount: userPosts.length,
    posts: userPosts,
  });
});

// ============================================================
// 3. GET /api/users/:userId/posts - Get posts by user (multiple params)
// ============================================================

app.get('/api/users/:userId/posts', (req, res) => {
  const userId = parseInt(req.params.userId);

  if (isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  const user = users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const userPosts = posts.filter(p => p.userId === userId);

  res.json({
    userId,
    userName: user.name,
    count: userPosts.length,
    posts: userPosts,
  });
});

// ============================================================
// 4. GET /api/posts - Get all posts (with query support)
// ============================================================

app.get('/api/posts', (req, res) => {
  let result = [...posts];

  // Filter by tag
  const { tag, userId } = req.query;

  if (tag) {
    result = result.filter(p => p.tags.includes(tag.toLowerCase()));
  }

  if (userId) {
    result = result.filter(p => p.userId === parseInt(userId));
  }

  // Sort by likes
  const { sort } = req.query;
  if (sort === 'likes') {
    result.sort((a, b) => b.likes - a.likes);
  }

  res.json({
    count: result.length,
    posts: result,
  });
});

// ============================================================
// 5. GET /api/posts/:id - Get post by ID
// ============================================================

app.get('/api/posts/:id', (req, res) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid post ID' });
  }

  const post = posts.find(p => p.id === id);
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }

  const author = users.find(u => u.id === post.userId);

  res.json({
    ...post,
    author: author ? { id: author.id, name: author.name, email: author.email } : null,
  });
});

// ============================================================
// 6. GET /api/search?q=term - Search endpoint (query strings)
// ============================================================

app.get('/api/search', (req, res) => {
  const { q, type = 'all', limit = 10, sort = 'relevance' } = req.query;

  // Validate
  if (!q || q.trim() === '') {
    return res.status(400).json({
      error: 'Missing query',
      message: 'Please provide a search term using ?q=your+search',
      example: '/api/search?q=express',
    });
  }

  const term = q.toLowerCase().trim();
  const maxResults = Math.min(parseInt(limit) || 10, 50);

  const results = {
    query: q,
    type,
    limit: maxResults,
    users: [],
    posts: [],
  };

  // Search users
  if (type === 'all' || type === 'users') {
    results.users = users.filter(u =>
      u.name.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      u.country.toLowerCase().includes(term)
    ).slice(0, maxResults);
  }

  // Search posts
  if (type === 'all' || type === 'posts') {
    results.posts = posts.filter(p =>
      p.title.toLowerCase().includes(term) ||
      p.body.toLowerCase().includes(term) ||
      p.tags.some(t => t.toLowerCase().includes(term))
    ).slice(0, maxResults);
  }

  // Sort by relevance (number of matches)
  if (sort === 'relevance') {
    results.posts.sort((a, b) => b.likes - a.likes);
  }

  results.totalResults = results.users.length + results.posts.length;

  if (results.totalResults === 0) {
    return res.status(404).json({
      ...results,
      message: `No results found for "${q}"`,
    });
  }

  res.json(results);
});

// ============================================================
// 7. GET /api/stats - Stats endpoint (demonstrates multiple query params)
// ============================================================

app.get('/api/stats', (req, res) => {
  const { include = 'all' } = req.query;

  const stats = {};

  if (include === 'all' || include.includes('users')) {
    stats.users = {
      total: users.length,
      byRole: users.reduce((acc, u) => {
        acc[u.role] = (acc[u.role] || 0) + 1;
        return acc;
      }, {}),
      byCountry: users.reduce((acc, u) => {
        acc[u.country] = (acc[u.country] || 0) + 1;
        return acc;
      }, {}),
    };
  }

  if (include === 'all' || include.includes('posts')) {
    stats.posts = {
      total: posts.length,
      totalLikes: posts.reduce((sum, p) => sum + p.likes, 0),
      topPost: posts.reduce((top, p) => p.likes > top.likes ? p : top, posts[0]),
    };
  }

  res.json(stats);
});




// Add this to server.js before the 404 handler
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));



// ============================================================
// 404 HANDLER
// ============================================================

app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    availableEndpoints: [
      'GET /',
      'GET /api/users',
      'GET /api/users/:id',
      'GET /api/users/:userId/posts',
      'GET /api/posts',
      'GET /api/posts/:id',
      'GET /api/search?q=term',
      'GET /api/stats',
    ],
  });
});

// ============================================================
// START SERVER
// ============================================================

app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 Express Routing Demo Server');
  console.log('='.repeat(60));
  console.log(`🌐 URL:          http://localhost:${PORT}`);
  console.log(`📅 Started:      ${new Date().toLocaleString()}`);
  console.log(`📦 Node:         ${process.version}`);
  console.log('='.repeat(60));
  console.log('\n📋 Available Endpoints:');
  console.log('   GET  /');
  console.log('   GET  /api/users');
  console.log('   GET  /api/users/:id');
  console.log('   GET  /api/users/:userId/posts');
  console.log('   GET  /api/posts');
  console.log('   GET  /api/posts/:id');
  console.log('   GET  /api/search?q=term');
  console.log('   GET  /api/stats');
  console.log('\n🧪 Try these examples:');
  console.log('   /api/users/1');
  console.log('   /api/users?role=admin');
  console.log('   /api/users?page=1&limit=2');
  console.log('   /api/search?q=express');
  console.log('   /api/search?q=react&type=posts');
  console.log('='.repeat(60) + '\n');
});