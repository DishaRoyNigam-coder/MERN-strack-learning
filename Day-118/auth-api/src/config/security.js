// src/config/security.js

const isProduction = process.env.NODE_ENV === 'production';

export const securityConfig = {
  hsts: {
    enabled: process.env.SECURITY_HSTS_ENABLED === 'true' || isProduction,
    maxAge: 31536000,
    includeSubDomains: true,
    preload: isProduction,
  },
  csp: {
    reportOnly: false,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", ...(isProduction ? [] : ["'unsafe-inline'", "'unsafe-eval'"])],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'blob:', ...(isProduction ? [] : ['https:'])],
      fontSrc: ["'self'", 'data:'],
      connectSrc: ["'self'", ...(isProduction ? [] : ['ws://localhost:*', 'http://localhost:*'])],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      objectSrc: ["'none'"],
    },
  },
  frameOptions: { action: 'DENY' },
  referrerPolicy: { policy: 'no-referrer' },
  crossOriginResourcePolicy: { policy: 'same-origin' },
};