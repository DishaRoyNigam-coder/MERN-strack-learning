// src/routes/users.routes.js

import { Router } from 'express';
import {
  listUsers, getUser, deleteUser,
} from '../controllers/users.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { isAdmin } from '../middleware/roles.js';

const router = Router();

router.get('/', requireAuth, isAdmin, listUsers);
router.get('/:id', getUser);
router.delete('/:id', requireAuth, isAdmin, deleteUser);

export default router;