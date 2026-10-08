// src/middleware/upload.js

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { uploadConfig } from '../config/upload.js';
import { ValidationError } from '../errors/AppError.js';

// ============================================================
// ENSURE DIRECTORIES EXIST
// ============================================================

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

ensureDir(uploadConfig.rootDir);
Object.values(uploadConfig.dirs).forEach(sub =>
  ensureDir(path.join(uploadConfig.rootDir, sub))
);

// ============================================================
// HELPER: Generate a secure, unique filename
// ============================================================

function generateFilename(originalName) {
  const ext = path.extname(originalName).toLowerCase();

  // Generate a cryptographically secure random string
  const random = crypto.randomBytes(16).toString('hex');

  // Timestamp for chronological sorting
  const timestamp = Date.now();

  // Format: <timestamp>-<random>.<ext>
  return `${timestamp}-${random}${ext}`;
}

// ============================================================
// HELPER: Validate the file
// ============================================================

function validateFile(file) {
  // 1. Check MIME type
  if (!uploadConfig.allowedMimeTypes.includes(file.mimetype)) {
    throw new ValidationError('Invalid file type', {
      field: file.fieldname,
      received: file.mimetype,
      allowed: uploadConfig.allowedMimeTypes,
    });
  }

  // 2. Check extension (defense in depth)
  const ext = path.extname(file.originalname).toLowerCase();
  if (!uploadConfig.allowedExtensions.includes(ext)) {
    throw new ValidationError('Invalid file extension', {
      field: file.fieldname,
      received: ext,
      allowed: uploadConfig.allowedExtensions,
    });
  }

  // 3. Reject filenames with path traversal attempts
  if (file.originalname.includes('..') || file.originalname.includes('/')) {
    throw new ValidationError('Invalid filename');
  }
}

// ============================================================
// STORAGE ENGINE: diskStorage
// ============================================================

const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine the sub-directory based on field name
    const subDir = file.fieldname === 'avatar'
      ? uploadConfig.dirs.avatars
      : uploadConfig.dirs.posts;

    const dest = path.join(uploadConfig.rootDir, subDir);
    ensureDir(dest);
    cb(null, dest);
  },

  filename: (req, file, cb) => {
    const filename = generateFilename(file.originalname);
    cb(null, filename);
  },
});

// ============================================================
// MEMORY STORAGE (for processing with sharp before saving)
// ============================================================

const memoryStorage = multer.memoryStorage();

// ============================================================
// FILE FILTER
// ============================================================

function fileFilter(req, file, cb) {
  try {
    validateFile(file);
    cb(null, true);
  } catch (error) {
    cb(error, false);
  }
}

// ============================================================
// EXPORTED MULTER INSTANCES
// ============================================================

/**
 * For avatar uploads — store on disk
 * Usage: uploadAvatar.single('avatar')
 */
export const uploadAvatar = multer({
  storage: diskStorage,
  limits: {
    fileSize: uploadConfig.maxFileSize,
    files: 1,
  },
  fileFilter,
});

/**
 * For processing in memory (e.g., resizing with sharp)
 * Usage: uploadInMemory.single('avatar')
 */
export const uploadInMemory = multer({
  storage: memoryStorage,
  limits: {
    fileSize: uploadConfig.maxFileSize,
    files: 1,
  },
  fileFilter,
});

/**
 * Multiple files (for a post gallery)
 * Usage: uploadPostImages.array('images', 5)
 */
export const uploadPostImages = multer({
  storage: diskStorage,
  limits: {
    fileSize: uploadConfig.maxFileSize,
    files: 5,
  },
  fileFilter,
});

// ============================================================
// CLEANUP HELPER: Delete a file
// ============================================================

export function deleteFile(relativePath) {
  try {
    const fullPath = path.join(uploadConfig.rootDir, '..', relativePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      return true;
    }
  } catch (error) {
    console.error('Failed to delete file:', error);
  }
  return false;
}