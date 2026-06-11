// ─── Export Types ────────────────────────────────────────────────────────────

/**
 * Supported export file formats.
 */
export enum ExportType {
  PDF = 'PDF',
  DOCX = 'DOCX',
}

/**
 * Export record entity as stored in the database.
 */
export interface ExportRecord {
  /** UUID primary key */
  readonly id: string;
  /** Foreign key to the user */
  readonly userId: string;
  /** Foreign key to the resume */
  readonly resumeId: string;
  /** Foreign key to the resume version (snapshot) */
  readonly versionId: string;
  /** Format the resume was exported in */
  exportType: ExportType;
  /** Cloud storage URL to the generated file */
  fileUrl: string;
  /** File size in kilobytes */
  fileSizeKb: number;
  /** ISO-8601 timestamp when the download link expires */
  expiresAt: string;
  /** ISO-8601 creation timestamp */
  readonly createdAt: string;
}

// ─── DTOs ────────────────────────────────────────────────────────────────────

/**
 * Request to export a resume in a specific format.
 */
export interface ExportRequest {
  /** UUID of the resume to export */
  resumeId: string;
  /** UUID of the template to apply */
  templateId: string;
  /** Desired export format */
  format: ExportType;
}

/**
 * Response containing the download details of an export.
 */
export interface ExportResponse {
  /** Signed download URL */
  downloadUrl: string;
  /** File size in kilobytes */
  fileSize: number;
  /** ISO-8601 timestamp when the URL expires */
  expiresAt: string;
}
