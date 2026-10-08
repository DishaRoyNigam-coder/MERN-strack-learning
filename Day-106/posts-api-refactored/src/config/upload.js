// src/config/upload.js

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Root directory of the project
const ROOT = path.join(__dirname, '../..');

export const uploadConfig = {
  // Root uploads directory
  rootDir: path.join(ROOT, process.env.UPLOAD_DIR || 'uploads'),

  // Sub-directories per resource type
  dirs: {
    avatars: 'avatars',
    posts: 'posts',
  },

  // Max file size in bytes (default 5MB)
  maxFileSize: Number(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024,

  // Allowed MIME types
  allowedMimeTypes: (
    process.env.ALLOWED_IMAGE_TYPES ||
    'image/jpeg,image/png,image/webp,image/gif'
  ).split(',').map(t => t.trim()),

  // Allowed file extensions
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],

  // Image processing (sharp)
  image: {
    avatarSize: 400,       // 400x400 px
    quality: 85,           // JPEG/WebP quality
  },
};