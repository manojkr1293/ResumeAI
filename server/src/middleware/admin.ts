import { Request, Response, NextFunction } from 'express';
import env from '../config/env';
import { AuthorizationError } from '../errors/index';

export const requireAdmin = (req: Request, _res: Response, next: NextFunction): void => {
  const email = ((req as any).user?.email || '').toLowerCase();
  const adminEmails = env.ADMIN_EMAILS
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  if (!email || !adminEmails.includes(email)) {
    next(new AuthorizationError('Admin access required'));
    return;
  }

  next();
};
