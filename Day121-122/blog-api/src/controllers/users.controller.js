// src/controllers/users.controller.js

import { usersService } from '../services/users.service.js';

export function listUsers(req, res, next) {
  try { res.json({ success: true, count: 0, data: usersService.list(req.query) }); }
  catch (err) { next(err); }
}

export function getUser(req, res, next) {
  try { res.json({ success: true, data: usersService.getById(req.params.id) }); }
  catch (err) { next(err); }
}

export function getMyProfile(req, res, next) {
  try { res.json({ success: true, user: usersService.getProfile(req.userId) }); }
  catch (err) { next(err); }
}

export function updateMyProfile(req, res, next) {
  try {
    const user = usersService.updateProfile(req.userId, req.body);
    res.json({ success: true, message: 'Profile updated', user });
  } catch (err) { next(err); }
}

export function deleteUser(req, res, next) {
  try {
    const removed = usersService.remove(req.params.id, req.userId);
    res.json({ success: true, message: 'User deleted', data: removed });
  } catch (err) { next(err); }
}