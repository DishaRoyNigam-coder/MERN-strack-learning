
// tests/blog.e2e.test.js

import request from 'supertest';
import app from '../src/app.js';
import { categories, posts, comments, users } from '../src/data/store.js';

// Helper: seed minimum data for tests
async function seedTestData() {
  const { seedData } = await import('../src/data/store.js');

  // Wipe existing data
  users.length = 0;
  categories.length = 0;
  posts.length = 0;
  comments.length = 0;

  await seedData();
}

// Helper: login and get agent + token
async function loginAs(email, password) {
  const agent = request.agent(app);

  const res = await agent
    .post('/api/auth/login')
    .send({ email, password });

  return {
    agent,
    token: res.body.token,
    user: res.body.user,
  };
}

describe('Blog API — End-to-End', () => {
  let admin, editor, reader;

  beforeAll(async () => {
    await seedTestData();

    admin = await loginAs('admin@example.com', 'admin123456');
    editor = await loginAs('editor@example.com', 'editor123456');
    reader = await loginAs('bob@example.com', 'user123456');
  });

  // ============================================================
  // Categories
  // ============================================================

  describe('Categories', () => {
    it('GET /api/categories — returns list with post counts', async () => {
      const res = await request(app).get('/api/categories');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(3);
      expect(res.body.data[0]).toHaveProperty('postCount');
    });

    it('POST /api/categories — requires editor+', async () => {
      const asReader = await reader.agent
        .post('/api/categories')
        .send({ name: 'Test Cat' });

      expect(asReader.status).toBe(403);

      const asEditor = await editor.agent
        .post('/api/categories')
        .send({ name: 'Test Cat' });

      expect(asEditor.status).toBe(201);
      expect(asEditor.body.data.slug).toBe('test-cat');
    });

    it('DELETE /api/categories/:id — blocked if it has posts', async () => {
      const res = await admin.agent.delete('/api/categories/2');

      // Category 2 has posts
      expect(res.status).toBe(400);
    });
  });

  // ============================================================
  // Posts
  // ============================================================

  describe('Posts', () => {
    it('GET /api/posts — public sees published only', async () => {
      const res = await request(app).get('/api/posts');

      expect(res.status).toBe(200);
      expect(
        res.body.data.every((p) => p.status === 'published')
      ).toBe(true);
    });

    it('GET /api/posts — editor sees drafts too', async () => {
      const res = await editor.agent.get('/api/posts');

      expect(res.status).toBe(200);
      expect(
        res.body.data.some((p) => p.status === 'draft')
      ).toBe(true);
    });

    it('POST /api/posts — requires auth', async () => {
      const res = await request(app)
        .post('/api/posts')
        .send({
          title: 'X',
          body: 'Y',
          categoryId: 1,
        });

      expect(res.status).toBe(401);
    });

    it('POST /api/posts — creates a post', async () => {
      const res = await reader.agent
        .post('/api/posts')
        .send({
          title: 'My New Post',
          body: 'This is a test post with enough body content to pass validation.',
          categoryId: 1,
          tags: ['test'],
        });

      expect(res.status).toBe(201);
      expect(res.body.data.slug).toBe('my-new-post');
      expect(res.body.data.status).toBe('draft');
      expect(res.body.data.author.id).toBe(reader.user.id);
    });

    it('PATCH /api/posts/:id — author can edit own post', async () => {
      const res = await reader.agent
        .patch(`/api/posts/${posts[posts.length - 1].id}`)
        .send({ title: 'Updated Title' });

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Updated Title');
    });

    it('PATCH /api/posts/:id — reader cannot edit others posts', async () => {
      const res = await reader.agent
        .patch('/api/posts/1')
        .send({ title: 'Hacked!' });

      expect(res.status).toBe(403);
    });

    it('PATCH /api/posts/:id — editor can edit any post', async () => {
      const res = await editor.agent
        .patch('/api/posts/1')
        .send({ title: 'Editor Updated' });

      expect(res.status).toBe(200);
    });

    it('POST /api/posts/:id/like — increments likes', async () => {
      const res = await request(app).post('/api/posts/1/like');

      expect(res.status).toBe(200);
      expect(res.body.data.likes).toBeGreaterThan(0);
    });

    it('GET /api/posts — supports filtering and pagination', async () => {
      const res = await request(app)
        .get('/api/posts?category=nodejs&page=1&limit=5');

      expect(res.status).toBe(200);
      expect(res.body.pagination).toHaveProperty('totalPages');
    });
  });

  // ============================================================
  // Comments
  // ============================================================

  describe('Comments', () => {
    it('GET /api/posts/:id/comments — returns comments', async () => {
      const res = await request(app).get('/api/posts/1/comments');

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
    });

    it('POST /api/posts/:id/comments — requires auth', async () => {
      const res = await request(app)
        .post('/api/posts/1/comments')
        .send({ body: 'Test' });

      expect(res.status).toBe(401);
    });

    it('POST /api/posts/:id/comments — adds a comment', async () => {
      const res = await reader.agent
        .post('/api/posts/1/comments')
        .send({ body: 'Great article!' });

      expect(res.status).toBe(201);
      expect(res.body.data.author.id).toBe(reader.user.id);
    });

    it('POST /api/posts/:id/comments — supports replies', async () => {
      const parent = comments[0];

      const res = await reader.agent
        .post('/api/posts/1/comments')
        .send({
          body: 'Reply!',
          parentId: parent.id,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.parentId).toBe(parent.id);
    });

    it('DELETE /api/comments/:id — author can delete own comment', async () => {
      const mine = comments.find(
        (c) => c.authorId === reader.user.id
      );

      expect(mine).toBeDefined();

      const res = await reader.agent.delete(
        `/api/comments/${mine.id}`
      );

      expect(res.status).toBe(200);
    });

    it('DELETE /api/comments/:id — reader cannot delete others comment', async () => {
      // Editor creates a fresh independent comment
      const created = await editor.agent
        .post('/api/posts/1/comments')
        .send({
          body: 'Editor independent comment!',
        });

      expect(created.status).toBe(201);

      const editorCommentId = created.body.data.id;

      // Reader tries to delete Editor's comment
      const res = await reader.agent.delete(
        `/api/comments/${editorCommentId}`
      );

      expect(res.status).toBe(403);
    });

    it('PATCH /api/comments/:id/moderate — editor can moderate', async () => {
      const target = comments[0];

      const res = await editor.agent
        .patch(`/api/comments/${target.id}/moderate`)
        .send({ status: 'pending' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('pending');
    });
  });

  // ============================================================
  // Users
  // ============================================================

  describe('Users', () => {
    it('GET /api/users — admin only', async () => {
      const asReader = await reader.agent.get('/api/users');

      expect(asReader.status).toBe(403);

      const asAdmin = await admin.agent.get('/api/users');

      expect(asAdmin.status).toBe(200);
      expect(asAdmin.body.data.length).toBeGreaterThanOrEqual(3);
    });

    it('GET /api/users/:id — public profile with stats', async () => {
      const res = await request(app).get('/api/users/2');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('stats');
      expect(res.body.data.passwordHash).toBeUndefined();
    });

    it('GET /api/auth/me — own profile', async () => {
      const res = await editor.agent.get('/api/auth/me');

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe('editor@example.com');
    });

    it('DELETE /api/users/:id — admin cannot delete self', async () => {
      const res = await admin.agent.delete(
        `/api/users/${admin.user.id}`
      );

      expect(res.status).toBe(400);
    });
  });

  // ============================================================
  // Auth & Security
  // ============================================================

  describe('Auth & Security', () => {
    it('Login flow returns a working JWT', async () => {
      const login = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'bob@example.com',
          password: 'user123456',
        });

      expect(login.status).toBe(200);
      expect(login.body.token).toBeDefined();

      const me = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${login.body.token}`);

      expect(me.status).toBe(200);
    });

    it('All responses include security headers', async () => {
      const res = await request(app).get('/api/posts');

      expect(res.headers['x-frame-options']).toBe('DENY');
      expect(res.headers['x-content-type-options']).toBe('nosniff');
      expect(res.headers['content-security-policy']).toBeDefined();
    });

    it('No endpoint leaks password hashes', async () => {
      const res = await request(app).get('/api/users/1');

      expect(JSON.stringify(res.body)).not.toMatch(/passwordHash/);
    });
  });
});
