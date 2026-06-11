import type { Request, Response, NextFunction } from 'express';
import type { JWTPayload } from '@resume-ai/shared';
import { verifyAccessToken } from '@utils/jwt';
import { AuthenticationError } from '@errors/index';

// Declare merge Express Request interface to include the authenticated user payload.
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * Extracts bearer token from Express authorization headers.
 */
const extractBearerToken = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split(' ')[1];
  return token ? token.trim() : null;
};

/**
 * Express middleware that enforces JWT authentication.
 */
export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const token = extractBearerToken(req);
    if (!token) {
      throw new AuthenticationError('Access token is missing or malformed');
    }

    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Express middleware that checks for JWT optional authentication.
 */
export const optionalAuth = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const token = extractBearerToken(req);
    if (token) {
      const payload = verifyAccessToken(token);
      req.user = payload;
    }
    next();
  } catch {
    // Gracefully ignore error in optional context and continue request pipeline
    next();
  }
};
