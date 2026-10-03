// src/controllers/admin.controller.js

import { users } from '../data/store.js';
import { posts } from '../data/store.js';
import { NotFoundError, BadRequestError } from '../errors/AppError.js';
import { ROLES, ROLE_HIERARCHY } from '../config/roles.js';

// ============================================================
// GET /api/admin/users — List all users (admin only)
// ============================================================

export function getAllUsers(req, res, next) {
  try {
    // Return safe user data (no passwordHash)
    const safeUsers = users.map(({ passwordHash, ...u }) => u);

    res.status(200).json({
      success: true,
      count: safeUsers.length,
      data: safeUsers,
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================
// GET /api/admin/users/:id — Get user by ID (admin only)
// ============================================================

export function getUserById(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      throw new BadRequestError('Invalid user ID');
    }

    const user = users.find(u => u.id === id);
    if (!user) {
      throw new NotFoundError('User', { id });
    }

    const { passwordHash, ...safeUser } = user;

    // Include user's post count
    const postCount = posts.filter(p => p.authorId === user.id).length;

    res.status(200).json({
      success: true,
      data: {
        ...safeUser,
        postCount,
      },
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================
// PATCH /api/admin/users/:id/role — Promote/demote a user (admin only)
// ============================================================

export async function updateUserRole(req, res, next) {
  try {
    const id = Number(req.params.id);
    const { role } = req.body;

    if (!Number.isInteger(id) || id < 1) {
      throw new BadRequestError('Invalid user ID');
    }

    if (!role || !ROLE_HIERARCHY.includes(role)) {
      throw new BadRequestError('Invalid role', {
        validRoles: ROLE_HIERARCHY,
      });
    }

    const user = users.find(u => u.id === id);
    if (!user) {
      throw new NotFoundError('User', { id });
    }

    // Prevent admin from demoting themselves
    if (user.id === req.user.id && role !== ROLES.ADMIN) {
      throw new BadRequestError('You cannot demote yourself');
    }

    const oldRole = user.role;
    user.role = role;

    const { passwordHash, ...safeUser } = user;

    res.status(200).json({
      success: true,
      message: `User role changed from "${oldRole}" to "${role}"`,
      data: safeUser,
      changedBy: {
        id: req.user.id,
        name: req.user.name,
      },
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================
// DELETE /api/admin/users/:id — Delete a user (admin only)
// ============================================================

export function deleteUser(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      throw new BadRequestError('Invalid user ID');
    }

    // Prevent admin from deleting themselves
    if (id === req.user.id) {
      throw new BadRequestError('You cannot delete your own account');
    }

    const index = users.findIndex(u => u.id === id);
    if (index === -1) {
      throw new NotFoundError('User', { id });
    }

    const [deleted] = users.splice(index, 1);

    // Also delete all their posts
    let deletedPosts = 0;
    for (let i = posts.length - 1; i >= 0; i--) {
      if (posts[i].authorId === id) {
        posts.splice(i, 1);
        deletedPosts++;
      }
    }

    const { passwordHash, ...safeUser } = deleted;

    res.status(200).json({
      success: true,
      message: `User deleted along with ${deletedPosts} posts`,
      data: safeUser,
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================
// GET /api/admin/stats — Dashboard stats (admin only)
// ============================================================

export function getStats(req, res, next) {
  try {
    const totalUsers = users.length;
    const totalPosts = posts.length;
    const publishedPosts = posts.filter(p => p.published).length;
    const draftPosts = totalPosts - publishedPosts;
    const totalLikes = posts.reduce((sum, p) => sum + p.likes, 0);

    const usersByRole = users.reduce((acc, u) => {
      acc[u.role] = (acc[u.role] || 0) + 1;
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          byRole: usersByRole,
        },
        posts: {
          total: totalPosts,
          published: publishedPosts,
          drafts: draftPosts,
          totalLikes,
          avgLikes: totalPosts > 0 ? (totalLikes / totalPosts).toFixed(2) : 0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}