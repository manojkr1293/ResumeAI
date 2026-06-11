import { Request, Response, NextFunction } from 'express';
import { ValidationError, NotFoundError } from '../errors/index';
import { sendSuccess } from '../utils/response';
import repositories from '../repositories';

/**
 * Template Controller
 * Handles template management
 */
export class TemplateController {
  /**
   * Get all templates
   */
  getAllTemplates = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { category, isPremium } = req.query;

      const where: any = {
        isActive: true,
      };

      if (category) {
        where.category = category as string;
      }

      if (isPremium !== undefined) {
        where.isPremium = isPremium === 'true';
      }

      const templates = await repositories.getPrisma().template.findMany({
        where,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      });

      sendSuccess(res, { templates });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get a single template by ID
   */
  getTemplateById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        throw new ValidationError('Template ID is required');
      }

      const template = await repositories.getPrisma().template.findUnique({
        where: { id },
      });

      if (!template) {
        throw new NotFoundError('Template not found');
      }

      sendSuccess(res, { template });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get templates by category
   */
  getTemplatesByCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { category } = req.params;

      if (!category) {
        throw new ValidationError('Category is required');
      }

      const templates = await repositories.getPrisma().template.findMany({
        where: {
          category: category as any,
          isActive: true,
        },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      });

      sendSuccess(res, { templates });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get featured templates
   */
  getFeaturedTemplates = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const templates = await repositories.getPrisma().template.findMany({
        where: {
          isActive: true,
        },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        take: 10,
      });

      sendSuccess(res, { templates });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get free templates
   */
  getFreeTemplates = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const templates = await repositories.getPrisma().template.findMany({
        where: {
          isActive: true,
          isPremium: false,
        },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      });

      sendSuccess(res, { templates });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get premium templates
   */
  getPremiumTemplates = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const templates = await repositories.getPrisma().template.findMany({
        where: {
          isActive: true,
          isPremium: true,
        },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      });

      sendSuccess(res, { templates });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get template categories
   */
  getTemplateCategories = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const templates = await repositories.getPrisma().template.findMany({
        where: {
          isActive: true,
        },
        select: {
          category: true,
        },
        distinct: ['category'],
      });

      const categories = templates.map((t) => t.category);

      sendSuccess(res, { categories });
    } catch (error) {
      next(error);
    }
  };
}

export default new TemplateController();
