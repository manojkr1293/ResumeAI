import { Router } from 'express';
import jdController from '../controllers/jd.controller';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { body, param } from 'express-validator';

const router = Router();

// All JD routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/v1/jd
 * @desc    Create a new job description
 * @access  Private
 */
router.post(
  '/',
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('rawText').notEmpty().withMessage('Raw text is required'),
    body('company').optional().isString(),
  ],
  validateRequest,
  jdController.createJD
);

/**
 * @route   GET /api/v1/jd
 * @desc    Get all job descriptions for the authenticated user
 * @access  Private
 */
router.get('/', jdController.getAllJDs);

/**
 * @route   GET /api/v1/jd/:id
 * @desc    Get a single job description by ID
 * @access  Private
 */
router.get(
  '/:id',
  [param('id').notEmpty().withMessage('Job description ID is required')],
  validateRequest,
  jdController.getJDById
);

/**
 * @route   POST /api/v1/jd/extract-keywords
 * @desc    Extract keywords from job description
 * @access  Private
 */
router.post(
  '/extract-keywords',
  [body('jdId').notEmpty().withMessage('Job description ID is required')],
  validateRequest,
  jdController.extractKeywords
);

/**
 * @route   POST /api/v1/jd/match
 * @desc    Match resume to job description
 * @access  Private
 */
router.post(
  '/match',
  [
    body('resumeId').notEmpty().withMessage('Resume ID is required'),
    body('jdId').notEmpty().withMessage('Job description ID is required'),
  ],
  validateRequest,
  jdController.matchResume
);

/**
 * @route   POST /api/v1/jd/tailor
 * @desc    Tailor resume to job description
 * @access  Private
 */
router.post(
  '/tailor',
  [
    body('resumeId').notEmpty().withMessage('Resume ID is required'),
    body('jdId').notEmpty().withMessage('Job description ID is required'),
  ],
  validateRequest,
  jdController.tailorResume
);

/**
 * @route   DELETE /api/v1/jd/:id
 * @desc    Delete a job description
 * @access  Private
 */
router.delete(
  '/:id',
  [param('id').notEmpty().withMessage('Job description ID is required')],
  validateRequest,
  jdController.deleteJD
);

export default router;
