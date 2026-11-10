// server.js

import app from './src/app.js';
import logger from './src/utils/logger.js';
import { seedData } from './src/data/store.js';

const PORT = process.env.PORT || 4000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const WORKER_ID = process.env.pm_id ?? 'standalone'; // PM2 sets pm_id for each worker

// Seed initial data before starting the server
try {
    await seedData();

    logger.info('Seed data initialized successfully');

} catch (error) {
    logger.error('Seed data initialization failed', {
        error: error.message
    });

    process.exit(1);
}

const server = app.listen(PORT, () => {
  logger.info('Server started', {
    port: PORT,
    url: `http://localhost:${PORT}`,
    environment: NODE_ENV,
    nodeVersion: process.version,
    workerId: WORKER_ID,
    pid: process.pid,
  });

  // If running under PM2, signal "ready" (only if wait_ready: true)
  if (process.send) {
    process.send('ready');
  }
});

// ============================================================
// GRACEFUL SHUTDOWN
// ============================================================

let isShuttingDown = false;

async function shutdown(signal) {
  if (isShuttingDown) {
    logger.warn('Shutdown already in progress');
    return;
  }
  isShuttingDown = true;

  logger.info(`Received ${signal} — shutting down gracefully`, {
    workerId: WORKER_ID,
    pid: process.pid,
  });

  // Stop accepting new connections
  server.close((err) => {
    if (err) {
      logger.error('Error closing server', { error: err.message });
      process.exit(1);
    }

    logger.info('HTTP server closed', { workerId: WORKER_ID });

    // Close database connections, etc.
    // await mongoose.connection.close();
    // await redis.quit();

    logger.info('Cleanup complete — exiting');
    process.exit(0);
  });

  // Force exit after timeout
  setTimeout(() => {
    logger.error('Forced shutdown after timeout', { workerId: WORKER_ID });
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// ============================================================
// UNHANDLED ERRORS
// ============================================================

process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception', {
    error: err.message,
    stack: err.stack,
    workerId: WORKER_ID,
  });
  shutdown('uncaughtException');
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection', {
    reason: reason?.message || String(reason),
    workerId: WORKER_ID,
  });
});