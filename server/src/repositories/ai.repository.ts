import { PrismaClient, AIFeedback, Prisma } from '@prisma/client';
import { BaseRepository } from './base.repository';
import logger from '@config/logger';

/**
 * AI Feedback Repository
 * Handles all AI feedback and logging operations
 */
export class AIRepository extends BaseRepository<
  AIFeedback,
  Prisma.AIFeedbackCreateInput,
  Prisma.AIFeedbackUpdateInput
> {
  constructor(prisma: PrismaClient) {
    super(prisma, prisma.aIFeedback, 'AIFeedback');
  }

  /**
   * Log AI feedback
   */
  async logFeedback(data: {
    userId: string;
    resumeId?: string;
    sectionId?: string;
    moduleName: string;
    originalText: string;
    aiResponse: string;
    tokenUsage: number;
  }): Promise<AIFeedback> {
    try {
      return await this.model.create({
        data: {
          userId: data.userId,
          resumeId: data.resumeId,
          sectionId: data.sectionId,
          moduleName: data.moduleName as any,
          originalText: data.originalText,
          aiResponse: data.aiResponse,
          tokenUsage: data.tokenUsage,
        },
      });
    } catch (error) {
      logger.error(`Error logging AI feedback`, error);
      throw error;
    }
  }

  /**
   * Get user's AI feedback history
   */
  async getUserFeedbackHistory(
    userId: string,
    moduleName?: string,
    page: number = 1,
    limit: number = 20
  ) {
    try {
      const skip = (page - 1) * limit;
      const where: any = { userId };

      if (moduleName) {
        where.moduleName = moduleName as any;
      }

      const [feedbacks, total] = await Promise.all([
        this.model.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            resume: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        }),
        this.model.count({ where }),
      ]);

      return {
        data: feedbacks,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      logger.error(`Error getting user feedback history: ${userId}`, error);
      throw error;
    }
  }

  /**
   * Get feedback for a specific resume
   */
  async getResumeFeedback(resumeId: string) {
    try {
      return await this.model.findMany({
        where: { resumeId },
        orderBy: { createdAt: 'desc' },
        include: {
          section: {
            select: {
              id: true,
              sectionType: true,
            },
          },
        },
      });
    } catch (error) {
      logger.error(`Error getting resume feedback: ${resumeId}`, error);
      throw error;
    }
  }

  /**
   * Get feedback for a specific section
   */
  async getSectionFeedback(sectionId: string) {
    try {
      return await this.model.findMany({
        where: { sectionId },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      logger.error(`Error getting section feedback: ${sectionId}`, error);
      throw error;
    }
  }

  /**
   * Rate AI feedback helpfulness
   */
  async rateFeedback(feedbackId: string, rating: number): Promise<AIFeedback> {
    try {
      return await this.model.update({
        where: { id: feedbackId },
        data: { helpfulnessRating: rating },
      });
    } catch (error) {
      logger.error(`Error rating feedback: ${feedbackId}`, error);
      throw error;
    }
  }

  /**
   * Get AI usage statistics for user
   */
  async getUserAIStats(userId: string) {
    try {
      const [totalRequests, totalTokens, byModule] = await Promise.all([
        this.model.count({ where: { userId } }),
        this.model.aggregate({
          where: { userId },
          _sum: { tokenUsage: true },
        }),
        this.model.groupBy({
          by: ['moduleName'],
          where: { userId },
          _count: true,
          _sum: { tokenUsage: true },
        }),
      ]);

      return {
        totalRequests,
        totalTokens: totalTokens._sum.tokenUsage || 0,
        byModule: byModule.map((item: any) => ({
          module: item.moduleName,
          count: item._count,
          tokens: item._sum.tokenUsage || 0,
        })),
      };
    } catch (error) {
      logger.error(`Error getting user AI stats: ${userId}`, error);
      throw error;
    }
  }

  /**
   * Get AI usage statistics by date range
   */
  async getAIStatsByDateRange(startDate: Date, endDate: Date) {
    try {
      const feedbacks = await this.model.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: {
          moduleName: true,
          tokenUsage: true,
          createdAt: true,
        },
      });

      const stats = {
        totalRequests: feedbacks.length,
        totalTokens: feedbacks.reduce((sum: number, f: any) => sum + f.tokenUsage, 0),
        byModule: {} as Record<string, { count: number; tokens: number }>,
        byDate: {} as Record<string, { count: number; tokens: number }>,
      };

      feedbacks.forEach((feedback: any) => {
        // By module
        if (!stats.byModule[feedback.moduleName]) {
          stats.byModule[feedback.moduleName] = { count: 0, tokens: 0 };
        }
        stats.byModule[feedback.moduleName]!.count++;
        stats.byModule[feedback.moduleName]!.tokens += feedback.tokenUsage;

        // By date
        const dateKey = feedback.createdAt.toISOString().split('T')[0];
        if (!stats.byDate[dateKey]) {
          stats.byDate[dateKey] = { count: 0, tokens: 0 };
        }
        stats.byDate[dateKey]!.count++;
        stats.byDate[dateKey]!.tokens += feedback.tokenUsage;
      });

      return stats;
    } catch (error) {
      logger.error(`Error getting AI stats by date range`, error);
      throw error;
    }
  }

  /**
   * Get top AI modules by usage
   */
  async getTopAIModules(limit: number = 10) {
    try {
      const results = await this.model.groupBy({
        by: ['moduleName'],
        _count: true,
        _sum: { tokenUsage: true },
        orderBy: { _count: { moduleName: 'desc' } },
        take: limit,
      });

      return results.map((item: any) => ({
        module: item.moduleName,
        count: item._count,
        tokens: item._sum.tokenUsage || 0,
      }));
    } catch (error) {
      logger.error(`Error getting top AI modules`, error);
      throw error;
    }
  }

  /**
   * Get average helpfulness rating by module
   */
  async getHelpfulnessByModule() {
    try {
      const feedbacks = await this.model.findMany({
        where: {
          helpfulnessRating: { not: null },
        },
        select: {
          moduleName: true,
          helpfulnessRating: true,
        },
      });

      const byModule: Record<string, { total: number; count: number }> = {};

      feedbacks.forEach((feedback: any) => {
        if (!byModule[feedback.moduleName]) {
          byModule[feedback.moduleName] = { total: 0, count: 0 };
        }
        byModule[feedback.moduleName]!.total += feedback.helpfulnessRating || 0;
        byModule[feedback.moduleName]!.count++;
      });

      return Object.entries(byModule).map(([module, data]) => ({
        module,
        averageRating: data.total / data.count,
        count: data.count,
      }));
    } catch (error) {
      logger.error(`Error getting helpfulness by module`, error);
      throw error;
    }
  }

  /**
   * Delete old feedback (cleanup job)
   */
  async deleteOldFeedback(daysOld: number = 90): Promise<{ count: number }> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      return await this.model.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate,
          },
        },
      });
    } catch (error) {
      logger.error(`Error deleting old feedback`, error);
      throw error;
    }
  }
}
