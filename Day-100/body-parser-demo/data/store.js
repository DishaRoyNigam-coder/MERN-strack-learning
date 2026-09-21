// data/store.js

export const store = {
  users: [
    { id: 1, name: 'Alice Johnson', email: 'alice@example.com', age: 28, role: 'admin' },
    { id: 2, name: 'Bob Smith', email: 'bob@example.com', age: 34, role: 'user' },
  ],
  posts: [
    { id: 1, userId: 1, title: 'Getting Started with Express', body: 'Express is awesome...', tags: ['express', 'node'] },
    { id: 2, userId: 2, title: 'REST API Best Practices', body: 'Designing good APIs...', tags: ['rest', 'api'] },
  ],
  nextUserId: 3,
  nextPostId: 3,
};