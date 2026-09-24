// data/posts.js

export const posts = [
  {
    id: 1,
    title: 'Getting Started with Express',
    body: 'Express is a minimal and flexible Node.js web application framework...',
    author: 'Alice Johnson',
    tags: ['express', 'node', 'backend'],
    published: true,
    likes: 120,
    createdAt: '2026-09-01T10:00:00.000Z',
    updatedAt: '2026-09-01T10:00:00.000Z',
  },
  {
    id: 2,
    title: 'Mastering React Hooks',
    body: 'Hooks changed the way we write React components...',
    author: 'Bob Smith',
    tags: ['react', 'hooks', 'frontend'],
    published: true,
    likes: 340,
    createdAt: '2026-09-03T14:30:00.000Z',
    updatedAt: '2026-09-05T09:15:00.000Z',
  },
  {
    id: 3,
    title: 'REST API Best Practices',
    body: 'Designing a good REST API is a combination of art and science...',
    author: 'Alice Johnson',
    tags: ['rest', 'api', 'backend'],
    published: false,
    likes: 210,
    createdAt: '2026-09-05T08:45:00.000Z',
    updatedAt: '2026-09-05T08:45:00.000Z',
  },
  {
    id: 4,
    title: 'CSS Grid vs Flexbox',
    body: 'When should you use each layout system? Let us compare...',
    author: 'Carol Davis',
    tags: ['css', 'frontend', 'layout'],
    published: true,
    likes: 180,
    createdAt: '2026-09-07T11:20:00.000Z',
    updatedAt: '2026-09-07T11:20:00.000Z',
  },
  {
    id: 5,
    title: 'Understanding Async/Await',
    body: 'Async/await makes working with Promises cleaner and more readable...',
    author: 'Bob Smith',
    tags: ['javascript', 'async', 'promises'],
    published: false,
    likes: 95,
    createdAt: '2026-09-10T16:00:00.000Z',
    updatedAt: '2026-09-10T16:00:00.000Z',
  },
];

// Auto-increment ID counter
export let nextId = posts.length + 1;

// Helper to get next ID
export function getNextId() {
  return nextId++;
}