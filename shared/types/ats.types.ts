// ─── ATS Scoring Types ───────────────────────────────────────────────────────

/**
 * Request to run an ATS compatibility analysis on a resume.
 */
export interface ATSAnalysisRequest {
  /** UUID of the resume to analyze */
  resumeId: string;
  /** Optional job description ID for keyword matching */
  jobDescriptionId?: string;
}

/**
 * A single category breakdown within the ATS analysis.
 */
export interface ATSBreakdownItem {
  /** Category name (e.g. "Keyword Optimization", "Formatting") */
  category: string;
  /** Achieved score for this category */
  score: number;
  /** Maximum possible score for this category */
  maxScore: number;
  /** Specific issues detected */
  issues: string[];
  /** Actionable recommendations */
  recommendations: string[];
}

/**
 * Complete ATS analysis response.
 */
export interface ATSAnalysisResponse {
  /** Overall ATS compatibility score (0-100) */
  overallScore: number;
  /** Keyword match score (0-100) */
  keywordScore: number;
  /** Formatting & structure score (0-100) */
  formatScore: number;
  /** Impact & action-verb score (0-100) */
  impactScore: number;
  /** Readability & length score (0-100) */
  readabilityScore: number;
  /** Per-category breakdown */
  breakdown: ATSBreakdownItem[];
  /** Keywords from the JD not found in the resume */
  missingKeywords: string[];
  /** Top-level improvement suggestions */
  suggestions: string[];
}
