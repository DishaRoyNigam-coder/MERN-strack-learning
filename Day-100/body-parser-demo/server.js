// server.js

import express from 'express';
import chalk from 'chalk';
import { store } from './data/store.js';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================
// 1. BODY-PARSING MIDDLEWARE
// ============================================================

// Parse JSON bodies (Content-Type: application/json)
app.use(express.json({
  limit: '1mb',
  strict: true,
}));

// Parse URL-encoded bodies (Content-Type: application/x-www-form-urlencoded)
app.use(express.urlencoded({
  extended: true,
  limit: '1mb',
}));

// ============================================================
// 2. REQUEST LOGGER
// ============================================================

app.use((req, res, next) => {
  const hasBody = req.body && Object.keys(req.body).length > 0;
  console.log(chalk.gray(`[${new Date().toLocaleTimeString()}]`) + ' ' +
    chalk.cyan(req.method.padEnd(6)) + ' ' +
    chalk.yellow(req.originalUrl) +
    (hasBody ? ' ' + chalk.magenta(`body: ${Object.keys(req.body).length} keys`) : ''));
  next();
});

// ============================================================
// 3. VALIDATION HELPERS
// ============================================================

function validateUser(data, isUpdate = false) {
  const errors = [];

  if (!isUpdate || data.name !== undefined) {
    if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2) {
      errors.push('Name must be a string with at least 2 characters');
    }
  }

  if (!isUpdate || data.email !== undefined) {
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push('Valid email is required');
    }
  }

  if (data.age !== undefined) {
    const age = Number(data.age);
    if (isNaN(age) || age < 0 || age > 150) {
      errors.push('Age must be a number between 0 and 150');
    }
  }

  return errors;
}

// ============================================================
// 4. ROUTES
// ============================================================

// --- Root ---
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Body Parser Demo',
    version: '1.0.0',
    description: 'Demo of express.json() and express.urlencoded()',
    endpoints: {
      users: {
        list: 'GET /api/users',
        get: 'GET /api/users/:id',
        create: 'POST /api/users (JSON or form-urlencoded)',
        update: 'PUT /api/users/:id',
        patch: 'PATCH /api/users/:id',
        delete: 'DELETE /api/users/:id',
      },
      posts: {
        list: 'GET /api/posts',
        create: 'POST /api/posts',
      },
      demos: {
        json: 'POST /api/demo/json',
        form: 'POST /api/demo/form',
        inspect: 'POST /api/demo/inspect (any format)',
      },
    },
  });
});

// ============================================================
// GET Routes
// ============================================================

// Get all users
app.get('/api/users', (req, res) => {
  res.json({
    count: store.users.length,
    users: store.users,
  });
});

// Get user by ID
app.get('/api/users/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const user = store.users.find(u => u.id === id);

  if (!user) {
    return res.status(404).json({ error: 'User not found', id });
  }

  res.json(user);
});

// Get all posts
app.get('/api/posts', (req, res) => {
  res.json({
    count: store.posts.length,
    posts: store.posts,
  });
});

// ============================================================
// POST Routes — Handle JSON bodies (express.json())
// ============================================================

// --- Create user (JSON) ---
app.post('/api/users', (req, res) => {
  console.log(chalk.blue('📥 Received body:'), req.body);

  const errors = validateUser(req.body);
  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors,
    });
  }

  const newUser = {
    id: store.nextUserId++,
    name: req.body.name.trim(),
    email: req.body.email.toLowerCase().trim(),
    age: req.body.age !== undefined ? Number(req.body.age) : null,
    role: req.body.role || 'user',
  };

  store.users.push(newUser);

  res.status(201).json({
    message: 'User created successfully',
    user: newUser,
  });
});

// --- Create post (JSON) ---
app.post('/api/posts', (req, res) => {
  const { title, body, userId, tags } = req.body;

  if (!title || !body) {
    return res.status(400).json({
      error: 'Validation failed',
      details: ['title and body are required'],
    });
  }

  const newPost = {
    id: store.nextPostId++,
    userId: userId || 1,
    title,
    body,
    tags: Array.isArray(tags) ? tags : tags ? [tags] : [],
    createdAt: new Date().toISOString(),
  };

  store.posts.push(newPost);

  res.status(201).json({
    message: 'Post created',
    post: newPost,
  });
});

// ============================================================
// PUT / PATCH Routes — Update user
// ============================================================

// --- Full update (PUT) ---
app.put('/api/users/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = store.users.findIndex(u => u.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  const errors = validateUser(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  // Replace entire user (keeping ID)
  store.users[index] = {
    id,
    name: req.body.name.trim(),
    email: req.body.email.toLowerCase().trim(),
    age: req.body.age !== undefined ? Number(req.body.age) : null,
    role: req.body.role || 'user',
  };

  res.json({
    message: 'User updated (PUT)',
    user: store.users[index],
  });
});

// --- Partial update (PATCH) ---
app.patch('/api/users/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const user = store.users.find(u => u.id === id);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const errors = validateUser(req.body, true);
  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  // Merge updates
  Object.assign(user, req.body);

  res.json({
    message: 'User updated (PATCH)',
    user,
  });
});

// ============================================================
// DELETE Route
// ============================================================

app.delete('/api/users/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = store.users.findIndex(u => u.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  const [deleted] = store.users.splice(index, 1);

  res.json({
    message: 'User deleted',
    user: deleted,
  });
});

// ============================================================
// DEMO Routes — Show the difference
// ============================================================

// --- JSON demo ---
app.post('/api/demo/json', (req, res) => {
  res.json({
    message: '✅ Received JSON body',
    contentType: req.headers['content-type'],
    body: req.body,
    bodyTypes: Object.fromEntries(
      Object.entries(req.body).map(([k, v]) => [k, typeof v])
    ),
    bodyKeys: Object.keys(req.body),
  });
});

// --- Form demo ---
app.post('/api/demo/form', (req, res) => {
  res.json({
    message: '✅ Received URL-encoded form body',
    contentType: req.headers['content-type'],
    body: req.body,
    bodyTypes: Object.fromEntries(
      Object.entries(req.body).map(([k, v]) => [k, typeof v])
    ),
    bodyKeys: Object.keys(req.body),
    note: 'All values are strings in urlencoded bodies!',
  });
});

// --- Inspect demo (works with any format) ---
app.post('/api/demo/inspect', (req, res) => {
  const contentType = req.headers['content-type'] || 'none';

  let format = 'unknown';
  if (contentType.includes('application/json')) format = 'JSON';
  else if (contentType.includes('application/x-www-form-urlencoded')) format = 'URL-encoded';

  res.json({
    format,
    contentType,
    body: req.body,
    isEmpty: !req.body || Object.keys(req.body).length === 0,
    parsedAt: new Date().toISOString(),
  });
});
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'public')));


// ============================================================
// 404 & ERROR HANDLERS
// ============================================================

app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
  });
});

app.use((err, req, res, next) => {
  // Body-parser errors (invalid JSON, too large, etc.)
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: 'Invalid JSON',
      message: 'The request body contains malformed JSON',
      details: err.message,
    });
  }

  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      error: 'Payload Too Large',
      message: 'Request body exceeds the allowed limit',
      limit: '1mb',
    });
  }

  console.error(chalk.red('❌ Error:'), err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

// ============================================================
// START SERVER
// ============================================================

app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log(chalk.bold.cyan('🚀 Body Parser Demo Server'));
  console.log('='.repeat(60));
  console.log(chalk.white(`🌐 URL:          http://localhost:${PORT}`));
  console.log(chalk.white(`📅 Started:      ${new Date().toLocaleString()}`));
  console.log('='.repeat(60));
  console.log(chalk.yellow('\n📋 Body Parsing Middleware:'));
  console.log(chalk.gray('   ✅ express.json()       → application/json'));
  console.log(chalk.gray('   ✅ express.urlencoded() → x-www-form-urlencoded'));
  console.log(chalk.yellow('\n🧪 Test with curl:'));
  console.log(chalk.gray('\n   JSON body:'));
  console.log(chalk.gray(`   curl -X POST http://localhost:${PORT}/api/users \\`));
  console.log(chalk.gray('     -H "Content-Type: application/json" \\'));
  console.log(chalk.gray('     -d \'{"name":"Charlie","email":"charlie@example.com","age":30}\''));
  console.log(chalk.gray('\n   Form body:'));
  console.log(chalk.gray(`   curl -X POST http://localhost:${PORT}/api/users \\`));
  console.log(chalk.gray('     -d "name=Dave&email=dave@example.com&age=25"'));
  console.log('='.repeat(60) + '\n');
});