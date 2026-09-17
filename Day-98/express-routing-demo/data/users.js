// data/users.js

export const users = [
  {
    id: 1,
    name: 'Alice Johnson',
    email: 'alice@example.com',
    role: 'admin',
    age: 28,
    country: 'USA',
    posts: [1, 3],
    joinedAt: '2024-01-15',
  },
  {
    id: 2,
    name: 'Bob Smith',
    email: 'bob@example.com',
    role: 'user',
    age: 34,
    country: 'Canada',
    posts: [2],
    joinedAt: '2024-03-22',
  },
  {
    id: 3,
    name: 'Carol Davis',
    email: 'carol@example.com',
    role: 'user',
    age: 26,
    country: 'UK',
    posts: [4, 5],
    joinedAt: '2024-05-10',
  },
  {
    id: 4,
    name: 'David Wilson',
    email: 'david@example.com',
    role: 'moderator',
    age: 31,
    country: 'Australia',
    posts: [],
    joinedAt: '2024-07-01',
  },
  {
    id: 5,
    name: 'Eve Brown',
    email: 'eve@example.com',
    role: 'user',
    age: 29,
    country: 'Germany',
    posts: [6],
    joinedAt: '2024-08-14',
  },
];

export const posts = [
  { id: 1, userId: 1, title: 'Getting Started with Express', body: 'Express is a minimal Node.js framework...', likes: 120, tags: ['express', 'node', 'backend'] },
  { id: 2, userId: 2, title: 'Mastering React Hooks', body: 'Hooks changed the way we write React...', likes: 340, tags: ['react', 'hooks', 'frontend'] },
  { id: 3, userId: 1, title: 'REST API Best Practices', body: 'Designing a good REST API is an art...', likes: 210, tags: ['rest', 'api', 'backend'] },
  { id: 4, userId: 3, title: 'CSS Grid vs Flexbox', body: 'When should you use each?', likes: 180, tags: ['css', 'frontend', 'layout'] },
  { id: 5, userId: 3, title: 'Understanding Async/Await', body: 'Async/await makes promises cleaner...', likes: 95, tags: ['javascript', 'async'] },
  { id: 6, userId: 5, title: 'MongoDB Aggregations', body: 'The aggregation pipeline is powerful...', likes: 150, tags: ['mongodb', 'database'] },
];