// src/middleware/security.js

import helmet from 'helmet';
import { securityConfig } from '../config/security.js';
import logger from '../utils/logger.js';

export function securityHeaders() {
  const baseHelmet = helmet({
    contentSecurityPolicy: {
      useDefaults: false,
      directives: securityConfig.csp.directives,
      reportOnly: securityConfig.csp.reportOnly,
    },
    hsts: securityConfig.hsts.enabled
      ? { maxAge: securityConfig.hsts.maxAge, includeSubDomains: true, preload: securityConfig.hsts.preload }
      : false,
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    crossOriginResourcePolicy: securityConfig.crossOriginResourcePolicy,
    originAgentCluster: true,
    referrerPolicy: { policy: securityConfig.referrerPolicy.policy },
    xContentTypeOptions: true,
    xDnsPrefetchControl: { allow: false },
    xDownloadOptions: true,
    xFrameOptions: { action: securityConfig.frameOptions.action },
    xPermittedCrossDomainPolicies: { permittedPolicies: 'none' },
    xXssProtection: false,
    hidePoweredBy: true,
  });

  return (req, res, next) => {
    baseHelmet(req, res, () => {
      res.setHeader(
        'Permissions-Policy',
        'camera=(), microphone=(), geolocation=(), payment=(), usb=(), fullscreen=(self)'
      );
      next();
    });
  };
}

export function crossOriginForPublicFiles() {
  return helmet.crossOriginResourcePolicy({ policy: 'cross-origin' });
}

export function logSecurityConfig() {
  logger.info('Security headers configured', {
    hsts: securityConfig.hsts.enabled ? 'enabled' : 'disabled (dev)',
    cspReportOnly: securityConfig.csp.reportOnly,
    frameOptions: securityConfig.frameOptions.action,
  });
}