// src/routes/dev.routes.js

import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { loggerConfig } from '../config/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOG_DIR = path.join(__dirname, '../..', loggerConfig.dir);

const router = Router();

// Only enable in development
router.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ error: 'Not found' });
  }
  next();
});

// GET /api/dev/logs?lines=50
router.get('/logs', (req, res) => {
  try {
    const lines = Math.min(Number(req.query.lines) || 50, 500);
    const files = fs.readdirSync(LOG_DIR).filter(f => f.endsWith('.log'));

    if (files.length === 0) {
      return res.json({ success: true, file: null, lines: [] });
    }

    // Get the most recent log file
    const latest = files.sort().reverse()[0];
    const content = fs.readFileSync(path.join(LOG_DIR, latest), 'utf8');
    const logLines = content.trim().split('\n').slice(-lines);

    res.json({
      success: true,
      file: latest,
      totalLines: logLines.length,
      lines: logLines.map(line => {
        try {
          return JSON.parse(line);
        } catch {
          return line;
        }
      }),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;