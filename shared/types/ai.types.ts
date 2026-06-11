// ─── AI Module Types ─────────────────────────────────────────────────────────

/**
 * Supported OpenAI models for AI features.
 */
export type AIModel = 'gpt-4o' | 'gpt-4o-mini';

/**
 * Named AI modules available in the platform.
 */
export enum AIModuleName {
  /** Rewrites resume bullets for impact & clarity */
  BULLET_IMPROVER = 'BULLET_IMPROVER',
  /** Analyzes resume against ATS compatibility criteria */
  ATS_ANALYZER = 'ATS_ANALYZER',
  /** Extracts structured data from job descriptions */
  JD_EXTRACTOR = 'JD_EXTRACTOR',
  /** Interactive career coach chatbot */
  RESUME_COACH = 'RESUME_COACH',
  /** Brutally-honest resume critique (fun feature) */
  ROAST_ENGINE = 'ROAST_ENGINE',
  /** Multi-dimensional resume scoring engine */
  SCORING_ENGINE = 'SCORING_ENGINE',
  /** Generates practice interview questions from resume + JD */
  QUESTION_ENGINE = 'QUESTION_ENGINE',
  /** Simulates recruiter perspective review */
  RECRUITER_SIM = 'RECRUITER_SIM',
}

// ─── Bullet Improver ─────────────────────────────────────────────────────────

/**
 * Request to improve a single resume bullet point.
 */
export interface BulletImproveRequest {
  /** The original bullet text to improve */
  originalText: string;
  /** Optional context about the role / section */
  context?: string;
  /** Number of improved versions to generate */
  count?: number;
  /** Model to use for generation */
  model?: AIModel;
}

/**
 * Response containing improved bullet variants.
 */
export interface BulletImproveResponse {
  /** Original text that was submitted */
  originalText: string;
  /** Array of improved bullet text variants */
  improvedVersions: string[];
  /** Model that was used */
  model: AIModel;
  /** Total tokens consumed */
  tokensUsed: number;
}

// ─── Resume Scoring ──────────────────────────────────────────────────────────

/**
 * A single scoring dimension with feedback.
 */
export interface ScoreDimension {
  /** Dimension name (e.g. "Impact", "Brevity") */
  name: string;
  /** Achieved score */
  score: number;
  /** Maximum possible score for this dimension */
  maxScore: number;
  /** Qualitative feedback for this dimension */
  feedback: string;
}

/**
 * Request to score an entire resume.
 */
export interface ResumeScoreRequest {
  /** UUID of the resume to score */
  resumeId: string;
  /** Optional job description ID for contextual scoring */
  jobDescriptionId?: string;
  /** Model to use */
  model?: AIModel;
}

/**
 * Comprehensive scoring response.
 */
export interface ResumeScoreResponse {
  /** Overall composite score (0-100) */
  overallScore: number;
  /** Per-dimension breakdown */
  dimensions: ScoreDimension[];
  /** Actionable improvement suggestions */
  suggestions: string[];
  /** Model that was used */
  model: AIModel;
  /** Total tokens consumed */
  tokensUsed: number;
}

// ─── Coach Chat ──────────────────────────────────────────────────────────────

/**
 * Role of a participant in the coach conversation.
 */
export type CoachMessageRole = 'user' | 'assistant' | 'system';

/**
 * A single message in the coach conversation.
 */
export interface CoachMessage {
  /** Who sent this message */
  role: CoachMessageRole;
  /** Message text content */
  content: string;
  /** ISO-8601 timestamp */
  timestamp: string;
}

/**
 * Request for the AI resume coach.
 */
export interface CoachChatRequest {
  /** Resume ID for context */
  resumeId: string;
  /** Current conversation history */
  messages: CoachMessage[];
  /** Model to use */
  model?: AIModel;
}

/**
 * Response from the AI resume coach.
 */
export interface CoachChatResponse {
  /** The assistant's reply */
  reply: CoachMessage;
  /** Tokens consumed in this turn */
  tokensUsed: number;
}

// ─── Roast Engine ────────────────────────────────────────────────────────────

/**
 * Request for a brutal resume roast.
 */
export interface RoastRequest {
  /** UUID of the resume to roast */
  resumeId: string;
  /** Intensity of the roast */
  intensity?: 'mild' | 'medium' | 'savage';
  /** Model to use */
  model?: AIModel;
}

/**
 * Response containing the roast.
 */
export interface RoastResponse {
  /** The roast text */
  roastText: string;
  /** One-line humorous summary */
  headline: string;
  /** Actual constructive tips hidden behind the humor */
  constructiveTips: string[];
  /** Tokens consumed */
  tokensUsed: number;
}

// ─── AI Feedback Record ──────────────────────────────────────────────────────

/**
 * Persistent AI feedback record matching the `ai_feedback` DB table.
 */
export interface AIFeedback {
  /** UUID primary key */
  readonly id: string;
  /** Foreign key to the resume */
  readonly resumeId: string;
  /** Foreign key to the user */
  readonly userId: string;
  /** Which AI module generated this feedback */
  moduleName: AIModuleName;
  /** Model that was used */
  model: AIModel;
  /** The prompt / input sent to the model */
  promptInput: string;
  /** Raw model output */
  rawOutput: string;
  /** Structured / parsed feedback payload */
  parsedFeedback: Record<string, unknown>;
  /** Tokens consumed */
  tokensUsed: number;
  /** ISO-8601 creation timestamp */
  readonly createdAt: string;
}
