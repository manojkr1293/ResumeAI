import { Router } from 'express';
import aiController from '../controllers/ai.controller';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { body } from 'express-validator';

const router = Router();

// All AI routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/v1/ai/improve-bullets
 * @desc    Improve resume bullet points using AI
 * @access  Private
 */
router.post(
  '/improve-bullets',
  [
    body('bullets').isArray().withMessage('Bullets must be an array'),
    body('bullets.*').isString().withMessage('Each bullet must be a string'),
    body('resumeId').optional().isString(),
    body('sectionId').optional().isString(),
  ],
  validateRequest,
  aiController.improveBullets
);

/**
 * @route   POST /api/v1/ai/analyze-ats
 * @desc    Analyze resume against job description for ATS
 * @access  Private
 */
router.post(
  '/analyze-ats',
  [
    body('resumeId').notEmpty().withMessage('Resume ID is required'),
    body('jobDescription').notEmpty().withMessage('Job description is required'),
  ],
  validateRequest,
  aiController.analyzeATS
);

/**
 * @route   POST /api/v1/ai/coach
 * @desc    Get AI coaching advice for resume
 * @access  Private
 */
router.post(
  '/coach',
  [
    body('resumeId').notEmpty().withMessage('Resume ID is required'),
    body('question').notEmpty().withMessage('Question is required'),
  ],
  validateRequest,
  aiController.resumeCoach
);

/**
 * @route   POST /api/v1/ai/roast
 * @desc    Get constructive criticism (roast) for resume
 * @access  Private
 */
router.post(
  '/roast',
  [body('resumeId').notEmpty().withMessage('Resume ID is required')],
  validateRequest,
  aiController.resumeRoast
);

/**
 * @route   POST /api/v1/ai/generate-summary
 * @desc    Generate professional summary using AI
 * @access  Private
 */
router.post(
  '/generate-summary',
  [
    body('resumeId').notEmpty().withMessage('Resume ID is required'),
    body('targetRole').optional().isString(),
  ],
  validateRequest,
  aiController.generateSummary
);

/**
 * @route   GET /api/v1/ai/stats
 * @desc    Get user's AI usage statistics
 * @access  Private
 */
router.get('/stats', aiController.getUserAIStats);

/**
 * @route   POST /api/v1/ai/rate-feedback
 * @desc    Rate AI feedback helpfulness
 * @access  Private
 */
router.post(
  '/rate-feedback',
  [
    body('feedbackId').notEmpty().withMessage('Feedback ID is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  ],
  validateRequest,
  aiController.rateFeedback
);

export default router;
