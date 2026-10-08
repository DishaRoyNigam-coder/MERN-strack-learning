// src/services/image.service.js

import sharp from 'sharp';
import path from 'path';
import crypto from 'crypto';
import { uploadConfig } from '../config/upload.js';

/**
 * Process and save an avatar from a buffer.
 * Resizes to a square, converts to WebP.
 */
export async function processAvatar(buffer, userId) {
  const filename = `${userId}-${crypto.randomBytes(8).toString('hex')}.webp`;
  const relativePath = `avatars/${filename}`;
  const fullPath = path.join(uploadConfig.rootDir, relativePath);

  await sharp(buffer)
    .resize(uploadConfig.image.avatarSize, uploadConfig.image.avatarSize, {
      fit: 'cover', // Crop to square
      position: 'center',
    })
    .webp({ quality: uploadConfig.image.quality })
    .toFile(fullPath);

  return {
    filename,
    relativePath,
    publicUrl: `/uploads/${relativePath}`,
  };
}