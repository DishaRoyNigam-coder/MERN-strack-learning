// src/data/db.js

export const mockUsers = [
  { id: 1, name: 'Admin User', email: 'admin@example.com', password: 'admin123', role: 'admin', avatar: '👤' },
  { id: 2, name: 'John Doe', email: 'john@example.com', password: 'john123', role: 'member', avatar: '👨' },
];

export const mockTasks = [
  {
    id: 1,
    title: 'Design Dashboard Layout',
    description: 'Create wireframes and mockups for the dashboard',
    status: 'completed',
    priority: 'high',
    assignedTo: 1,
    createdBy: 1,
    createdAt: '2026-09-01T10:00:00Z',
    dueDate: '2026-09-05T17:00:00Z',
  },
  // ... more tasks
];

export const mockTeams = [
  { id: 1, name: 'Frontend Team', members: [1, 2] },
];

export const mockActivities = [
  { id: 1, action: 'Task Created', details: 'Design Dashboard Layout', userId: 1, createdAt: '2026-09-01T10:00:00Z' },
];