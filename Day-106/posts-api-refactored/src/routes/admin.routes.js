// src/routes/admin.routes.js

import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  getStats,
} from '../controllers/admin.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { isAdmin } from '../middleware/roles.js';

const router = Router();

// ============================================================
// ALL admin routes require authentication AND admin role
// ============================================================

router.use(requireAuth);
router.use(isAdmin);

// --- Users management ---
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.patch('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

// --- Dashboard ---
router.get('/stats', getStats);

export default router;