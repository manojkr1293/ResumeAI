import { Request, Response, NextFunction } from 'express';
import { ResumeRepository } from '../repositories/resume.repository';
import { ValidationError, NotFoundError, AuthorizationError } from '../errors/index';
import { sendSuccess, sendCreated } from '../utils/response';
import repositories from '../repositories';

/**
 * Resume Controller
 * Handles resume CRUD operations
 */
export class ResumeController {
  private resumeRepository: ResumeRepository;

  constructor() {
    this.resumeRepository = repositories.resume;
  }

  /**
   * Get all resumes for the authenticated user
   */
  getAllResumes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.userId;
      
      if (!userId) {
        throw new ValidationError('User not authenticated');
      }

      const resumes = await this.resumeRepository.findByUserId(userId);

      sendSuccess(res, { resumes });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get a single resume by ID
   */
  getResumeById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.userId;
      const { id } = req.params;

      if (!userId) {
        throw new ValidationError('User not authenticated');
      }

      if (!id) {
        throw new ValidationError('Resume ID is required');
      }

      const resume = await this.resumeRepository.findWithSections(id);

      if (!resume) {
        throw new NotFoundError('Resume not found');
      }

      if (resume.userId !== userId) {
        throw new AuthorizationError('You do not have permission to access this resume');
      }

      sendSuccess(res, { resume });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get a read-only public resume by ID
   */
  getPublicResumeById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        throw new ValidationError('Resume ID is required');
      }

      const resume = await this.resumeRepository.findWithSections(id);

      if (!resume || resume.status === 'ARCHIVED') {
        throw new NotFoundError('Resume not found');
      }

      const publicResume = {
        id: resume.id,
        title: resume.title,
        templateId: resume.templateId,
        sections: resume.sections,
        updatedAt: resume.updatedAt,
      };

      sendSuccess(res, { resume: publicResume });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create a new resume
   */
  createResume = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.userId;
      const { title, templateId, isPrimary } = req.body;

      if (!userId) {
        throw new ValidationError('User not authenticated');
      }

      if (!title) {
        throw new ValidationError('Title is required');
      }

      const resume = await this.resumeRepository.createResume({
        userId,
        title,
        templateId,
        isPrimary,
      });

      sendCreated(res, { resume });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update a resume
   */
  updateResume = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.userId;
      const { id } = req.params;
      const { title, templateId, status, isPrimary } = req.body;

      if (!userId) {
        throw new ValidationError('User not authenticated');
      }

      if (!id) {
        throw new ValidationError('Resume ID is required');
      }

      const resume = await this.resumeRepository.findById(id);

      if (!resume) {
        throw new NotFoundError('Resume not found');
      }

      if (resume.userId !== userId) {
        throw new AuthorizationError('You do not have permission to update this resume');
      }

      const updateData: any = {};
      if (title) updateData.title = title;
      if (templateId) updateData.templateId = templateId;
      if (status) updateData.status = status;
      if (isPrimary !== undefined) updateData.isPrimary = isPrimary;

      const { sections } = req.body;
      let updatedResume;

      if (sections && Array.isArray(sections)) {
        // If sections are provided, use a transaction to update the resume and its sections
        updatedResume = await this.resumeRepository.transaction(async (tx) => {
          await tx.resume.update({
            where: { id },
            data: updateData,
          });

          // Delete existing sections to replace them (simple approach for autosave)
          await tx.resumeSection.deleteMany({
            where: { resumeId: id }
          });

          // Re-insert new sections
          for (const section of sections) {
            await tx.resumeSection.create({
              data: {
                resumeId: id,
                sectionType: section.sectionType,
                sectionOrder: section.sectionOrder,
                content: section.content,
                isVisible: section.isVisible !== undefined ? section.isVisible : true,
              }
            });
          }

          return tx.resume.findUnique({
            where: { id },
            include: { sections: true }
          });
        });
      } else {
        updatedResume = await this.resumeRepository.update(id, updateData);
      }

      sendSuccess(res, { resume: updatedResume });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete a resume
   */
  deleteResume = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.userId;
      const { id } = req.params;

      if (!userId) {
        throw new ValidationError('User not authenticated');
      }

      if (!id) {
        throw new ValidationError('Resume ID is required');
      }

      const resume = await this.resumeRepository.findById(id);

      if (!resume) {
        throw new NotFoundError('Resume not found');
      }

      if (resume.userId !== userId) {
        throw new AuthorizationError('You do not have permission to delete this resume');
      }

      await this.resumeRepository.delete(id);

      sendSuccess(res, { message: 'Resume deleted successfully' });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Duplicate a resume
   */
  duplicateResume = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.userId;
      const { id } = req.params;
      const { newTitle } = req.body;

      if (!userId) {
        throw new ValidationError('User not authenticated');
      }

      if (!id) {
        throw new ValidationError('Resume ID is required');
      }

      const resume = await this.resumeRepository.findById(id);

      if (!resume) {
        throw new NotFoundError('Resume not found');
      }

      if (resume.userId !== userId) {
        throw new AuthorizationError('You do not have permission to duplicate this resume');
      }

      const duplicatedResume = await this.resumeRepository.duplicateResume(id, newTitle || `${resume.title} (Copy)`);

      sendCreated(res, { resume: duplicatedResume });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Set resume as primary
   */
  setAsPrimary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.userId;
      const { id } = req.params;

      if (!userId) {
        throw new ValidationError('User not authenticated');
      }

      if (!id) {
        throw new ValidationError('Resume ID is required');
      }

      const resume = await this.resumeRepository.findById(id);

      if (!resume) {
        throw new NotFoundError('Resume not found');
      }

      if (resume.userId !== userId) {
        throw new AuthorizationError('You do not have permission to update this resume');
      }

      const updatedResume = await this.resumeRepository.setAsPrimary(id, userId);

      sendSuccess(res, { resume: updatedResume });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Archive a resume
   */
  archiveResume = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.userId;
      const { id } = req.params;

      if (!userId) {
        throw new ValidationError('User not authenticated');
      }

      if (!id) {
        throw new ValidationError('Resume ID is required');
      }

      const resume = await this.resumeRepository.findById(id);

      if (!resume) {
        throw new NotFoundError('Resume not found');
      }

      if (resume.userId !== userId) {
        throw new AuthorizationError('You do not have permission to archive this resume');
      }

      const archivedResume = await this.resumeRepository.archiveResume(id);

      sendSuccess(res, { resume: archivedResume });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update resume scores
   */
  updateScores = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.userId;
      const { id } = req.params;
      const { atsScore, overallScore } = req.body;

      if (!userId) {
        throw new ValidationError('User not authenticated');
      }

      if (!id) {
        throw new ValidationError('Resume ID is required');
      }

      const resume = await this.resumeRepository.findById(id);

      if (!resume) {
        throw new NotFoundError('Resume not found');
      }

      if (resume.userId !== userId) {
        throw new AuthorizationError('You do not have permission to update this resume');
      }

      const updatedResume = await this.resumeRepository.updateScores(id, {
        atsScore,
        overallScore,
      });

      sendSuccess(res, { resume: updatedResume });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get resume statistics for user
   */
  getUserResumeStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        throw new ValidationError('User not authenticated');
      }

      const stats = await this.resumeRepository.getUserResumeStats(userId);

      sendSuccess(res, { stats });
    } catch (error) {
      next(error);
    }
  };
}

export default new ResumeController();
