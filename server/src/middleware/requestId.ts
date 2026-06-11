import type { Request, Response, NextFunction } from 'express';
import { generateRequestId } from '@utils/helpers';

/**
 * Express middleware that validates or appends a tracing request identifier.
 */
export const requestIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Read request ID from incoming headers if already set by an upstream reverse proxy
  const reqId = (req.headers['x-request-id'] as string) || generateRequestId();

  // Attach to Express request contexts and locals for downstream logger access
  req.headers['x-request-id'] = reqId;
  res.locals.requestId = reqId;

  // Add trace ID back to client response header
  res.setHeader('X-Request-ID', reqId);

  next();
};

export default requestIdMiddleware;
