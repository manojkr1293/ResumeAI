import { PrismaClient } from '@prisma/client';
import logger from '@config/logger';

/**
 * Base Repository Class
 * Provides common CRUD operations and query building utilities
 * All specific repositories should extend this class
 */
export abstract class BaseRepository<TModel, TCreateInput, TUpdateInput> {
  protected prisma: PrismaClient;
  protected model: any;
  protected modelName: string;

  constructor(prisma: PrismaClient, model: any, modelName: string) {
    this.prisma = prisma;
    this.model = model;
    this.modelName = modelName;
  }

  /**
   * Find a single record by ID
   */
  async findById(id: string, options?: any): Promise<TModel | null> {
    try {
      return await this.model.findFirst({
        where: { id },
        ...options,
      });
    } catch (error) {
      logger.error(`Error finding ${this.modelName} by id: ${id}`, error);
      throw error;
    }
  }

  /**
   * Find a single record by where clause
   */
  async findOne(where: any, options?: any): Promise<TModel | null> {
    try {
      return await this.model.findFirst({
        where,
        ...options,
      });
    } catch (error) {
      logger.error(`Error finding one ${this.modelName}`, error);
      throw error;
    }
  }

  /**
   * Find multiple records with pagination
   */
  async findMany(where?: any, options?: any): Promise<TModel[]> {
    try {
      return await this.model.findMany({
        where,
        ...options,
      });
    } catch (error) {
      logger.error(`Error finding many ${this.modelName}`, error);
      throw error;
    }
  }

  /**
   * Find records with pagination
   */
  async findPaginated(
    where?: any,
    options?: any,
    page: number = 1,
    limit: number = 10
  ): Promise<{ data: any[]; total: number; page: number; limit: number; totalPages: number }> {
    try {
      const skip = (page - 1) * limit;
      const [data, total] = await Promise.all([
        this.model.findMany({
          where,
          skip,
          take: limit,
          ...options,
        }),
        this.model.count({ where }),
      ]);

      return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      logger.error(`Error finding paginated ${this.modelName}`, error);
      throw error;
    }
  }

  /**
   * Create a new record
   */
  async create(data: TCreateInput, options?: any): Promise<TModel> {
    try {
      const result = await this.model.create({
        data,
        ...options,
      });
      logger.info(`Created ${this.modelName} with id: ${result.id}`);
      return result;
    } catch (error) {
      logger.error(`Error creating ${this.modelName}`, error);
      throw error;
    }
  }

  /**
   * Create multiple records
   */
  async createMany(data: TCreateInput[], options?: any): Promise<{ count: number }> {
    try {
      const result = await this.model.createMany({
        data,
        ...options,
      });
      logger.info(`Created ${result.count} ${this.modelName} records`);
      return result;
    } catch (error) {
      logger.error(`Error creating many ${this.modelName}`, error);
      throw error;
    }
  }

  /**
   * Update a record by ID
   */
  async update(id: string, data: TUpdateInput, options?: any): Promise<TModel> {
    try {
      const result = await this.model.update({
        where: { id },
        data,
        ...options,
      });
      logger.info(`Updated ${this.modelName} with id: ${id}`);
      return result;
    } catch (error) {
      logger.error(`Error updating ${this.modelName} with id: ${id}`, error);
      throw error;
    }
  }

  /**
   * Update multiple records by where clause
   */
  async updateMany(where: any, data: TUpdateInput, options?: any): Promise<{ count: number }> {
    try {
      const result = await this.model.updateMany({
        where,
        data,
        ...options,
      });
      logger.info(`Updated ${result.count} ${this.modelName} records`);
      return result;
    } catch (error) {
      logger.error(`Error updating many ${this.modelName}`, error);
      throw error;
    }
  }

  /**
   * Delete a record by ID (soft delete if applicable)
   */
  async delete(id: string, options?: any): Promise<TModel> {
    try {
      const result = await this.model.delete({
        where: { id },
        ...options,
      });
      logger.info(`Deleted ${this.modelName} with id: ${id}`);
      return result;
    } catch (error) {
      logger.error(`Error deleting ${this.modelName} with id: ${id}`, error);
      throw error;
    }
  }

  /**
   * Delete multiple records by where clause
   */
  async deleteMany(where: any, options?: any): Promise<{ count: number }> {
    try {
      const result = await this.model.deleteMany({
        where,
        ...options,
      });
      logger.info(`Deleted ${result.count} ${this.modelName} records`);
      return result;
    } catch (error) {
      logger.error(`Error deleting many ${this.modelName}`, error);
      throw error;
    }
  }

  /**
   * Count records matching where clause
   */
  async count(where?: any): Promise<number> {
    try {
      return await this.model.count({ where });
    } catch (error) {
      logger.error(`Error counting ${this.modelName}`, error);
      throw error;
    }
  }

  /**
   * Check if a record exists
   */
  async exists(where: any): Promise<boolean> {
    try {
      const count = await this.model.count({ where });
      return count > 0;
    } catch (error) {
      logger.error(`Error checking existence of ${this.modelName}`, error);
      throw error;
    }
  }

  /**
   * Upsert a record (create if not exists, update if exists)
   */
  async upsert(where: any, create: TCreateInput, update: TUpdateInput, options?: any): Promise<TModel> {
    try {
      const result = await this.model.upsert({
        where,
        create,
        update,
        ...options,
      });
      logger.info(`Upserted ${this.modelName} with id: ${result.id}`);
      return result;
    } catch (error) {
      logger.error(`Error upserting ${this.modelName}`, error);
      throw error;
    }
  }

  /**
   * Transaction wrapper for complex operations
   */
  async transaction<R>(callback: (tx: any) => Promise<R>): Promise<R> {
    try {
      return await this.prisma.$transaction(callback);
    } catch (error) {
      logger.error(`Error executing transaction for ${this.modelName}`, error);
      throw error;
    }
  }

  /**
   * Execute raw SQL query (use sparingly, prefer Prisma methods)
   */
  async executeRaw<T = any>(query: string, parameters?: any[]): Promise<T[]> {
    try {
      return await this.prisma.$queryRawUnsafe(query, ...(parameters || []));
    } catch (error) {
      logger.error(`Error executing raw query for ${this.modelName}`, error);
      throw error;
    }
  }
}
