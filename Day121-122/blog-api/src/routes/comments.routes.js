// src/routes/comments.routes.js

import { Router } from 'express';
import {
  updateComment, deleteComment, moderateComment,
} from '../controllers/comments.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { isAtLeast } from '../middleware/roles.js';
import { ROLES } from '../config/roles.js';

const router = Router();

router.patch('/:id', requireAuth, updateComment);
router.delete('/:id', requireAuth, deleteComment);
router.patch('/:id/moderate', requireAuth, isAtLeast(ROLES.EDITOR), moderateComment);

export default router;