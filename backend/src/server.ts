import { createApp } from './app';
import { env } from './config/env.config';
import { logger } from './config/logger';
import { prisma } from './db/prisma';

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info(`🚀 NEXAURA API Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
  logger.info(`📡 Health Check available at http://localhost:${env.PORT}/api/v1/health`);
});

// Graceful Shutdown
async function handleShutdown(signal: string) {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  server.close(async () => {
    logger.info('HTTP server closed.');
    await prisma.$disconnect();
    logger.info('Database connection closed.');
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('Forcefully terminating process after timeout.');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));
