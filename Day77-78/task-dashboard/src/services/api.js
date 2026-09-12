// src/services/api.js - hybrid version

import { mockTasks } from '../data/db';

// Use this for production deployment
const USE_API = import.meta.env.VITE_USE_API === 'true';
const API_BASE = import.meta.env.VITE_API_URL || '';

export const api = {
  // Tasks
  getTasks: async () => {
    if (USE_API) {
      const res = await fetch(`${API_BASE}/tasks`);
      if (!res.ok) throw new Error('Failed to fetch tasks');
      return res.json();
    }
    return mockTasks;
  },
  // ... rest of the API service with fallback to mock data
};