// ─── Job Description Types ───────────────────────────────────────────────────

/**
 * Structured data extracted from a raw job description by the AI extractor.
 */
export interface ExtractedJDData {
  /** Skills explicitly required */
  requiredSkills: string[];
  /** Nice-to-have / preferred skills */
  preferredSkills: string[];
  /** Experience requirements (e.g. "3+ years in React") */
  experience: string[];
  /** Education requirements (e.g. "B.S. in Computer Science") */
  education: string[];
  /** Key responsibilities listed in the JD */
  responsibilities: string[];
  /** Extracted keywords for ATS matching */
  keywords: string[];
}

/**
 * Job description entity as stored in the database.
 */
export interface JobDescription {
  /** UUID primary key */
  readonly id: string;
  /** Foreign key to the owning user */
  readonly userId: string;
  /** Job title extracted or provided */
  title: string;
  /** Company name */
  company: string;
  /** Original unprocessed text of the job description */
  rawText: string;
  /** AI-extracted structured data */
  extractedData: ExtractedJDData;
  /** ISO-8601 creation timestamp */
  readonly createdAt: string;
}

// ─── DTOs ────────────────────────────────────────────────────────────────────

/**
 * Payload for submitting a new job description.
 */
export interface CreateJDDTO {
  /** Job title */
  title: string;
  /** Company name */
  company: string;
  /** Raw text of the job description */
  rawText: string;
}

// ─── JD Matching ─────────────────────────────────────────────────────────────

/**
 * Result of matching a resume against a job description.
 */
export interface JDMatchResult {
  /** Overall match percentage (0-100) */
  matchScore: number;
  /** Keywords from the JD found in the resume */
  matchedKeywords: string[];
  /** Keywords from the JD missing in the resume */
  missingKeywords: string[];
  /** Suggestions to improve the match */
  suggestions: string[];
}

// ─── Tailoring ───────────────────────────────────────────────────────────────

/**
 * Request to tailor a resume for a specific job description.
 */
export interface TailorRequest {
  /** UUID of the resume to tailor */
  resumeId: string;
  /** UUID of the job description to tailor against */
  jobDescriptionId: string;
  /** Sections to tailor (empty = all) */
  targetSections?: string[];
}

/**
 * Response from the tailoring engine.
 */
export interface TailorResponse {
  /** Per-section tailoring suggestions */
  sectionSuggestions: TailorSectionSuggestion[];
  /** Overall match improvement estimate (percentage points) */
  estimatedScoreImprovement: number;
  /** Tokens consumed */
  tokensUsed: number;
}

/**
 * Tailoring suggestion for a single resume section.
 */
export interface TailorSectionSuggestion {
  /** Section ID */
  sectionId: string;
  /** Original content snippet */
  originalSnippet: string;
  /** Suggested replacement content */
  suggestedSnippet: string;
  /** Rationale for the change */
  rationale: string;
}
