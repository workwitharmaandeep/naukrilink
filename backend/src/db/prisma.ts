import { PrismaClient } from '@prisma/client';
import { env } from '../config/env.config';
import { logger } from '../config/logger';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log:
      env.NODE_ENV === 'development'
        ? [
            { emit: 'event', level: 'query' },
            { emit: 'event', level: 'error' },
            { emit: 'event', level: 'warn' },
          ]
        : ['error'],
  });

if (env.NODE_ENV === 'development') {
  (prisma as any).$on('error', (e: any) => {
    logger.error('Prisma Error: %o', e);
  });
  (prisma as any).$on('warn', (e: any) => {
    logger.warn('Prisma Warning: %o', e);
  });
}

if (env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}
