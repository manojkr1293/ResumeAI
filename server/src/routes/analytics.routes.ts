import { Router } from 'express';
import analyticsController from '../controllers/analytics.controller';
import { optionalAuth } from '../middleware/auth';

const router = Router();

router.post('/event', optionalAuth, analyticsController.trackEvent);

export default router;
