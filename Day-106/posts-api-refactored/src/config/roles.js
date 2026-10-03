// src/config/roles.js

// ============================================================
// ROLE DEFINITIONS
// ============================================================

export const ROLES = {
  USER: 'user',
  EDITOR: 'editor',
  MODERATOR: 'moderator',
  ADMIN: 'admin',
};

// Role hierarchy: higher index = more privileges
export const ROLE_HIERARCHY = [
  ROLES.USER,
  ROLES.EDITOR,
  ROLES.MODERATOR,
  ROLES.ADMIN,
];

// ============================================================
// PERMISSIONS PER ROLE
// ============================================================

export const PERMISSIONS = {
  [ROLES.USER]: [
    'post:create',
    'post:read',
    'post:update:own',
    'post:delete:own',
    'post:like',
    'profile:read:own',
    'profile:update:own',
  ],
  [ROLES.EDITOR]: [
    // Inherits user permissions
    'post:create',
    'post:read',
    'post:update:own',
    'post:update:any',
    'post:delete:own',
    'post:delete:any',
    'post:publish',
    'post:like',
    'profile:read:own',
    'profile:update:own',
  ],
  [ROLES.MODERATOR]: [
    // Inherits editor permissions
    'post:create',
    'post:read',
    'post:update:own',
    'post:update:any',
    'post:delete:own',
    'post:delete:any',
    'post:publish',
    'post:like',
    'post:moderate',
    'user:ban',
    'user:warn',
    'profile:read:own',
    'profile:update:own',
    'profile:read:any',
  ],
  [ROLES.ADMIN]: [
    // Full access
    '*',
  ],
};

// ============================================================
// HELPERS
// ============================================================

/**
 * Check if a role has a permission
 */
export function roleHasPermission(role, permission) {
  const perms = PERMISSIONS[role] || [];
  if (perms.includes('*')) return true;
  return perms.includes(permission);
}

/**
 * Check if a role is at least as privileged as another
 */
export function roleIsAtLeast(role, minRole) {
  const roleIdx = ROLE_HIERARCHY.indexOf(role);
  const minIdx = ROLE_HIERARCHY.indexOf(minRole);
  return roleIdx >= minIdx;
}

/**
 * Check if a role is admin
 */
export function isAdminRole(role) {
  return role === ROLES.ADMIN;
}

/**
 * Check if a role is editor or above
 */
export function isEditorRole(role) {
  return roleIsAtLeast(role, ROLES.EDITOR);
}