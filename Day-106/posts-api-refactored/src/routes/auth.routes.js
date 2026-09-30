// src/routes/auth.routes.js

import { Router } from 'express';
import { login, register, getMe } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Public routes
router.post('/login', login);
router.post('/register', register);

// Protected route
router.get('/me', requireAuth, getMe);

export default router;