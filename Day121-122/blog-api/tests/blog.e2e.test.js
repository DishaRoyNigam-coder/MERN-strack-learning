
// tests/blog.e2e.test.js

import request from 'supertest';
import app from '../src/app.js';
import { categories, posts, comments, users } from '../src/data/store.js';

// Helper: seed minimum data for tests
async function seedTestData() {
  const { seedData } = await import('../src/data/store.js');

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
  // Posts — Query Features
  // ============================================================

  describe('GET /api/posts — Query Features', () => {
    // Create 25 published posts with different tags, likes, views and dates.
    beforeAll(async () => {
      const base = Date.now();

      for (let i = 1; i <= 25; i++) {
        const res = await reader.agent
          .post('/api/posts')
          .send({
            title: `Test Post ${i}`,
            body: `Body for post ${i} with enough content to pass validation checks.`,
            categoryId: (i % 3) + 1,
            tags: i % 2 === 0 ? ['even', 'test'] : ['odd', 'test'],
          });

        expect(res.status).toBe(201);

        const created = posts.find(
          (post) => post.id === res.body.data.id
        );

        expect(created).toBeDefined();

        // Reader-created posts default to draft; publish test fixtures.
        created.status = 'published';
        created.likes = i * 2;
        created.views = i * 10;
        created.createdAt = new Date(
          base - i * 24 * 60 * 60 * 1000
        ).toISOString();
      }
    });

    // ------------------------------------------------------------
    // Pagination
    // ------------------------------------------------------------

    describe('Pagination', () => {
      it('uses page=1 and limit=10 by default', async () => {
        const res = await request(app).get('/api/posts');

        expect(res.status).toBe(200);
        expect(res.body.pagination.page).toBe(1);
        expect(res.body.pagination.limit).toBe(10);
        expect(res.body.data.length).toBeLessThanOrEqual(10);
      });

      it('supports a custom page and limit', async () => {
        const res = await request(app).get('/api/posts?page=2&limit=5');

        expect(res.status).toBe(200);
        expect(res.body.pagination.page).toBe(2);
        expect(res.body.pagination.limit).toBe(5);
        expect(res.body.data).toHaveLength(5);
      });

      it('caps the limit at 100', async () => {
        const res = await request(app).get('/api/posts?limit=1000');

        expect(res.status).toBe(200);
        expect(res.body.pagination.limit).toBe(100);
      });

      it('uses defaults for invalid page and limit values', async () => {
        const res = await request(app).get('/api/posts?page=abc&limit=xyz');

        expect(res.status).toBe(200);
        expect(res.body.pagination.page).toBe(1);
        expect(res.body.pagination.limit).toBe(10);
      });

      it('returns nextPage and prevPage metadata', async () => {
        const res = await request(app).get('/api/posts?page=2&limit=5');

        expect(res.status).toBe(200);
        expect(res.body.pagination.nextPage).toBe(3);
        expect(res.body.pagination.prevPage).toBe(1);
        expect(res.body.pagination.hasPrev).toBe(true);
        expect(res.body.pagination.hasNext).toBe(true);
      });

      it('returns an empty array for an out-of-range page', async () => {
        const res = await request(app).get('/api/posts?page=9999');

        expect(res.status).toBe(200);
        expect(res.body.data).toEqual([]);
        expect(res.body.pagination.hasNext).toBe(false);
      });
    });

    // ------------------------------------------------------------
    // Sorting
    // ------------------------------------------------------------

    describe('Sorting', () => {
      it('sorts by createdAt descending by default', async () => {
        const res = await request(app).get('/api/posts?limit=5');

        expect(res.status).toBe(200);

        const dates = res.body.data.map(
          (post) => new Date(post.createdAt).getTime()
        );

        for (let i = 1; i < dates.length; i++) {
          expect(dates[i]).toBeLessThanOrEqual(dates[i - 1]);
        }
      });

      it('sorts by likes ascending', async () => {
        const res = await request(app).get(
          '/api/posts?sort=likes&order=asc&limit=10'
        );

        expect(res.status).toBe(200);

        const likes = res.body.data.map((post) => post.likes);

        for (let i = 1; i < likes.length; i++) {
          expect(likes[i]).toBeGreaterThanOrEqual(likes[i - 1]);
        }
      });

      it('sorts by title ascending', async () => {
        const res = await request(app).get(
          '/api/posts?sort=title&order=asc'
        );

        expect(res.status).toBe(200);

        const titles = res.body.data.map((post) => post.title);

        expect(titles).toEqual([...titles].sort());
      });

      it('accepts multi-field sorting', async () => {
        const res = await request(app).get(
          '/api/posts?sort=categoryId,likes&order=asc,desc'
        );

        expect(res.status).toBe(200);
        expect(res.body.data.length).toBeGreaterThan(0);
      });

      it('ignores non-whitelisted sort fields', async () => {
        const res = await request(app).get(
          '/api/posts?sort=__proto__&order=asc'
        );

        expect(res.status).toBe(200);
      });
    });

    // ------------------------------------------------------------
    // Filtering
    // ------------------------------------------------------------

    describe('Filtering', () => {
      it('filters by authorId', async () => {
        const res = await request(app).get(
          `/api/posts?authorId=${reader.user.id}`
        );

        expect(res.status).toBe(200);

        expect(
          res.body.data.every(
            (post) => post.author.id === reader.user.id
          )
        ).toBe(true);
      });

      it('filters by category slug', async () => {
        const res = await request(app).get(
          '/api/posts?category=javascript'
        );

        expect(res.status).toBe(200);

        expect(
          res.body.data.every(
            (post) => post.category.slug === 'javascript'
          )
        ).toBe(true);
      });

      it('filters by categoryId', async () => {
        const res = await request(app).get(
          '/api/posts?categoryId=1'
        );

        expect(res.status).toBe(200);

        expect(
          res.body.data.every((post) => post.categoryId === 1)
        ).toBe(true);
      });

      it('filters by a single tag', async () => {
        const res = await request(app).get('/api/posts?tag=even');

        expect(res.status).toBe(200);

        expect(
          res.body.data.every((post) => post.tags.includes('even'))
        ).toBe(true);
      });

      it('filters by multiple tags using AND logic', async () => {
        const res = await request(app).get(
          '/api/posts?tags=even,test'
        );

        expect(res.status).toBe(200);

        expect(
          res.body.data.every(
            (post) =>
              post.tags.includes('even') &&
              post.tags.includes('test')
          )
        ).toBe(true);
      });

      it('returns only published posts to public users', async () => {
        const res = await request(app).get('/api/posts');

        expect(res.status).toBe(200);

        expect(
          res.body.data.every((post) => post.status === 'published')
        ).toBe(true);
      });

      it('filters by minLikes', async () => {
        const res = await request(app).get('/api/posts?minLikes=20');

        expect(res.status).toBe(200);

        expect(
          res.body.data.every((post) => post.likes >= 20)
        ).toBe(true);
      });

      it('filters by date range', async () => {
        const from = new Date(
          Date.now() - 10 * 24 * 60 * 60 * 1000
        ).toISOString();

        const to = new Date().toISOString();

        const res = await request(app).get(
          `/api/posts?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
        );

        expect(res.status).toBe(200);

        res.body.data.forEach((post) => {
          const created = new Date(post.createdAt).getTime();

          expect(created).toBeGreaterThanOrEqual(
            new Date(from).getTime()
          );

          expect(created).toBeLessThanOrEqual(
            new Date(to).getTime()
          );
        });
      });

      it('combines multiple filters', async () => {
        const res = await request(app).get(
          `/api/posts?authorId=${reader.user.id}&categoryId=1&minLikes=5`
        );

        expect(res.status).toBe(200);

        res.body.data.forEach((post) => {
          expect(post.author.id).toBe(reader.user.id);
          expect(post.categoryId).toBe(1);
          expect(post.likes).toBeGreaterThanOrEqual(5);
        });
      });
    });

    // ------------------------------------------------------------
    // Search
    // ------------------------------------------------------------

    describe('Search', () => {
      it('searches in title and body', async () => {
        const res = await request(app).get(
          '/api/posts?q=body for post'
        );

        expect(res.status).toBe(200);
        expect(res.body.data.length).toBeGreaterThan(0);
      });

      it('is case-insensitive', async () => {
        const lower = await request(app).get('/api/posts?q=test');
        const upper = await request(app).get('/api/posts?q=TEST');

        expect(lower.status).toBe(200);
        expect(upper.status).toBe(200);

        expect(lower.body.pagination.total).toBe(
          upper.body.pagination.total
        );
      });

      it('returns an empty result when nothing matches', async () => {
        const res = await request(app).get(
          '/api/posts?q=xyznonexistent'
        );

        expect(res.status).toBe(200);
        expect(res.body.data).toEqual([]);
        expect(res.body.pagination.total).toBe(0);
      });
    });

    // ------------------------------------------------------------
    // Field Selection
    // ------------------------------------------------------------

    describe('Field Selection', () => {
      it('returns only requested fields', async () => {
        const res = await request(app).get(
          '/api/posts?fields=id,title&limit=3'
        );

        expect(res.status).toBe(200);
        expect(res.body.data.length).toBeGreaterThan(0);

        res.body.data.forEach((post) => {
          expect(Object.keys(post).sort()).toEqual(['id', 'title']);
        });
      });

      it('ignores non-whitelisted fields', async () => {
        const res = await request(app).get(
          '/api/posts?fields=id,__proto__&limit=3'
        );

        expect(res.status).toBe(200);

        res.body.data.forEach((post) => {
          expect(Object.keys(post)).toEqual(['id']);
        });
      });
    });

    // ------------------------------------------------------------
    // Meta Endpoint
    // ------------------------------------------------------------

    describe('Meta endpoint', () => {
      it('returns query documentation', async () => {
        const res = await request(app).get('/api/posts/meta');

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('pagination');
        expect(res.body).toHaveProperty('sorting');
        expect(res.body).toHaveProperty('filtering');
        expect(res.body.examples).toBeInstanceOf(Array);
      });
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
      // Editor creates a fresh independent comment.
      const created = await editor.agent
        .post('/api/posts/1/comments')
        .send({
          body: 'Editor independent comment!',
        });

      expect(created.status).toBe(201);

      const editorCommentId = created.body.data.id;

      // Reader tries to delete Editor's comment.
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
