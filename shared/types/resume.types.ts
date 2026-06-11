// ─── Resume Domain Types ─────────────────────────────────────────────────────

import type { ResumeSection } from './section.types';

/**
 * Lifecycle status of a resume document.
 */
export enum ResumeStatus {
  /** Work-in-progress, not yet finalized */
  DRAFT = 'DRAFT',
  /** Currently active / primary resume */
  ACTIVE = 'ACTIVE',
  /** Soft-archived, hidden from default views */
  ARCHIVED = 'ARCHIVED',
}

// ─── Core Interfaces ─────────────────────────────────────────────────────────

/**
 * Resume entity as stored in the database.
 */
export interface Resume {
  /** UUID primary key */
  readonly id: string;
  /** Foreign key to the owning user */
  readonly userId: string;
  /** Human-readable title (e.g. "SDE Resume – Google") */
  title: string;
  /** Foreign key to the selected template */
  templateId: string | null;
  /** Current lifecycle status */
  status: ResumeStatus;
  /** Latest ATS compatibility score (0-100, nullable until scored) */
  atsScore: number | null;
  /** Composite overall quality score (0-100, nullable until scored) */
  overallScore: number | null;
  /** Whether this is the user's primary / default resume */
  isPrimary: boolean;
  /** ISO-8601 creation timestamp */
  readonly createdAt: string;
  /** ISO-8601 last-update timestamp */
  updatedAt: string;
}

/**
 * Resume hydrated with its child section records.
 */
export interface ResumeWithSections extends Resume {
  /** Ordered array of resume sections */
  sections: ResumeSection[];
}

// ─── DTOs ────────────────────────────────────────────────────────────────────

/**
 * Payload for creating a new resume.
 */
export interface CreateResumeDTO {
  title: string;
  templateId?: string | null;
  status?: ResumeStatus;
  isPrimary?: boolean;
}

/**
 * Payload for updating an existing resume.
 */
export interface UpdateResumeDTO {
  title?: string;
  templateId?: string | null;
  status?: ResumeStatus;
  isPrimary?: boolean;
}

/**
 * Lightweight projection used in dashboard listing views.
 */
export interface ResumeListItem {
  /** UUID primary key */
  readonly id: string;
  /** Human-readable title */
  title: string;
  /** Current lifecycle status */
  status: ResumeStatus;
  /** Latest ATS score */
  atsScore: number | null;
  /** Composite overall score */
  overallScore: number | null;
  /** Whether this is the primary resume */
  isPrimary: boolean;
  /** Template ID used */
  templateId: string | null;
  /** ISO-8601 last-update timestamp */
  updatedAt: string;
  /** ISO-8601 creation timestamp */
  readonly createdAt: string;
}
