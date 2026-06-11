import rateLimit from 'express-rate-limit';
import type { Request, Response } from 'express';
import env from '@config/env';
import { RateLimitError } from '@errors/index';
import { sendError } from '@utils/response';

/**
 * Unique rate limit key generator.
 * Combines IP address and authenticated user ID to prevent account-wide/IP-wide evasion.
 */
const keyGenerator = (req: Request): string => {
  const userId = (req as any).user?.userId || '';
  const ip = req.ip || req.socket.remoteAddress || '';
  return userId ? `user:${userId}` : `ip:${ip}`;
};

/**
 * Standard error response handler when a client breaches rate limit thresholds.
 */
const rateLimitHandler = (req: Request, res: Response): void => {
  const err = new RateLimitError(
    `Too many requests. Rate limit is restricted to ${
      (req as any).user ? env.RATE_LIMIT_MAX_PRO : env.RATE_LIMIT_MAX_FREE
    } requests per ${env.RATE_LIMIT_WINDOW_MS / 60000} minute(s).`
  );
  sendError(res, err);
};

/**
 * Primary rate limiting middleware for general API endpoints.
 */
export const apiRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: (req: Request) => {
    // If client is a standard/pro user, give higher limit thresholds
    return (req as any).user ? env.RATE_LIMIT_MAX_PRO : env.RATE_LIMIT_MAX_FREE;
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
  handler: rateLimitHandler,
});

/**
 * Stricter rate limiting middleware to guard high-value authentication endpoints (login, register, reset).
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 10, // Strictest limit: 10 login / signup attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
  handler: (_req: Request, res: Response) => {
    const err = new RateLimitError('Too many authentication attempts. Please try again after 15 minutes.');
    sendError(res, err);
  },
});

export default apiRateLimiter;
