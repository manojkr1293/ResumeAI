import type { Request, Response, NextFunction } from 'express';
import type { AnyZodObject, ZodError } from 'zod';
import { ValidationError } from '@errors/index';
import type { ApiErrorDetail } from '@resume-ai/shared';

interface ValidationSchema {
  body?: AnyZodObject;
  query?: AnyZodObject;
  params?: AnyZodObject;
}

/**
 * Express middleware factory that validates requests against a Zod schema object.
 * Triggers ValidationError on schemas that mismatch, returning localized field-level errors.
 */
export const validate = (schemas: ValidationSchema) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (schemas.params) {
        req.params = await schemas.params.parseAsync(req.params);
      }
      if (schemas.query) {
        req.query = await schemas.query.parseAsync(req.query);
      }
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      next();
    } catch (error) {
      const zodError = error as ZodError;
      const details: ApiErrorDetail[] = zodError.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      
      next(new ValidationError('Request validation failed', details, zodError));
    }
  };
};

export default validate;
