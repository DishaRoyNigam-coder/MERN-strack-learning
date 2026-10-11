// tests/auth.e2e.test.js

import request from 'supertest';
import app from '../src/app.js';
import { seedTestUser } from './helpers.js';

describe('Full Auth Flow (Integration)', () => {
  it('register → login → me → logout → me', async () => {
    const email = `flow-${Date.now()}@example.com`;
    const password = 'flowPassword123';

    // 1. Register
    const agent = request.agent(app);
    const registerRes = await agent
      .post('/api/auth/register')
      .send({ name: 'Flow User', email, password });

    expect(registerRes.status).toBe(201);
    expect(registerRes.body.user.email).toBe(email);

    // 2. Get profile (already authenticated via register cookie)
    const meRes = await agent.get('/api/auth/me');
    expect(meRes.status).toBe(200);
    expect(meRes.body.user.email).toBe(email);

    // 3. Logout
    const logoutRes = await agent.post('/api/auth/logout');
    expect(logoutRes.status).toBe(200);

    // 4. Try to access profile — should fail
    const afterLogout = await agent.get('/api/auth/me');
    expect(afterLogout.status).toBe(401);

    // 5. Login again with same credentials
    const loginRes = await agent
      .post('/api/auth/login')
      .send({ email, password });
    expect(loginRes.status).toBe(200);

    // 6. Access profile again
    const finalMe = await agent.get('/api/auth/me');
    expect(finalMe.status).toBe(200);
  });

  it('Bearer token flow (for API clients)', async () => {
    const { email, password } = await seedTestUser();

    // 1. Login without an agent — get the token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email, password });

    const token = loginRes.body.token;
    expect(token).toBeDefined();

    // 2. Use the token on a protected route
    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.user.email).toBe(email);
  });

  it('admin can list users, regular user cannot', async () => {
    const { email: adminEmail, password: adminPassword } = await seedTestUser({
      email: 'admin-flow@example.com',
      password: 'adminFlow123',
      role: 'admin',
    });
    const { email: userEmail, password: userPassword } = await seedTestUser({
      email: 'user-flow@example.com',
      password: 'userFlow123',
      role: 'user',
    });

    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: adminEmail, password: adminPassword });
    const userLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: userEmail, password: userPassword });

    const adminRes = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${adminLogin.body.token}`);
    expect(adminRes.status).toBe(200);
    expect(adminRes.body.data.length).toBeGreaterThanOrEqual(2);

    const userRes = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${userLogin.body.token}`);
    expect(userRes.status).toBe(403);
  });
});