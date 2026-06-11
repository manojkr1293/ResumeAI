import type { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import {
  AppError,
  NotFoundError,
  ConflictError,
  ValidationError,
  AuthenticationError,
  InternalError,
} from '@errors/index';
import logger from '@config/logger';
import { sendError } from '@utils/response';
import env from '@config/env';
import prisma from '@config/database';

/**
 * Custom mapping utility that translates Prisma Client engine errors into standard AppErrors.
 */
const mapPrismaError = (error: Prisma.PrismaClientKnownRequestError): AppError => {
  switch (error.code) {
    case 'P2002': {
      const targetField = (error.meta?.target as string[])?.join(', ') || 'field';
      return new ConflictError(`A resource with the same ${targetField} already exists.`);
    }
    case 'P2025':
      return new NotFoundError(error.message || 'The requested resource was not found.');
    case 'P2003':
      return new ValidationError('Foreign key constraint failed. Referenced record does not exist.');
    default:
      return new InternalError(`Database error: ${error.message} (Code: ${error.code})`, error);
  }
};

/**
 * Global Express Error Handler Middleware.
 * Intercepts all operational and system exceptions, logging details, mapping engines, and returning structured responses.
 */
export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  const requestId = (res.locals.requestId as string) || 'system';
  let mappedError: AppError;

  // 1. Handle Known AppErrors
  if (err instanceof AppError) {
    mappedError = err;
  }
  // 2. Handle Prisma Client Known Request Errors
  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    mappedError = mapPrismaError(err);
  }
  // 3. Handle Other Prisma Exceptions
  else if (err instanceof Prisma.PrismaClientValidationError || err instanceof Prisma.PrismaClientUnknownRequestError) {
    mappedError = new ValidationError('Database validation or request structure failed', undefined, err);
  }
  // 4. Handle JSON Web Token Errors (Expired/Invalid signatures)
  else if (err && typeof err === 'object' && 'name' in err && (err as { name: string }).name === 'JsonWebTokenError') {
    mappedError = new AuthenticationError('Token signature is invalid or corrupt', err as Error);
  } else if (err && typeof err === 'object' && 'name' in err && (err as { name: string }).name === 'TokenExpiredError') {
    mappedError = new AuthenticationError('Token lease duration has expired', err as Error);
  }
  // 5. Handle Unknown Native Standard Errors
  else if (err instanceof Error) {
    mappedError = new InternalError(err.message, err);
  }
  // 6. Catch-All for Untyped Exceptions
  else {
    mappedError = new InternalError('An unexpected server error occurred');
  }

  // Log error using Winston
  const logMsg = `${req.method} ${req.url} - Error Code: ${mappedError.code} | Message: ${mappedError.message}`;
  if (mappedError.statusCode >= 500) {
    logger.error(logMsg, { requestId, stack: (err as Error)?.stack });
  } else {
    logger.warn(logMsg, { requestId });
  }

  void prisma.analyticsEvent.create({
    data: {
      userId: (req as any).user?.userId || null,
      sessionId: req.get('x-session-id') || requestId,
      eventType: 'api_error',
      path: req.originalUrl,
      metadata: {
        method: req.method,
        statusCode: mappedError.statusCode,
        code: mappedError.code,
        message: mappedError.message,
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent') || null,
    },
  }).catch(() => undefined);

  // Strip sensitive detail info for production environment on Internal Server Errors
  if (env.NODE_ENV === 'production' && mappedError.statusCode === 500) {
    mappedError = new InternalError('An unexpected server error occurred');
  }

  sendError(res, mappedError);
};

/**
 * Express middleware that catches 404 Route Mismatches.
 * Forwards a NotFoundError down the stack to the global errorHandler.
 */
export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  next(new NotFoundError(`Resource path '${req.method} ${req.originalUrl}' does not exist.`));
};

export default errorHandler;
