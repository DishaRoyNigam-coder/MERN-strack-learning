// src/config/roles.js

export const ROLES = {
  USER: 'user',
  EDITOR: 'editor',
  ADMIN: 'admin',
};

export const ROLE_HIERARCHY = [ROLES.USER, ROLES.EDITOR, ROLES.ADMIN];

export const PERMISSIONS = {
  [ROLES.USER]: [
    'post:create', 'post:read', 'post:update:own', 'post:delete:own',
    'comment:create', 'comment:read', 'comment:delete:own',
    'profile:read:own', 'profile:update:own',
  ],
  [ROLES.EDITOR]: [
    'post:create', 'post:read', 'post:update:any', 'post:delete:any', 'post:publish',
    'comment:create', 'comment:read', 'comment:delete:any', 'comment:moderate',
    'category:create', 'category:read', 'category:update',
    'profile:read:own', 'profile:update:own',
  ],
  [ROLES.ADMIN]: ['*'],
};

export function roleIsAtLeast(role, min) {
  return ROLE_HIERARCHY.indexOf(role) >= ROLE_HIERARCHY.indexOf(min);
}