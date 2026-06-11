import { PrismaClient, Resume, Prisma } from '@prisma/client';
import { BaseRepository } from './base.repository';
import logger from '@config/logger';

/**
 * Resume Repository
 * Handles all resume-related database operations
 */
export class ResumeRepository extends BaseRepository<
  Resume,
  Prisma.ResumeCreateInput,
  Prisma.ResumeUpdateInput
> {
  constructor(prisma: PrismaClient) {
    super(prisma, prisma.resume, 'Resume');
  }

  /**
   * Find user's primary resume
   */
  async findPrimaryResume(userId: string): Promise<Resume | null> {
    try {
      return await this.model.findFirst({
        where: {
          userId,
          isPrimary: true,
          status: { not: 'ARCHIVED' },
        },
      });
    } catch (error) {
      logger.error(`Error finding primary resume for user: ${userId}`, error);
      throw error;
    }
  }

  /**
   * Find all resumes for a user
   */
  async findByUserId(userId: string, includeArchived: boolean = false): Promise<Resume[]> {
    try {
      return await this.model.findMany({
        where: {
          userId,
          ...(includeArchived ? {} : { status: { not: 'ARCHIVED' } }),
        },
        orderBy: { updatedAt: 'desc' },
        include: {
          template: true,
          sections: {
            orderBy: { sectionOrder: 'asc' },
          },
        },
      });
    } catch (error) {
      logger.error(`Error finding resumes for user: ${userId}`, error);
      throw error;
    }
  }

  /**
   * Find resume with all sections
   */
  async findWithSections(resumeId: string): Promise<any | null> {
    try {
      return await this.model.findUnique({
        where: { id: resumeId },
        include: {
          sections: {
            orderBy: { sectionOrder: 'asc' },
          },
          template: true,
          versions: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      });
    } catch (error) {
      logger.error(`Error finding resume with sections: ${resumeId}`, error);
      throw error;
    }
  }

  /**
   * Create a new resume
   */
  async createResume(data: {
    userId: string;
    title: string;
    templateId?: string;
    isPrimary?: boolean;
  }): Promise<Resume> {
    try {
      // If this is set as primary, unset other primary resumes
      if (data.isPrimary) {
        await this.model.updateMany({
          where: { userId: data.userId },
          data: { isPrimary: false },
        });
      }

      return await this.model.create({
        data: {
          userId: data.userId,
          title: data.title,
          ...(data.templateId ? { templateId: data.templateId } : {}),
          isPrimary: data.isPrimary || false,
          status: 'DRAFT',
        },
        include: {
          template: true,
        },
      });
    } catch (error) {
      logger.error(`Error creating resume`, error);
      throw error;
    }
  }

  /**
   * Update resume scores
   */
  async updateScores(
    resumeId: string,
    scores: { atsScore?: number; overallScore?: number }
  ): Promise<Resume> {
    try {
      return await this.model.update({
        where: { id: resumeId },
        data: {
          ...(scores.atsScore !== undefined && { atsScore: scores.atsScore }),
          ...(scores.overallScore !== undefined && { overallScore: scores.overallScore }),
        },
      });
    } catch (error) {
      logger.error(`Error updating scores for resume: ${resumeId}`, error);
      throw error;
    }
  }

  /**
   * Set resume as primary
   */
  async setAsPrimary(resumeId: string, userId: string): Promise<Resume> {
    try {
      // Unset other primary resumes
      await this.model.updateMany({
        where: { userId },
        data: { isPrimary: false },
      });

      // Set this resume as primary
      return await this.model.update({
        where: { id: resumeId },
        data: { isPrimary: true },
      });
    } catch (error) {
      logger.error(`Error setting resume as primary: ${resumeId}`, error);
      throw error;
    }
  }

  /**
   * Archive resume
   */
  async archiveResume(resumeId: string): Promise<Resume> {
    try {
      return await this.model.update({
        where: { id: resumeId },
        data: { status: 'ARCHIVED', isPrimary: false },
      });
    } catch (error) {
      logger.error(`Error archiving resume: ${resumeId}`, error);
      throw error;
    }
  }

  /**
   * Duplicate resume
   */
  async duplicateResume(resumeId: string, newTitle: string): Promise<Resume> {
    try {
      const originalResume = await this.findWithSections(resumeId);
      if (!originalResume) {
        throw new Error('Resume not found');
      }

      return await this.transaction(async (tx) => {
        // Create new resume
        const newResume = await tx.resume.create({
          data: {
            userId: originalResume.userId,
            title: newTitle,
            templateId: originalResume.templateId,
            status: 'DRAFT',
            isPrimary: false,
          },
        });

        // Copy all sections
        for (const section of originalResume.sections) {
          await tx.resumeSection.create({
            data: {
              resumeId: newResume.id,
              sectionType: section.sectionType,
              sectionOrder: section.sectionOrder,
              content: section.content,
              isVisible: section.isVisible,
              aiScore: section.aiScore,
            },
          });
        }

        return newResume;
      });
    } catch (error) {
      logger.error(`Error duplicating resume: ${resumeId}`, error);
      throw error;
    }
  }

  /**
   * Get resumes by template
   */
  async findByTemplate(templateId: string, page: number = 1, limit: number = 20) {
    try {
      const skip = (page - 1) * limit;
      const [resumes, total] = await Promise.all([
        this.model.findMany({
          where: { templateId },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        }),
        this.model.count({ where: { templateId } }),
      ]);

      return {
        data: resumes,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      logger.error(`Error finding resumes by template: ${templateId}`, error);
      throw error;
    }
  }

  /**
   * Get resumes by status
   */
  async findByStatus(status: string, page: number = 1, limit: number = 20) {
    try {
      const skip = (page - 1) * limit;
      const [resumes, total] = await Promise.all([
        this.model.findMany({
          where: { status: status as any },
          skip,
          take: limit,
          orderBy: { updatedAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        }),
        this.model.count({ where: { status: status as any } }),
      ]);

      return {
        data: resumes,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      logger.error(`Error finding resumes by status: ${status}`, error);
      throw error;
    }
  }

  /**
   * Get top scoring resumes
   */
  async getTopScoringResumes(limit: number = 10): Promise<Resume[]> {
    try {
      return await this.model.findMany({
        where: { status: 'ACTIVE' },
        orderBy: [{ overallScore: 'desc' }, { atsScore: 'desc' }],
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
            },
          },
          template: true,
        },
      });
    } catch (error) {
      logger.error(`Error getting top scoring resumes`, error);
      throw error;
    }
  }

  /**
   * Get resume statistics for user
   */
  async getUserResumeStats(userId: string) {
    try {
      const [total, active, archived, avgAtsScore, avgOverallScore] = await Promise.all([
        this.model.count({ where: { userId } }),
        this.model.count({ where: { userId, status: 'ACTIVE' } }),
        this.model.count({ where: { userId, status: 'ARCHIVED' } }),
        this.model.aggregate({
          where: { userId, status: { not: 'ARCHIVED' } },
          _avg: { atsScore: true },
        }),
        this.model.aggregate({
          where: { userId, status: { not: 'ARCHIVED' } },
          _avg: { overallScore: true },
        }),
      ]);

      return {
        total,
        active,
        archived,
        avgAtsScore: avgAtsScore._avg.atsScore || 0,
        avgOverallScore: avgOverallScore._avg.overallScore || 0,
      };
    } catch (error) {
      logger.error(`Error getting resume stats for user: ${userId}`, error);
      throw error;
    }
  }

  /**
   * Search resumes by title
   */
  async searchResumes(query: string, userId?: string, page: number = 1, limit: number = 20) {
    try {
      const skip = (page - 1) * limit;
      const where: any = {
        title: { contains: query, mode: 'insensitive' },
      };

      if (userId) {
        where.userId = userId;
      }

      const [resumes, total] = await Promise.all([
        this.model.findMany({
          where,
          skip,
          take: limit,
          orderBy: { updatedAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
              },
            },
            template: true,
          },
        }),
        this.model.count({ where }),
      ]);

      return {
        data: resumes,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      logger.error(`Error searching resumes with query: ${query}`, error);
      throw error;
    }
  }
}
