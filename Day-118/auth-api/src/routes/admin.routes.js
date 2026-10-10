// src/routes/admin.routes.js

import { Router } from 'express';
import { listUsers, updateRole, deleteUser } from '../controllers/admin.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { isAdmin } from '../middleware/roles.js';

const router = Router();

router.use(requireAuth, isAdmin);
router.get('/users', listUsers);
router.patch('/users/:id/role', updateRole);
router.delete('/users/:id', deleteUser);

export default router;