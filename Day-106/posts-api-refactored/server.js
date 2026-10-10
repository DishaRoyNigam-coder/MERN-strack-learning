// server.js

import chalk from 'chalk';
import app from './src/app.js';
import logger from './src/utils/logger.js';
import { loggerConfig } from './src/config/logger.js';
import { AppError } from './src/errors/AppError.js';

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const server = app.listen(PORT, () => {
  logger.info('Server started', {
    port: PORT,
    url: `http://localhost:${PORT}`,
    environment: NODE_ENV,
    nodeVersion: process.version,
    logLevel: loggerConfig.level,
    logToFile: loggerConfig.toFile,
  });

  // ============================================================
  // SECURITY HEADERS BANNER
  // ============================================================
  console.log(chalk.yellow('\n🛡️  Security Headers:'));
  console.log(chalk.gray('   ✅ Content-Security-Policy'));
  console.log(chalk.gray('   ✅ Strict-Transport-Security (production only)'));
  console.log(chalk.gray('   ✅ X-Frame-Options: DENY'));
  console.log(chalk.gray('   ✅ X-Content-Type-Options: nosniff'));
  console.log(chalk.gray('   ✅ Referrer-Policy: no-referrer'));
  console.log(chalk.gray('   ✅ Cross-Origin-Opener-Policy'));
  console.log(chalk.gray('   ✅ Cross-Origin-Resource-Policy'));
  console.log(chalk.gray('   ✅ X-DNS-Prefetch-Control'));
  console.log(chalk.gray('   ✅ X-Permitted-Cross-Domain-Policies'));
  console.log(chalk.gray('   ✅ X-Powered-By removed'));
  console.log(chalk.yellow('\n🧪 Test at: https://securityheaders.com'));
  console.log('');
});

// ============================================================
// GRACEFUL SHUTDOWN
// ============================================================

function shutdown(signal) {
  logger.info(`Received ${signal}, shutting down gracefully...`);

  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// ============================================================
// UNHANDLED ERRORS
// ============================================================

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', {
    error: error.message,
    stack: error.stack,
  });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection', {
    reason: reason?.message || String(reason),
    stack: reason?.stack,
  });
});