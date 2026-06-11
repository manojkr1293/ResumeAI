/**
 * Weight distribution for calculating the overall ATS optimization score.
 * Total sum must equal 100.
 */
export const ATS_SCORE_WEIGHTS = {
  keyword: 40,
  format: 20,
  impact: 25,
  readability: 15,
} as const;

/**
 * Metadata and calibration limits for different dimensions of resume quality scoring.
 */
export const RESUME_SCORE_DIMENSIONS = [
  {
    name: 'Content & Impact',
    description: 'Measures action verbs, quantifiable achievements, and result-oriented language.',
    maxScore: 100,
  },
  {
    name: 'ATS Compatibility',
    description: 'Evaluates format parser friendliness, keyword matching, and structure clarity.',
    maxScore: 100,
  },
  {
    name: 'Readability & Grammar',
    description: 'Checks style consistency, sentence complexity, syntax correctness, and flow.',
    maxScore: 100,
  },
  {
    name: 'Layout & Presentation',
    description: 'Validates section sequence, spacing balance, font sizing, and visual density.',
    maxScore: 100,
  },
] as const;

/**
 * Score threshold classifications used to categorize quality indicators on client dashboards.
 */
export const SCORE_THRESHOLDS = {
  excellent: 90,
  good: 75,
  fair: 60,
  poor: 40,
} as const;
