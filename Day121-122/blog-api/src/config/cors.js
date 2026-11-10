// src/config/cors.js

export function getAllowedOrigins() {
  const raw = process.env.ALLOWED_ORIGINS || 'http://localhost:5173';
  return raw.split(',').map(o => o.trim()).filter(Boolean);
}

export const corsOptions = {
  origin: (origin, cb) => {
    const allowed = getAllowedOrigins();
    if (!origin) return cb(null, true);
    if (process.env.NODE_ENV !== 'production' && /^https?:\/\/localhost(:\d+)?$/.test(origin)) {
      return cb(null, true);
    }
    if (allowed.includes(origin)) return cb(null, true);
    return cb(new Error(`Origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
  exposedHeaders: ['X-Request-Id', 'RateLimit-Limit', 'RateLimit-Remaining'],
  maxAge: 86400,
  optionsSuccessStatus: 204,
};