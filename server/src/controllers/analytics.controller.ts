import { Request, Response, NextFunction } from 'express';
import repositories from '../repositories';
import { sendCreated } from '../utils/response';

export class AnalyticsController {
  trackEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.userId || null;
      const { sessionId, eventType, entityType, entityId, path, referrer, metadata } = req.body;

      if (!sessionId || !eventType) {
        sendCreated(res, { tracked: false });
        return;
      }

      await repositories.getPrisma().analyticsEvent.create({
        data: {
          userId,
          sessionId,
          eventType,
          entityType,
          entityId,
          path,
          referrer,
          metadata: metadata || {},
          ipAddress: req.ip,
          userAgent: req.get('user-agent') || null,
        },
      });

      sendCreated(res, { tracked: true });
    } catch (error) {
      next(error);
    }
  };
}

export default new AnalyticsController();
