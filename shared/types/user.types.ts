// ─── User Domain Types ───────────────────────────────────────────────────────

/**
 * Experience level classification for resume tailoring
 * and AI prompt calibration.
 */
export enum ExperienceLevel {
  INTERN = 'INTERN',
  ENTRY = 'ENTRY',
  MID = 'MID',
  SENIOR = 'SENIOR',
  LEAD = 'LEAD',
  EXECUTIVE = 'EXECUTIVE',
}

/**
 * Supported UI / content languages.
 */
export enum PreferredLanguage {
  EN = 'en',
  HI = 'hi',
  ES = 'es',
  FR = 'fr',
  DE = 'de',
  ZH = 'zh',
  JA = 'ja',
  KO = 'ko',
  PT = 'pt',
  AR = 'ar',
}

/**
 * OAuth providers supported for social login.
 */
export enum OAuthProvider {
  GOOGLE = 'GOOGLE',
  GITHUB = 'GITHUB',
  LINKEDIN = 'LINKEDIN',
}

// ─── Core Interfaces ─────────────────────────────────────────────────────────

/**
 * Full user entity as stored in the database.
 */
export interface User {
  /** UUID primary key */
  readonly id: string;
  /** Unique email address */
  email: string;
  /** Bcrypt / argon2 hashed password — never exposed to clients */
  passwordHash: string;
  /** User's display name */
  fullName: string;
  /** URL to the avatar image (nullable) */
  avatarUrl: string | null;
  /** The job title / role the user is targeting */
  targetRole: string | null;
  /** Self-reported experience level */
  experienceLevel: ExperienceLevel;
  /** Preferred UI language */
  preferredLang: PreferredLanguage;
  /** OAuth provider if the account was created via social login */
  oauthProvider: OAuthProvider | null;
  /** OAuth provider user ID */
  oauthUid: string | null;
  /** Soft-delete / deactivation flag */
  isActive: boolean;
  /** Whether the user has confirmed their email */
  emailVerified: boolean;
  /** ISO-8601 creation timestamp */
  readonly createdAt: string;
  /** ISO-8601 last-update timestamp */
  updatedAt: string;
}

/**
 * Public-facing user profile — sensitive fields stripped.
 */
export interface UserProfile
  extends Omit<User, 'passwordHash' | 'oauthUid'> {}

// ─── DTOs ────────────────────────────────────────────────────────────────────

/**
 * Payload for creating a new user account (internal / admin).
 */
export interface CreateUserDTO {
  email: string;
  passwordHash: string;
  fullName: string;
  avatarUrl?: string | null;
  targetRole?: string | null;
  experienceLevel?: ExperienceLevel;
  preferredLang?: PreferredLanguage;
  oauthProvider?: OAuthProvider | null;
  oauthUid?: string | null;
}

/**
 * Payload for patching user profile fields.
 */
export interface UpdateUserDTO {
  fullName?: string;
  avatarUrl?: string | null;
  targetRole?: string | null;
  experienceLevel?: ExperienceLevel;
  preferredLang?: PreferredLanguage;
}

/**
 * Credentials submitted for email + password login.
 */
export interface LoginDTO {
  email: string;
  password: string;
}

/**
 * Payload submitted during self-service registration.
 */
export interface RegisterDTO {
  email: string;
  password: string;
  fullName: string;
  targetRole?: string | null;
  experienceLevel?: ExperienceLevel;
  preferredLang?: PreferredLanguage;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

/**
 * JWT token pair returned after successful authentication.
 */
export interface AuthTokens {
  /** Short-lived access token (Bearer) */
  accessToken: string;
  /** Long-lived refresh token */
  refreshToken: string;
  /** Access token TTL in seconds */
  expiresIn: number;
}

/**
 * Combined response returned on login / register — profile + tokens.
 */
export interface AuthenticatedUser {
  user: UserProfile;
  tokens: AuthTokens;
}

/**
 * Decoded JWT payload embedded in the access token.
 */
export interface JWTPayload {
  /** User UUID */
  userId: string;
  /** User email */
  email: string;
  /** Current subscription tier for feature-gating */
  subscriptionTier: string;
  /** Issued-at (epoch seconds) */
  iat?: number;
  /** Expiration (epoch seconds) */
  exp?: number;
}
