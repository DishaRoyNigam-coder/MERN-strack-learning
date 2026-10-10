// src/config/roles.js

export const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
};

export const ROLE_HIERARCHY = [ROLES.USER, ROLES.ADMIN];

export const PERMISSIONS = {
  [ROLES.USER]: [
    'profile:read:own',
    'profile:update:own',
  ],
  [ROLES.ADMIN]: ['*'],
};

export function roleHasPermission(role, permission) {
  const perms = PERMISSIONS[role] || [];
  return perms.includes('*') || perms.includes(permission);
}

export function roleIsAtLeast(role, min) {
  return ROLE_HIERARCHY.indexOf(role) >= ROLE_HIERARCHY.indexOf(min);
}