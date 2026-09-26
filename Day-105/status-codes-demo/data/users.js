// data/users.js

export const users = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', age: 28, role: 'admin', createdAt: '2026-01-15T10:00:00Z' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', age: 34, role: 'user', createdAt: '2026-03-22T14:30:00Z' },
  { id: 3, name: 'Carol Davis', email: 'carol@example.com', age: 26, role: 'user', createdAt: '2026-05-10T09:15:00Z' },
];

export let nextId = 4;

export function getNextId() {
  return nextId++;
}