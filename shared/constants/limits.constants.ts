import { SubscriptionPlan } from '../types/subscription.types';

/**
 * Limit parameters configured per subscription plan tier.
 */
export const PLAN_LIMITS = {
  [SubscriptionPlan.FREE]: {
    resumesMax: 3,
    aiCallsPerDay: 5,
    templatesAccess: 'basic',
    exportFormats: ['PDF'],
    storageGB: 0.1,
  },
  [SubscriptionPlan.STARTER]: {
    resumesMax: 10,
    aiCallsPerDay: 50,
    templatesAccess: 'standard',
    exportFormats: ['PDF', 'DOCX'],
    storageGB: 1.0,
  },
  [SubscriptionPlan.PRO]: {
    resumesMax: -1, // -1 means unlimited
    aiCallsPerDay: 500,
    templatesAccess: 'all',
    exportFormats: ['PDF', 'DOCX'],
    storageGB: 5.0,
  },
} as const;

/**
 * Standard API rate limits (requests per minute) allowed per plan.
 */
export const API_RATE_LIMITS = {
  [SubscriptionPlan.FREE]: 60,
  [SubscriptionPlan.STARTER]: 150,
  [SubscriptionPlan.PRO]: 300,
} as const;

/**
 * Max AI operations/tokens/credits allowed per day based on plan.
 */
export const AI_DAILY_LIMITS = {
  [SubscriptionPlan.FREE]: 5,
  [SubscriptionPlan.STARTER]: 50,
  [SubscriptionPlan.PRO]: 500,
} as const;

/** Size limitation in megabytes for file uploads (resumes/avatars) */
export const MAX_FILE_SIZE_MB = 10;

/** Maximum allowable section segments within a single resume document */
export const MAX_SECTIONS_PER_RESUME = 15;

/** Max resume thresholds per tier */
export const MAX_RESUMES_FREE = 3;
export const MAX_RESUMES_STARTER = 10;
export const MAX_RESUMES_PRO = -1;
