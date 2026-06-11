import { Router } from 'express';
import resumeController from '../controllers/resume.controller';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { body, param } from 'express-validator';

const router = Router();

/**
 * @route   GET /api/v1/resumes/public/:id
 * @desc    Get a public read-only resume by ID
 * @access  Public
 */
router.get(
  '/public/:id',
  [param('id').notEmpty().withMessage('Resume ID is required')],
  validateRequest,
  resumeController.getPublicResumeById
);

// All resume routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/resumes
 * @desc    Get all resumes for the authenticated user
 * @access  Private
 */
router.get('/', resumeController.getAllResumes);

/**
 * @route   GET /api/v1/resumes/stats
 * @desc    Get resume statistics for the authenticated user
 * @access  Private
 */
router.get('/stats', resumeController.getUserResumeStats);

/**
 * @route   GET /api/v1/resumes/:id
 * @desc    Get a single resume by ID
 * @access  Private
 */
router.get(
  '/:id',
  [param('id').notEmpty().withMessage('Resume ID is required')],
  validateRequest,
  resumeController.getResumeById
);

/**
 * @route   POST /api/v1/resumes
 * @desc    Create a new resume
 * @access  Private
 */
router.post(
  '/',
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('templateId').optional().isString().withMessage('Template ID must be a string'),
    body('isPrimary').optional().isBoolean().withMessage('isPrimary must be a boolean'),
  ],
  validateRequest,
  resumeController.createResume
);

/**
 * @route   PUT /api/v1/resumes/:id
 * @desc    Update a resume
 * @access  Private
 */
router.put(
  '/:id',
  [
    param('id').notEmpty().withMessage('Resume ID is required'),
    body('title').optional().notEmpty().withMessage('Title cannot be empty'),
    body('templateId').optional().notEmpty().withMessage('Template ID cannot be empty'),
    body('status').optional().isIn(['DRAFT', 'ACTIVE', 'ARCHIVED']).withMessage('Invalid status'),
    body('isPrimary').optional().isBoolean().withMessage('isPrimary must be a boolean'),
  ],
  validateRequest,
  resumeController.updateResume
);

/**
 * @route   DELETE /api/v1/resumes/:id
 * @desc    Delete a resume
 * @access  Private
 */
router.delete(
  '/:id',
  [param('id').notEmpty().withMessage('Resume ID is required')],
  validateRequest,
  resumeController.deleteResume
);

/**
 * @route   POST /api/v1/resumes/:id/duplicate
 * @desc    Duplicate a resume
 * @access  Private
 */
router.post(
  '/:id/duplicate',
  [
    param('id').notEmpty().withMessage('Resume ID is required'),
    body('newTitle').optional().notEmpty().withMessage('New title cannot be empty'),
  ],
  validateRequest,
  resumeController.duplicateResume
);

/**
 * @route   PUT /api/v1/resumes/:id/primary
 * @desc    Set resume as primary
 * @access  Private
 */
router.put(
  '/:id/primary',
  [param('id').notEmpty().withMessage('Resume ID is required')],
  validateRequest,
  resumeController.setAsPrimary
);

/**
 * @route   PUT /api/v1/resumes/:id/archive
 * @desc    Archive a resume
 * @access  Private
 */
router.put(
  '/:id/archive',
  [param('id').notEmpty().withMessage('Resume ID is required')],
  validateRequest,
  resumeController.archiveResume
);

/**
 * @route   PUT /api/v1/resumes/:id/scores
 * @desc    Update resume scores
 * @access  Private
 */
router.put(
  '/:id/scores',
  [
    param('id').notEmpty().withMessage('Resume ID is required'),
    body('atsScore').optional().isInt({ min: 0, max: 100 }).withMessage('ATS score must be between 0 and 100'),
    body('overallScore').optional().isInt({ min: 0, max: 100 }).withMessage('Overall score must be between 0 and 100'),
  ],
  validateRequest,
  resumeController.updateScores
);

export default router;
