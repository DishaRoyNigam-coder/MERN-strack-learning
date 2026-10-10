// src/routes/index.js

import { Router } from 'express';
import authRouter from './auth.routes.js';
import adminRouter from './admin.routes.js';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🔐 Auth API',
    version: '1.0.0',
    endpoints: {
      auth: {
        'POST /api/auth/register': 'Create account',
        'POST /api/auth/login': 'Login',
        'POST /api/auth/logout': 'Logout',
        'GET /api/auth/me': 'Get profile (auth)',
        'PATCH /api/auth/me': 'Update profile (auth)',
        'PATCH /api/auth/me/password': 'Change password (auth)',
        'POST /api/auth/me/avatar': 'Upload avatar (auth, multipart)',
        'POST /api/auth/forgot-password': 'Request reset link',
        'POST /api/auth/reset-password': 'Reset with token',
      },
      admin: {
        'GET /api/admin/users': 'List users (admin)',
        'PATCH /api/admin/users/:id/role': 'Change role (admin)',
        'DELETE /api/admin/users/:id': 'Delete user (admin)',
      },
    },
  });
});

router.use('/auth', authRouter);
router.use('/admin', adminRouter);

export default router;