// src/config/cors.js

/**
 * Parse comma-separated origins from env
 */
export function getAllowedOrigins() {
  const raw = process.env.ALLOWED_ORIGINS || 'http://localhost:5173';

  return raw
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);
}

/**
 * CORS configuration
 */
export const corsOptions = {
  origin: (origin, callback) => {
    const allowed = getAllowedOrigins();

    // Allow requests with no origin
    // Example: Postman, curl, mobile apps
    if (!origin) {
      return callback(null, true);
    }

    // Allow localhost during development
    if (
      process.env.NODE_ENV !== 'production' &&
      /^https?:\/\/localhost(:\d+)?$/.test(origin)
    ) {
      return callback(null, true);
    }

    // Check allowed origins
    if (allowed.includes(origin)) {
      return callback(null, true);
    }

    console.warn(`🚫 CORS blocked origin: ${origin}`);

    return callback(
      new Error(`Origin ${origin} not allowed by CORS`)
    );
  },

  credentials: true,

  methods: [
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'OPTIONS'
  ],

  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'X-Client-Type'
  ],

  exposedHeaders: [
    'X-Request-Id',
    'X-Total-Count',
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining'
  ],

  maxAge: 86400,

  optionsSuccessStatus: 204
};