// tests/helpers.js

import request from 'supertest';
import app from '../src/app.js';
import { users } from '../src/data/store.js';

/**
 * Create a user via the register endpoint.
 * Returns { user, token, cookie, agent }.
 */
export async function registerTestUser({
  name = 'Test User',
  email = `test-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`,
  password = 'testPassword123',
} = {}) {
  const agent = request.agent(app);

  const response = await agent
    .post('/api/auth/register')
    .send({ name, email, password });

  return {
    agent,
    response,
    user: response.body.user,
    token: response.body.token,
    email,
    password,
  };
}

/**
 * Seed a user directly into the in-memory store (faster than /register).
 */
export async function seedTestUser({
  name = 'Seeded User',
  email = `seeded-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`,
  password = 'seededPassword123',
  role = 'user',
} = {}) {
  const { hashPassword } = await import('../src/utils/password.js');
  const passwordHash = await hashPassword(password);

  const user = {
    id: users.length + 1,
    name,
    email: email.toLowerCase(),
    passwordHash,
    role,
    avatar: null,
    emailVerified: false,
    createdAt: new Date().toISOString(),
  };
  users.push(user);

  const { passwordHash: _, ...safeUser } = user;
  return { user: safeUser, email, password };
}

/**
 * Reset the in-memory store between tests.
 */
export function resetStore() {
  users.length = 0;
}

/**
 * Login a user and return the response + agent.
 */
export async function loginTestUser(email, password, agent = null) {
  const testAgent = agent || request.agent(app);

  const response = await testAgent
    .post('/api/auth/login')
    .send({ email, password });

  return { agent: testAgent, response };
}

/**
 * Extract cookie from a Supertest response.
 */
export function getCookie(response, name) {
  const cookies = response.headers['set-cookie'] || [];
  const found = cookies.find((c) => c.startsWith(`${name}=`));
  return found || null;
}

export { app };