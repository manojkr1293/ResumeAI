import { Router } from 'express';
import exportController from '../controllers/export.controller';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { body, param } from 'express-validator';

const router = Router();

// All export routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/v1/export
 * @desc    Create a new export job
 * @access  Private
 */
router.post(
  '/',
  [
    body('resumeId').notEmpty().withMessage('Resume ID is required'),
    body('format').isIn(['PDF', 'DOCX', 'TXT']).withMessage('Format must be PDF, DOCX, or TXT'),
  ],
  validateRequest,
  exportController.createExport
);

/**
 * @route   GET /api/v1/export/resume/:resumeId
 * @desc    Get all exports for a resume
 * @access  Private
 */
router.get(
  '/resume/:resumeId',
  [param('resumeId').notEmpty().withMessage('Resume ID is required')],
  validateRequest,
  exportController.getResumeExports
);

/**
 * @route   GET /api/v1/export/:id
 * @desc    Get export by ID
 * @access  Private
 */
router.get(
  '/:id',
  [param('id').notEmpty().withMessage('Export ID is required')],
  validateRequest,
  exportController.getExportById
);

/**
 * @route   GET /api/v1/export/:id/download
 * @desc    Get export download URL
 * @access  Private
 */
router.get(
  '/:id/download',
  [param('id').notEmpty().withMessage('Export ID is required')],
  validateRequest,
  exportController.getDownloadUrl
);

/**
 * @route   DELETE /api/v1/export/:id
 * @desc    Delete export
 * @access  Private
 */
router.delete(
  '/:id',
  [param('id').notEmpty().withMessage('Export ID is required')],
  validateRequest,
  exportController.deleteExport
);

/**
 * @route   GET /api/v1/export/stats
 * @desc    Get user's export statistics
 * @access  Private
 */
router.get('/stats', exportController.getUserExportStats);

export default router;
