// ─── Resume Section Types ────────────────────────────────────────────────────

/**
 * Enumeration of all supported resume section types.
 */
export enum SectionType {
  CONTACT = 'CONTACT',
  SUMMARY = 'SUMMARY',
  EXPERIENCE = 'EXPERIENCE',
  EDUCATION = 'EDUCATION',
  SKILLS = 'SKILLS',
  PROJECTS = 'PROJECTS',
  CERTIFICATIONS = 'CERTIFICATIONS',
  LANGUAGES = 'LANGUAGES',
  AWARDS = 'AWARDS',
  CUSTOM = 'CUSTOM',
}

// ─── Section Content Sub-types ───────────────────────────────────────────────

/** A custom URL link with a label. */
export interface CustomLink {
  /** Display label (e.g. "Personal Blog") */
  label: string;
  /** Full URL */
  url: string;
}

/** Contact information section. */
export interface ContactContent {
  sectionType: SectionType.CONTACT;
  fullName: string;
  email: string;
  phone: string | null;
  location: string | null;
  linkedin: string | null;
  github: string | null;
  portfolio: string | null;
  customLinks: CustomLink[];
}

/** Professional summary / objective. */
export interface SummaryContent {
  sectionType: SectionType.SUMMARY;
  text: string;
}

// ── Experience ───────────────────────────────────────────────────────────────

/** A single work-experience entry. */
export interface ExperienceItem {
  /** Company / organization name */
  company: string;
  /** Job title */
  title: string;
  /** City, State or "Remote" */
  location: string | null;
  /** ISO-8601 start date */
  startDate: string;
  /** ISO-8601 end date (null if current) */
  endDate: string | null;
  /** Whether this is the user's current position */
  current: boolean;
  /** Bullet-point achievements */
  bullets: string[];
}

/** Work experience section. */
export interface ExperienceContent {
  sectionType: SectionType.EXPERIENCE;
  items: ExperienceItem[];
}

// ── Education ────────────────────────────────────────────────────────────────

/** A single education entry. */
export interface EducationItem {
  /** Institution name */
  institution: string;
  /** Degree type (e.g. "B.Tech", "M.S.", "Ph.D.") */
  degree: string;
  /** Field of study */
  field: string;
  /** ISO-8601 start date */
  startDate: string;
  /** ISO-8601 end date (null if ongoing) */
  endDate: string | null;
  /** Grade Point Average (nullable) */
  gpa: string | null;
  /** Notable achievements / coursework */
  highlights: string[];
}

/** Education section. */
export interface EducationContent {
  sectionType: SectionType.EDUCATION;
  items: EducationItem[];
}

// ── Skills ───────────────────────────────────────────────────────────────────

/** A named group of related skills. */
export interface SkillCategory {
  /** Category label (e.g. "Languages", "Frameworks") */
  name: string;
  /** Individual skill names */
  skills: string[];
}

/** Skills section. */
export interface SkillsContent {
  sectionType: SectionType.SKILLS;
  categories: SkillCategory[];
}

// ── Projects ─────────────────────────────────────────────────────────────────

/** A single project entry. */
export interface ProjectItem {
  /** Project name */
  name: string;
  /** Brief description */
  description: string;
  /** Technologies / tools used */
  technologies: string[];
  /** Live or repository URL (nullable) */
  url: string | null;
  /** Key results / highlights */
  highlights: string[];
}

/** Projects section. */
export interface ProjectContent {
  sectionType: SectionType.PROJECTS;
  items: ProjectItem[];
}

// ── Certifications ───────────────────────────────────────────────────────────

/** A single certification entry. */
export interface CertificationItem {
  /** Certification name */
  name: string;
  /** Issuing organization */
  issuer: string;
  /** ISO-8601 date earned */
  issueDate: string;
  /** ISO-8601 expiration date (nullable) */
  expirationDate: string | null;
  /** Credential ID / verification code (nullable) */
  credentialId: string | null;
  /** Verification URL (nullable) */
  credentialUrl: string | null;
}

/** Certifications section. */
export interface CertificationContent {
  sectionType: SectionType.CERTIFICATIONS;
  items: CertificationItem[];
}

// ── Languages ────────────────────────────────────────────────────────────────

/** Proficiency levels aligned with CEFR. */
export type LanguageProficiency =
  | 'NATIVE'
  | 'FLUENT'
  | 'ADVANCED'
  | 'INTERMEDIATE'
  | 'BEGINNER';

/** A single language entry. */
export interface LanguageItem {
  /** Language name */
  language: string;
  /** Proficiency level */
  proficiency: LanguageProficiency;
}

/** Languages section. */
export interface LanguageContent {
  sectionType: SectionType.LANGUAGES;
  items: LanguageItem[];
}

// ── Awards ───────────────────────────────────────────────────────────────────

/** A single award / honor entry. */
export interface AwardItem {
  /** Award title */
  title: string;
  /** Issuing organization */
  issuer: string;
  /** ISO-8601 date received */
  date: string;
  /** Description or significance (nullable) */
  description: string | null;
}

/** Awards section. */
export interface AwardContent {
  sectionType: SectionType.AWARDS;
  items: AwardItem[];
}

// ── Custom ───────────────────────────────────────────────────────────────────

/** A single custom section entry. */
export interface CustomItem {
  /** Entry title / heading */
  title: string;
  /** Subtitle or secondary heading (nullable) */
  subtitle: string | null;
  /** ISO-8601 date (nullable) */
  date: string | null;
  /** Description text (nullable) */
  description: string | null;
  /** Bullet-point details */
  bullets: string[];
}

/** User-defined custom section. */
export interface CustomContent {
  sectionType: SectionType.CUSTOM;
  /** Section heading shown on the resume */
  title: string;
  items: CustomItem[];
}

// ─── Discriminated Union ─────────────────────────────────────────────────────

/**
 * Discriminated union of all section content types.
 * Discriminant field: `sectionType`.
 */
export type SectionContent =
  | ContactContent
  | SummaryContent
  | ExperienceContent
  | EducationContent
  | SkillsContent
  | ProjectContent
  | CertificationContent
  | LanguageContent
  | AwardContent
  | CustomContent;

// ─── Resume Section Entity ───────────────────────────────────────────────────

/**
 * A single section within a resume.
 */
export interface ResumeSection {
  /** UUID primary key */
  readonly id: string;
  /** Foreign key to the parent resume */
  readonly resumeId: string;
  /** Type discriminator */
  sectionType: SectionType;
  /** Display order (0-based) */
  sectionOrder: number;
  /** Typed section content — discriminated on sectionType */
  content: SectionContent;
  /** Whether the section is rendered on the final resume */
  isVisible: boolean;
  /** AI quality score for this section (0-100, nullable) */
  aiScore: number | null;
  /** ISO-8601 last-update timestamp */
  updatedAt: string;
}

// ─── DTOs ────────────────────────────────────────────────────────────────────

/**
 * Payload for creating or fully replacing a section.
 */
export interface UpsertSectionDTO {
  sectionType: SectionType;
  sectionOrder?: number;
  content: SectionContent;
  isVisible?: boolean;
}

/**
 * Payload for reordering multiple sections at once.
 * Each entry maps a section ID to its new order.
 */
export interface ReorderSectionsDTO {
  /** Array of { sectionId, newOrder } pairs */
  order: ReadonlyArray<{
    sectionId: string;
    newOrder: number;
  }>;
}
