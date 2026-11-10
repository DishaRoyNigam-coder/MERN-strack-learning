// src/middleware/upload.js

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { uploadConfig } from '../config/upload.js';
import { ValidationError } from '../errors/AppError.js';

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

ensureDir(uploadConfig.rootDir);
Object.values(uploadConfig.dirs).forEach(d =>
  ensureDir(path.join(uploadConfig.rootDir, d))
);

function generateFilename(originalName) {
  const ext = path.extname(originalName).toLowerCase();
  return `${Date.now()}-${crypto.randomBytes(16).toString('hex')}${ext}`;
}

function validateFile(file) {
  if (!uploadConfig.allowedMimeTypes.includes(file.mimetype)) {
    throw new ValidationError('Invalid file type', { received: file.mimetype });
  }
  const ext = path.extname(file.originalname).toLowerCase();
  if (!uploadConfig.allowedExtensions.includes(ext)) {
    throw new ValidationError('Invalid extension', { received: ext });
  }
  if (file.originalname.includes('..') || file.originalname.includes('/')) {
    throw new ValidationError('Invalid filename');
  }
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = path.join(uploadConfig.rootDir, uploadConfig.dirs.avatars);
    ensureDir(dest);
    cb(null, dest);
  },
  filename: (req, file, cb) => cb(null, generateFilename(file.originalname)),
});

const fileFilter = (req, file, cb) => {
  try { validateFile(file); cb(null, true); }
  catch (err) { cb(err, false); }
};

export const uploadAvatar = multer({
  storage,
  limits: { fileSize: uploadConfig.maxFileSize, files: 1 },
  fileFilter,
});