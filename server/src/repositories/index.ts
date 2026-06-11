import { PrismaClient } from '@prisma/client';
import prisma from '@config/database';
import { UserRepository } from './user.repository';
import { ResumeRepository } from './resume.repository';
import { AIRepository } from './ai.repository';

/**
 * Repository Factory
 * Centralized repository instances with singleton pattern
 */
class RepositoryFactory {
  private static instance: RepositoryFactory;
  private prisma: PrismaClient;
  private userRepository: UserRepository;
  private resumeRepository: ResumeRepository;
  private aiRepository: AIRepository;

  private constructor() {
    this.prisma = prisma;
    this.userRepository = new UserRepository(this.prisma);
    this.resumeRepository = new ResumeRepository(this.prisma);
    this.aiRepository = new AIRepository(this.prisma);
  }

  public static getInstance(): RepositoryFactory {
    if (!RepositoryFactory.instance) {
      RepositoryFactory.instance = new RepositoryFactory();
    }
    return RepositoryFactory.instance;
  }

  public get user(): UserRepository {
    return this.userRepository;
  }

  public get resume(): ResumeRepository {
    return this.resumeRepository;
  }

  public get ai(): AIRepository {
    return this.aiRepository;
  }

  public getPrisma(): PrismaClient {
    return this.prisma;
  }
}

/**
 * Export singleton repository instances
 */
export const repositories = RepositoryFactory.getInstance();

/**
 * Export individual repositories for direct access
 */
export { UserRepository } from './user.repository';
export { ResumeRepository } from './resume.repository';
export { AIRepository } from './ai.repository';
export { BaseRepository } from './base.repository';

/**
 * Default export
 */
export default repositories;
