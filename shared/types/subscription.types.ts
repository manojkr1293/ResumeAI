// ─── Subscription Types ──────────────────────────────────────────────────────

/**
 * Available subscription plan tiers.
 */
export enum SubscriptionPlan {
  FREE = 'FREE',
  STARTER = 'STARTER',
  PRO = 'PRO',
}

/**
 * Current status of a user's subscription.
 */
export enum SubscriptionStatus {
  /** Subscription is active and in good standing */
  ACTIVE = 'ACTIVE',
  /** User has cancelled; access continues until period end */
  CANCELLED = 'CANCELLED',
  /** Subscription period has ended */
  EXPIRED = 'EXPIRED',
  /** Payment failed; grace period in effect */
  PAST_DUE = 'PAST_DUE',
}

/**
 * Subscription entity as stored in the database.
 */
export interface Subscription {
  /** UUID primary key */
  readonly id: string;
  /** Foreign key to the user */
  readonly userId: string;
  /** Current plan tier */
  plan: SubscriptionPlan;
  /** Razorpay subscription ID (nullable for free tier) */
  razorpaySubId: string | null;
  /** Razorpay customer ID (nullable for free tier) */
  razorpayCustomerId: string | null;
  /** Current subscription status */
  status: SubscriptionStatus;
  /** ISO-8601 start of the current billing period */
  currentPeriodStart: string;
  /** ISO-8601 end of the current billing period */
  currentPeriodEnd: string;
  /** Whether the subscription will cancel at the end of the current period */
  cancelAtPeriodEnd: boolean;
  /** ISO-8601 creation timestamp */
  readonly createdAt: string;
  /** ISO-8601 last-update timestamp */
  updatedAt: string;
}

// ─── Plan Configuration ──────────────────────────────────────────────────────

/**
 * Quantitative limits applied per subscription plan.
 */
export interface PlanLimits {
  /** Maximum number of resumes (-1 = unlimited) */
  resumesMax: number;
  /** Maximum AI API calls allowed per day */
  aiCallsPerDay: number;
  /** Template access level: 'all' or 'free-only' */
  templatesAccess: 'all' | 'free-only';
  /** Allowed export formats */
  exportFormats: string[];
  /** Cloud storage quota in gigabytes */
  storageGB: number;
}

/**
 * Detailed information about a subscription plan for display.
 */
export interface PlanDetails {
  /** Display name (e.g. "Free", "Starter", "Pro") */
  name: string;
  /** Monthly price in smallest currency unit (e.g. paise) */
  price: number;
  /** ISO-4217 currency code (e.g. "INR") */
  currency: string;
  /** Marketing feature bullet points */
  features: string[];
  /** Quantitative plan limits */
  limits: PlanLimits;
}
