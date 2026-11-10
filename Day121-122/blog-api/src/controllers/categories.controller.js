// src/controllers/categories.controller.js

import { categoriesService } from '../services/categories.service.js';

export function listCategories(req, res, next) {
  try {
    res.json({ success: true, data: categoriesService.list() });
  } catch (err) { next(err); }
}

export function getCategory(req, res, next) {
  try {
    const id = Number(req.params.id);
    const data = isNaN(id)
      ? categoriesService.getBySlug(req.params.id)
      : categoriesService.getById(id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

export function createCategory(req, res, next) {
  try {
    const cat = categoriesService.create(req.body);
    res.status(201).location(`/api/categories/${cat.id}`).json({
      success: true, message: 'Category created', data: cat,
    });
  } catch (err) { next(err); }
}

export function updateCategory(req, res, next) {
  try {
    const cat = categoriesService.update(Number(req.params.id), req.body);
    res.json({ success: true, message: 'Category updated', data: cat });
  } catch (err) { next(err); }
}

export function deleteCategory(req, res, next) {
  try {
    const removed = categoriesService.remove(Number(req.params.id));
    res.json({ success: true, message: 'Category deleted', data: removed });
  } catch (err) { next(err); }
}