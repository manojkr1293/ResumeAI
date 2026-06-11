import type { Request, Response, NextFunction } from 'express';
import { SubscriptionPlan } from '@resume-ai/shared';
import { AuthorizationError, AuthenticationError } from '@errors/index';

/**
 * Authorization guard factory that restricts route access based on plan tiers.
 * MUST be applied immediately after JWT authenticate middleware.
 */
export const authorize = (...allowedPlans: SubscriptionPlan[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const user = req.user;

    if (!user) {
      next(new AuthenticationError('Authentication is required for authorization validation'));
      return;
    }

    const userTier = user.subscriptionTier as SubscriptionPlan;

    // Check if the user subscription tier is contained inside the whitelist
    if (allowedPlans.includes(userTier)) {
      next();
    } else {
      next(
        new AuthorizationError(
          `Insufficient privileges. Plan tier '${userTier}' does not have access. Allowed tiers: ${allowedPlans.join(', ')}.`
        )
      );
    }
  };
};

export default authorize;
