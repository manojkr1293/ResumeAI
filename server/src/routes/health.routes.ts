import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { prisma } from '@config/database';
import { sendSuccess } from '@utils/response';
import env from '@config/env';

const router = Router();

/**
 * @route   GET /api/v1/health
 * @desc    Get general application status, uptime, and system metadata
 * @access  Public
 */
router.get('/', (_req: Request, res: Response): void => {
  const healthData = {
    status: 'UP',
    name: env.APP_NAME,
    version: env.APP_VERSION,
    environment: env.NODE_ENV,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  };

  sendSuccess(res, healthData);
});

/**
 * @route   GET /api/v1/health/db
 * @desc    Ping database connection to verify service layer availability
 * @access  Public
 */
router.get('/db', async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Ping DB via simple raw select statement
    await prisma.$queryRaw`SELECT 1`;

    sendSuccess(res, {
      status: 'UP',
      database: 'CONNECTED',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
