// src/config/security.js

import 'dotenv/config';

const isProduction = process.env.NODE_ENV === 'production';

export const securityConfig = {
  // HSTS — force HTTPS. NEVER enable in development!
  hsts: {
    enabled: process.env.SECURITY_HSTS_ENABLED === 'true' || isProduction,
    maxAge: Number(process.env.SECURITY_HSTS_MAX_AGE) || 31536000,
    includeSubDomains: true,
    preload: isProduction,
  },

  // CSP — the most powerful header. Tune carefully.
  csp: {
    reportOnly: process.env.SECURITY_CSP_REPORT_ONLY === 'true',
    directives: {
      // Fallback for other directives
      defaultSrc: ["'self'"],

      // Scripts
      scriptSrc: [
        "'self'",
        // Add CDNs if needed, e.g., 'https://cdn.jsdelivr.net'
        ...(isProduction ? [] : ["'unsafe-inline'", "'unsafe-eval'"]),
        // 'unsafe-inline' and 'unsafe-eval' are only for local dev with hot reload
      ],

      // Styles
      styleSrc: [
        "'self'",
        "'unsafe-inline'", // Many UI libs need this. Or use a nonce.
      ],

      // Images — allow data URIs (for inline base64), and our own uploads
      imgSrc: [
        "'self'",
        'data:',
        'blob:',
        ...(isProduction ? [] : ['https:']), // Allow placeholder images in dev
      ],

      // Fonts
      fontSrc: ["'self'", 'data:'],

      // Fetch/XHR/WebSocket targets
      connectSrc: [
        "'self'",
        ...(isProduction ? [] : ['ws://localhost:*', 'http://localhost:*']),
      ],

      // Media (video/audio)
      mediaSrc: ["'self'"],

      // Who can iframe your site (replaces X-Frame-Options for modern browsers)
      frameAncestors: ["'none'"],

      // Restrict <base href> attacks
      baseUri: ["'self'"],

      // Restrict where forms can submit
      formAction: ["'self'"],

      // Restrict <object>/<embed>
      objectSrc: ["'none'"],

      // Upgrade HTTP requests to HTTPS in the browser
      upgradeInsecureRequests: isProduction ? [] : null,
    },
  },

  // Cross-Origin Resource Policy
  // 'same-origin' blocks other sites from loading your resources
  // 'cross-origin' allows (needed for public APIs / images)
  crossOriginResourcePolicy: {
    policy: 'same-origin', // Change to 'cross-origin' for public resources
  },

  // X-Frame-Options (legacy, but keep for old browsers)
  frameOptions: {
    action: process.env.SECURITY_FRAME_OPTIONS || 'DENY',
  },

  // Referrer policy
  referrerPolicy: {
    policy: process.env.SECURITY_REFERRER_POLICY || 'no-referrer',
  },

  // Content-Type sniffing
  contentTypeOptions: {
    nosniff: true, // Always true
  },
};