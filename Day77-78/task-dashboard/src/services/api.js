// src/services/api.js

const API_BASE = 'http://localhost:5000';

export const api = {
  // Tasks
  getTasks: async () => {
    const res = await fetch(`${API_BASE}/tasks`);
    if (!res.ok) throw new Error('Failed to fetch tasks');
    return res.json();
  },

  getTask: async (id) => {
    const res = await fetch(`${API_BASE}/tasks/${id}`);
    if (!res.ok) throw new Error('Failed to fetch task');
    return res.json();
  },

  createTask: async (task) => {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    });
    if (!res.ok) throw new Error('Failed to create task');
    return res.json();
  },

  updateTask: async (id, updates) => {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update task');
    return res.json();
  },

  deleteTask: async (id) => {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete task');
    return true;
  },

  // Users
  getUsers: async () => {
    const res = await fetch(`${API_BASE}/users`);
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  },

  // Teams
  getTeams: async () => {
    const res = await fetch(`${API_BASE}/teams`);
    if (!res.ok) throw new Error('Failed to fetch teams');
    return res.json();
  },

  // Activities
  getActivities: async () => {
    const res = await fetch(`${API_BASE}/activities`);
    if (!res.ok) throw new Error('Failed to fetch activities');
    return res.json();
  },
};