// src/middleware/security.js

import helmet from 'helmet';
import { securityConfig } from '../config/security.js';
import logger from '../utils/logger.js';

// ============================================================
// BASE HELMET
// ============================================================

/**
 * Main security middleware.
 * Combines 12+ security headers in one place.
 */
export function securityHeaders() {
  const { hsts, csp, frameOptions, referrerPolicy } = securityConfig;

  return helmet({
    // Content Security Policy
    contentSecurityPolicy: {
      useDefaults: false,
      directives: csp.directives,
      reportOnly: csp.reportOnly,
    },

    // Strict-Transport-Security
    hsts: hsts.enabled
      ? {
          maxAge: hsts.maxAge,
          includeSubDomains: hsts.includeSubDomains,
          preload: hsts.preload,
        }
      : false, // Disable in dev

    // Cross-Origin-Opener-Policy: isolate window
    crossOriginOpenerPolicy: { policy: 'same-origin' },

    // Cross-Origin-Resource-Policy
    crossOriginResourcePolicy: securityConfig.crossOriginResourcePolicy,

    // Origin-Agent-Cluster
    originAgentCluster: true,

    // Referrer-Policy
    referrerPolicy: { policy: referrerPolicy.policy },

    // X-Content-Type-Options: nosniff
    xContentTypeOptions: true,

    // X-DNS-Prefetch-Control: off
    xDnsPrefetchControl: { allow: false },

    // X-Download-Options: noopen (IE only)
    xDownloadOptions: true,

    // X-Frame-Options
    xFrameOptions: { action: frameOptions.action },

    // X-Permitted-Cross-Domain-Policies: none
    xPermittedCrossDomainPolicies: { permittedPolicies: 'none' },

    // X-XSS-Protection: 0 (disabled — legacy, causes issues on modern browsers)
    xXssProtection: false,

    // Hide X-Powered-By (Express default)
    hidePoweredBy: true,
  });
}

// ============================================================
// CROSS-ORIGIN FOR PUBLIC FILES
// ============================================================

/**
 * Relaxed CORP for static asset routes (e.g., /uploads).
 * Allows other origins to load images, CSS, JS, etc.
 */
export function crossOriginForPublicFiles() {
  return helmet.crossOriginResourcePolicy({ policy: 'cross-origin' });
}

// ============================================================
// SECURITY LOGGER
// ============================================================

/**
 * Log the security headers being applied (startup only).
 */
export function logSecurityConfig() {
  const { hsts, csp, referrerPolicy, frameOptions } = securityConfig;

  logger.info('Security headers configured', {
    hsts: hsts.enabled ? `${hsts.maxAge}s` : 'disabled (dev)',
    cspReportOnly: csp.reportOnly,
    frameOptions: frameOptions.action,
    referrerPolicy: referrerPolicy.policy,
  });
}

// ============================================================
// CSP VIOLATION REPORTER (optional)
// ============================================================

/**
 * Endpoint to receive CSP violation reports.
 * Mount at: app.post('/api/csp-report', cspReportHandler)
 */
export function cspReportHandler(req, res) {
  const report = req.body?.['csp-report'] || req.body;

  logger.warn('CSP violation', {
    documentUri: report?.['document-uri'],
    violatedDirective: report?.['violated-directive'],
    blockedUri: report?.['blocked-uri'],
    sourceFile: report?.['source-file'],
    lineNumber: report?.['line-number'],
    originalPolicy: report?.['original-policy'],
  });

  // Must return 204 to acknowledge
  res.status(204).end();
}