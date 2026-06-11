import { Request, Response, NextFunction } from 'express';
import { ValidationError, NotFoundError, AuthorizationError } from '../errors/index';
import { sendSuccess, sendCreated } from '../utils/response';
import repositories from '../repositories';

/**
 * Export Controller
 * Handles resume export functionality
 */
export class ExportController {
  /**
   * Create a new export job
   */
  createExport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.userId;
      const { resumeId, format } = req.body;

      if (!userId) {
        throw new ValidationError('User not authenticated');
      }

      if (!resumeId || !format) {
        throw new ValidationError('Resume ID and format are required');
      }

      if (!['PDF', 'DOCX'].includes(format)) {
        throw new ValidationError('Invalid format. Must be PDF or DOCX');
      }

      // Verify resume ownership
      const resume = await repositories.resume.findById(resumeId);
      if (!resume || resume.userId !== userId) {
        throw new NotFoundError('Resume not found');
      }

      // Create export record
      const exportRecord = await repositories.getPrisma().export.create({
        data: {
          resumeId,
          userId,
          exportType: format as any,
          fileUrl: '',
          fileSizeKb: 0,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        },
      });

      // In a real implementation, this would trigger a background job
      // For now, we'll mark it as completed with a placeholder URL
      const completedExport = await repositories.getPrisma().export.update({
        where: { id: exportRecord.id },
        data: {
          fileUrl: `/exports/${exportRecord.id}.${format.toLowerCase()}`,
          fileSizeKb: 100, // Placeholder
        },
      });

      sendCreated(res, { export: completedExport });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get all exports for a resume
   */
  getResumeExports = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.userId;
      const { resumeId } = req.params;

      if (!userId) {
        throw new ValidationError('User not authenticated');
      }

      if (!resumeId) {
        throw new ValidationError('Resume ID is required');
      }

      // Verify resume ownership
      const resume = await repositories.resume.findById(resumeId);
      if (!resume || resume.userId !== userId) {
        throw new NotFoundError('Resume not found');
      }

      const exports = await repositories.getPrisma().export.findMany({
        where: { resumeId },
        orderBy: { createdAt: 'desc' },
      });

      sendSuccess(res, { exports });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get export by ID
   */
  getExportById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.userId;
      const { id } = req.params;

      if (!userId) {
        throw new ValidationError('User not authenticated');
      }

      if (!id) {
        throw new ValidationError('Export ID is required');
      }

      const exportRecord = await repositories.getPrisma().export.findUnique({
        where: { id },
      });

      if (!exportRecord) {
        throw new NotFoundError('Export not found');
      }

      if (exportRecord.userId !== userId) {
        throw new AuthorizationError('You do not have permission to access this export');
      }

      sendSuccess(res, { export: exportRecord });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get export download URL
   */
  getDownloadUrl = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.userId;
      const { id } = req.params;

      if (!userId) {
        throw new ValidationError('User not authenticated');
      }

      if (!id) {
        throw new ValidationError('Export ID is required');
      }

      const exportRecord = await repositories.getPrisma().export.findUnique({
        where: { id },
      });

      if (!exportRecord) {
        throw new NotFoundError('Export not found');
      }

      if (exportRecord.userId !== userId) {
        throw new AuthorizationError('You do not have permission to access this export');
      }

      // Since schema doesn't have status, assume exports are always ready
      sendSuccess(res, { downloadUrl: exportRecord.fileUrl });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete export
   */
  deleteExport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.userId;
      const { id } = req.params;

      if (!userId) {
        throw new ValidationError('User not authenticated');
      }

      if (!id) {
        throw new ValidationError('Export ID is required');
      }

      const exportRecord = await repositories.getPrisma().export.findUnique({
        where: { id },
      });

      if (!exportRecord) {
        throw new NotFoundError('Export not found');
      }

      if (exportRecord.userId !== userId) {
        throw new AuthorizationError('You do not have permission to delete this export');
      }

      await repositories.getPrisma().export.delete({
        where: { id },
      });

      sendSuccess(res, { message: 'Export deleted successfully' });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get user's export statistics
   */
  getUserExportStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        throw new ValidationError('User not authenticated');
      }

      const exports = await repositories.getPrisma().export.findMany({
        where: { userId },
      });

      const stats = {
        total: exports.length,
        byFormat: {
          PDF: exports.filter((e) => e.exportType === 'PDF').length,
          DOCX: exports.filter((e) => e.exportType === 'DOCX').length,
        },
      };

      sendSuccess(res, { stats });
    } catch (error) {
      next(error);
    }
  };
}

export default new ExportController();
