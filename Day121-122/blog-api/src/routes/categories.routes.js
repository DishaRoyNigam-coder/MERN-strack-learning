// src/routes/categories.routes.js

import { Router } from 'express';
import {
  listCategories, getCategory, createCategory, updateCategory, deleteCategory,
} from '../controllers/categories.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { isAtLeast } from '../middleware/roles.js';
import { ROLES } from '../config/roles.js';

const router = Router();

router.get('/', listCategories);
router.get('/:id', getCategory);
router.post('/', requireAuth, isAtLeast(ROLES.EDITOR), createCategory);
router.patch('/:id', requireAuth, isAtLeast(ROLES.EDITOR), updateCategory);
router.delete('/:id', requireAuth, isAtLeast(ROLES.ADMIN), deleteCategory);

export default router;