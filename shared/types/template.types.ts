// ─── Template Types ──────────────────────────────────────────────────────────

/**
 * Visual category / style family for resume templates.
 */
export enum TemplateCategory {
  PROFESSIONAL = 'PROFESSIONAL',
  CREATIVE = 'CREATIVE',
  MINIMAL = 'MINIMAL',
  TECHNICAL = 'TECHNICAL',
  ACADEMIC = 'ACADEMIC',
}

/**
 * Full template entity as stored in the database.
 */
export interface Template {
  /** UUID primary key */
  readonly id: string;
  /** Display name of the template */
  name: string;
  /** Visual style category */
  category: TemplateCategory;
  /** URL to the template preview thumbnail */
  thumbnailUrl: string;
  /** Handlebars / Mustache HTML template string */
  htmlTemplate: string;
  /** CSS styles applied to the template */
  cssStyles: string;
  /** Whether this template requires a paid plan */
  isPremium: boolean;
  /** Whether the template is currently available */
  isActive: boolean;
  /** Numeric sort order for gallery display */
  sortOrder: number;
}

/**
 * Lightweight projection used in template gallery listings.
 */
export interface TemplateListItem {
  /** UUID primary key */
  readonly id: string;
  /** Display name */
  name: string;
  /** Visual style category */
  category: TemplateCategory;
  /** Thumbnail preview URL */
  thumbnailUrl: string;
  /** Whether this template requires a paid plan */
  isPremium: boolean;
}
