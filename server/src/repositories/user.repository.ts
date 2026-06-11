import { PrismaClient, User, Prisma } from '@prisma/client';
import { BaseRepository } from './base.repository';
import { hashPassword } from '@utils/password';
import { logger } from '@config/logger';

/**
 * User Repository
 * Handles all user-related database operations
 */
export class UserRepository extends BaseRepository<
  User,
  Prisma.UserCreateInput,
  Prisma.UserUpdateInput
> {
  constructor(prisma: PrismaClient) {
    super(prisma, prisma.user, 'User');
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    try {
      return await this.model.findUnique({
        where: { email },
      });
    } catch (error) {
      logger.error(`Error finding user by email: ${email}`, error);
      throw error;
    }
  }

  /**
   * Find user by OAuth provider and UID
   */
  async findByOAuth(provider: string, uid: string): Promise<User | null> {
    try {
      return await this.model.findFirst({
        where: {
          oauthProvider: provider as any,
          oauthUid: uid,
        },
      });
    } catch (error) {
      logger.error(`Error finding user by OAuth: ${provider}`, error);
      throw error;
    }
  }

  /**
   * Create a new user with password hashing
   */
  async createWithPassword(data: {
    email: string;
    password: string;
    fullName: string;
    experienceLevel?: string;
    preferredLang?: string;
  }): Promise<User> {
    try {
      const passwordHash = await hashPassword(data.password);
      return await this.model.create({
        data: {
          email: data.email,
          passwordHash: passwordHash,
          fullName: data.fullName,
          experienceLevel: data.experienceLevel as any || 'ENTRY',
          preferredLang: data.preferredLang as any || 'en',
        },
      });
    } catch (error) {
      logger.error(`Error creating user with password`, error);
      throw error;
    }
  }

  /**
   * Create user via OAuth
   */
  async createWithOAuth(data: {
    email: string;
    fullName: string;
    provider: string;
    uid: string;
    avatarUrl?: string;
  }): Promise<User> {
    try {
      return await this.model.create({
        data: {
          email: data.email,
          fullName: data.fullName,
          oauthProvider: data.provider as any,
          oauthUid: data.uid,
          avatarUrl: data.avatarUrl,
          passwordHash: '', // OAuth users don't have password
          emailVerified: true,
        },
      });
    } catch (error) {
      logger.error(`Error creating user with OAuth`, error);
      throw error;
    }
  }

  /**
   * Update user password
   */
  async updatePassword(userId: string, newPassword: string): Promise<User> {
    try {
      const passwordHash = await hashPassword(newPassword);
      return await this.model.update({
        where: { id: userId },
        data: { passwordHash },
      });
    } catch (error) {
      logger.error(`Error updating password for user: ${userId}`, error);
      throw error;
    }
  }

  /**
   * Verify user email
   */
  async verifyEmail(userId: string): Promise<User> {
    try {
      return await this.model.update({
        where: { id: userId },
        data: { emailVerified: true },
      });
    } catch (error) {
      logger.error(`Error verifying email for user: ${userId}`, error);
      throw error;
    }
  }

  /**
   * Deactivate user account
   */
  async deactivateUser(userId: string): Promise<User> {
    try {
      return await this.model.update({
        where: { id: userId },
        data: { isActive: false },
      });
    } catch (error) {
      logger.error(`Error deactivating user: ${userId}`, error);
      throw error;
    }
  }

  /**
   * Get user with subscription
   */
  async getUserWithSubscription(userId: string): Promise<User | null> {
    try {
      return await this.model.findUnique({
        where: { id: userId },
        include: {
          subscription: true,
        },
      });
    } catch (error) {
      logger.error(`Error finding user with subscription: ${userId}`, error);
      throw error;
    }
  }

  /**
   * Get user with resume count
   */
  async getUserWithResumeCount(userId: string): Promise<User | null> {
    try {
      return await this.model.findUnique({
        where: { id: userId },
        include: {
          _count: {
            select: { resumes: true },
          },
        },
      });
    } catch (error) {
      logger.error(`Error finding user with resume count: ${userId}`, error);
      throw error;
    }
  }

  /**
   * Search users by name or email (admin function)
   */
  async searchUsers(query: string, page: number = 1, limit: number = 20) {
    try {
      const skip = (page - 1) * limit;
      const [users, total] = await Promise.all([
        this.model.findMany({
          where: {
            OR: [
              { fullName: { contains: query, mode: 'insensitive' } },
              { email: { contains: query, mode: 'insensitive' } },
            ],
          },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        this.model.count({
          where: {
            OR: [
              { fullName: { contains: query, mode: 'insensitive' } },
              { email: { contains: query, mode: 'insensitive' } },
            ],
          },
        }),
      ]);

      return {
        data: users,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      logger.error(`Error searching users with query: ${query}`, error);
      throw error;
    }
  }

  /**
   * Get users by experience level
   */
  async getUsersByExperienceLevel(
    experienceLevel: string,
    page: number = 1,
    limit: number = 20
  ) {
    try {
      const skip = (page - 1) * limit;
      const [users, total] = await Promise.all([
        this.model.findMany({
          where: { experienceLevel: experienceLevel as any },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        this.model.count({
          where: { experienceLevel: experienceLevel as any },
        }),
      ]);

      return {
        data: users,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      logger.error(`Error finding users by experience level: ${experienceLevel}`, error);
      throw error;
    }
  }

  /**
   * Get active users count
   */
  async getActiveUsersCount(): Promise<number> {
    try {
      return await this.model.count({
        where: { isActive: true },
      });
    } catch (error) {
      logger.error(`Error counting active users`, error);
      throw error;
    }
  }

  /**
   * Get users registered in date range
   */
  async getUsersRegisteredInDateRange(startDate: Date, endDate: Date): Promise<User[]> {
    try {
      return await this.model.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      logger.error(`Error finding users in date range`, error);
      throw error;
    }
  }
}
