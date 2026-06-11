import { Router } from 'express';
import templateController from '../controllers/template.controller';
import { validateRequest } from '../middleware/validation';
import { param, query } from 'express-validator';

const router = Router();

/**
 * @route   GET /api/v1/templates
 * @desc    Get all templates with optional filters
 * @access  Public
 */
router.get(
  '/',
  [
    query('category').optional().isString(),
    query('isPremium').optional().isBoolean(),
  ],
  validateRequest,
  templateController.getAllTemplates
);

/**
 * @route   GET /api/v1/templates/categories
 * @desc    Get all template categories
 * @access  Public
 */
router.get('/categories', templateController.getTemplateCategories);

/**
 * @route   GET /api/v1/templates/featured
 * @desc    Get featured templates
 * @access  Public
 */
router.get('/featured', templateController.getFeaturedTemplates);

/**
 * @route   GET /api/v1/templates/free
 * @desc    Get free templates
 * @access  Public
 */
router.get('/free', templateController.getFreeTemplates);

/**
 * @route   GET /api/v1/templates/premium
 * @desc    Get premium templates
 * @access  Public
 */
router.get('/premium', templateController.getPremiumTemplates);

/**
 * @route   GET /api/v1/templates/category/:category
 * @desc    Get templates by category
 * @access  Public
 */
router.get(
  '/category/:category',
  [param('category').notEmpty().withMessage('Category is required')],
  validateRequest,
  templateController.getTemplatesByCategory
);

/**
 * @route   GET /api/v1/templates/:id
 * @desc    Get a single template by ID
 * @access  Public
 */
router.get(
  '/:id',
  [param('id').notEmpty().withMessage('Template ID is required')],
  validateRequest,
  templateController.getTemplateById
);

export default router;
