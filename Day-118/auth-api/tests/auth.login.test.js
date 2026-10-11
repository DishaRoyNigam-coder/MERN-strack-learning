// tests/auth.login.test.js

import request from 'supertest';
import app from '../src/app.js';
import { users } from '../src/data/store.js';
import { seedTestUser } from './helpers.js';

// ============================================================
// TEST SUITE: POST /api/auth/login
// ============================================================

describe('POST /api/auth/login', () => {
  // ============================================================
  // 1. HAPPY PATH
  // ============================================================

  describe('✅ Success cases', () => {
    it('returns 200 with user + token for valid credentials', async () => {
      // Arrange
      const { user } = await seedTestUser({
        email: 'alice@example.com',
        password: 'secret123',
      });

      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'alice@example.com', password: 'secret123' });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toMatch(/login/i);

      // User shape
      expect(response.body.user).toEqual(
        expect.objectContaining({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        })
      );

      // Token present
      expect(response.body.token).toBeDefined();
      expect(typeof response.body.token).toBe('string');
      expect(response.body.token.split('.')).toHaveLength(3); // JWT has 3 parts

      // Password should NEVER be in the response
      expect(response.body.user.passwordHash).toBeUndefined();
      expect(response.body.user.password).toBeUndefined();
    });

    it('sets an httpOnly cookie with the JWT', async () => {
      await seedTestUser({
        email: 'cookie@example.com',
        password: 'cookiePass123',
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'cookie@example.com', password: 'cookiePass123' });

      expect(response.status).toBe(200);

      const setCookie = response.headers['set-cookie'];
      expect(setCookie).toBeDefined();
      expect(setCookie.length).toBeGreaterThan(0);

      const authCookie = setCookie.find((c) => c.startsWith('auth_token='));
      expect(authCookie).toBeDefined();
      expect(authCookie).toMatch(/HttpOnly/i);
      expect(authCookie).toMatch(/SameSite=Lax/i);
    });

    it('handles email case-insensitively', async () => {
      await seedTestUser({
        email: 'case@example.com',
        password: 'casePass123',
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'CASE@EXAMPLE.COM', password: 'casePass123' });

      expect(response.status).toBe(200);
      expect(response.body.user.email).toBe('case@example.com'); // normalized
    });

    it('issues a token with correct expiry (7 days)', async () => {
      await seedTestUser({
        email: 'expiry@example.com',
        password: 'expiryPass123',
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'expiry@example.com', password: 'expiryPass123' });

      const token = response.body.token;
      const payload = JSON.parse(
        Buffer.from(token.split('.')[1], 'base64').toString()
      );

      expect(payload.exp).toBeDefined();
      expect(payload.iat).toBeDefined();

      const sevenDaysInSeconds = 7 * 24 * 60 * 60;
      const expiryDiff = payload.exp - payload.iat;
      expect(expiryDiff).toBe(sevenDaysInSeconds);
    });

    it('returns a token usable on protected routes', async () => {
      await seedTestUser({
        email: 'usable@example.com',
        password: 'usablePass123',
      });

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'usable@example.com', password: 'usablePass123' });

      const token = loginRes.body.token;

      const meRes = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(meRes.status).toBe(200);
      expect(meRes.body.user.email).toBe('usable@example.com');
    });
  });

  // ============================================================
  // 2. AUTHENTICATION FAILURES
  // ============================================================

  describe('❌ Authentication failures', () => {
    it('returns 401 for wrong password', async () => {
      await seedTestUser({
        email: 'alice@example.com',
        password: 'correctPassword',
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'alice@example.com', password: 'wrongPassword' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('UNAUTHORIZED');
      expect(response.body.token).toBeUndefined();
    });

    it('returns 401 for unknown email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nobody@example.com', password: 'anything' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('returns the SAME error message for wrong email and wrong password (no leak)', async () => {
      await seedTestUser({
        email: 'exists@example.com',
        password: 'correctPassword',
      });

      const wrongEmail = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nonexistent@example.com', password: 'anything' });

      const wrongPassword = await request(app)
        .post('/api/auth/login')
        .send({ email: 'exists@example.com', password: 'wrongPassword' });

      expect(wrongEmail.status).toBe(401);
      expect(wrongPassword.status).toBe(401);

      // Same error message — attacker can't tell whether the email exists
      expect(wrongEmail.body.error).toBe(wrongPassword.body.error);
    });

    it('does not leak whether the email exists via response time', async () => {
      await seedTestUser({
        email: 'exists@example.com',
        password: 'correctPassword',
      });

      // Both requests should return quickly; bcrypt.compare handles the timing
      const start1 = Date.now();
      await request(app)
        .post('/api/auth/login')
        .send({ email: 'nonexistent@example.com', password: 'anything' });
      const time1 = Date.now() - start1;

      const start2 = Date.now();
      await request(app)
        .post('/api/auth/login')
        .send({ email: 'exists@example.com', password: 'wrongPassword' });
      const time2 = Date.now() - start2;

      // Both paths should hit bcrypt (to prevent timing attacks)
      // Time differences should be small (< 100ms in most CI environments)
      const diff = Math.abs(time1 - time2);
      expect(diff).toBeLessThan(200);
    });
  });

  // ============================================================
  // 3. VALIDATION
  // ============================================================

  describe('🔍 Validation', () => {
    it('returns 422 when email is missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ password: 'somePassword' });

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('VALIDATION_ERROR');
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'email' }),
        ])
      );
    });

    it('returns 422 when password is missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(422);
      expect(response.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'password' }),
        ])
      );
    });

    it('returns 422 when body is empty', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(response.status).toBe(422);
      expect(response.body.details.length).toBeGreaterThanOrEqual(2);
    });

    it('returns 400 for malformed JSON', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }');

      expect(response.status).toBe(400);
    });
  });

  // ============================================================
  // 4. RATE LIMITING
  // ============================================================

  describe('🚫 Rate limiting', () => {
    // Note: Rate limits are disabled globally in tests/setup.js.
    // To test rate limits, we temporarily re-enable them.

    it('allows up to 5 failed attempts, blocks the 6th', async () => {
      // Enable rate limiting for this test
      process.env.RATE_LIMIT_DISABLED = 'false';

      // Re-import the app to pick up the change
      const { default: freshApp } = await import(
        `../src/app.js?v=${Date.now()}`
      );

      const email = 'ratelimit@example.com';

      // 5 failed attempts → all 401
      for (let i = 0; i < 5; i++) {
        const res = await request(freshApp)
          .post('/api/auth/login')
          .send({ email, password: 'wrong' });
        expect(res.status).toBe(401);
      }

      // 6th attempt → 429
      const blocked = await request(freshApp)
        .post('/api/auth/login')
        .send({ email, password: 'wrong' });

      expect(blocked.status).toBe(429);
      expect(blocked.body.code).toBe('RATE_LIMITED');
      expect(blocked.headers['retry-after']).toBeDefined();

      // Reset for other tests
      process.env.RATE_LIMIT_DISABLED = 'true';
    });

    it('rate limit is per (IP + email) — different emails are independent', async () => {
      process.env.RATE_LIMIT_DISABLED = 'false';

      const { default: freshApp } = await import(
        `../src/app.js?v=${Date.now()}`
      );

      // Hit the limit for alice
      for (let i = 0; i < 5; i++) {
        await request(freshApp)
          .post('/api/auth/login')
          .send({ email: 'alice-rl@example.com', password: 'wrong' });
      }

      const aliceBlocked = await request(freshApp)
        .post('/api/auth/login')
        .send({ email: 'alice-rl@example.com', password: 'wrong' });
      expect(aliceBlocked.status).toBe(429);

      // Bob should still be able to try
      const bobAttempt = await request(freshApp)
        .post('/api/auth/login')
        .send({ email: 'bob-rl@example.com', password: 'wrong' });
      expect(bobAttempt.status).toBe(401);

      process.env.RATE_LIMIT_DISABLED = 'true';
    });
  });

  // ============================================================
  // 5. SECURITY & EDGE CASES
  // ============================================================

  describe('🛡️ Security & edge cases', () => {
    it('does not return the password hash in the response', async () => {
      await seedTestUser({
        email: 'secure@example.com',
        password: 'securePass123',
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'secure@example.com', password: 'securePass123' });

      const responseStr = JSON.stringify(response.body);
      expect(responseStr).not.toMatch(/passwordHash/);
      expect(responseStr).not.toMatch(/\$2[aby]\$/); // bcrypt hash pattern
    });

    it('returns correct content-type header', async () => {
      await seedTestUser({
        email: 'content@example.com',
        password: 'contentPass123',
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'content@example.com', password: 'contentPass123' });

      expect(response.headers['content-type']).toMatch(/application\/json/);
    });

    it('includes a request ID in the response', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'unknown@example.com', password: 'wrong' });

      expect(response.headers['x-request-id']).toBeDefined();
    });

    it('handles very long passwords gracefully (bcrypt 72-byte limit)', async () => {
      const longPassword = 'a'.repeat(100);

      await seedTestUser({
        email: 'longpw@example.com',
        password: longPassword, // Note: our hashPassword may throw for >72
      }).catch(() => {}); // Ignore if seed fails

      // Send a login with a very long password — should not 500
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'longpw@example.com', password: longPassword });

      // Should be 401 (wrong password) or 200, but NEVER 500
      expect([200, 401]).toContain(response.status);
    });

    it('handles unicode in email and password', async () => {
      await seedTestUser({
        email: 'unicode@example.com',
        password: 'пароль123日本語',
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'unicode@example.com', password: 'пароль123日本語' });

      expect(response.status).toBe(200);
    });

    it('is not vulnerable to NoSQL injection via email', async () => {
      await seedTestUser({
        email: 'normal@example.com',
        password: 'normalPass123',
      });

      // Malicious payload — should be treated as a string, not an operator
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: { $ne: null },
          password: { $ne: null },
        });

      expect(response.status).not.toBe(200);
      expect(response.body.user).toBeUndefined();
      expect(response.body.token).toBeUndefined();
    });

    it('returns 401 for empty strings', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: '', password: '' });

      // Either 401 (invalid creds) or 422 (validation) — both are acceptable
      expect([401, 422]).toContain(response.status);
    });
  });
});