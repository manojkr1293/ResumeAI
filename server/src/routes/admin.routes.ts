import { Router } from 'express';
import adminController from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/admin';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/overview', adminController.overview);
router.get('/users', adminController.users);
router.get('/resumes', adminController.resumes);
router.get('/ai', adminController.ai);
router.get('/funnel', adminController.funnel);
router.get('/activity', adminController.activity);
router.get('/errors', adminController.errors);
router.get('/marketing', adminController.marketing);
router.get('/users/:id', adminController.userDetail);

export default router;
