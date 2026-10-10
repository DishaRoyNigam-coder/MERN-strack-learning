// src/config/upload.js

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '../..');

export const uploadConfig = {
  rootDir: path.join(ROOT, process.env.UPLOAD_DIR || 'uploads'),
  dirs: { avatars: 'avatars' },
  maxFileSize: Number(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024,
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
};