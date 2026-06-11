// ─── API Response Standardization ────────────────────────────────────────────

/**
 * Detail about a specific field-level validation error.
 */
export interface ApiErrorDetail {
  /** The request field that caused the error */
  field: string;
  /** Human-readable description of the issue */
  message: string;
}

/**
 * Structured error payload.
 */
export interface ApiError {
  /** Machine-readable error code (e.g. "AUTH_INVALID_TOKEN") */
  code: string;
  /** Human-readable error message */
  message: string;
  /** Optional field-level validation details */
  details?: ApiErrorDetail[];
}

/**
 * Standard successful API response wrapper.
 */
export interface ApiSuccessResponse<T> {
  /** Discriminant — always `true` for success */
  success: true;
  /** Response payload */
  data: T;
  /** Unique request trace identifier */
  requestId: string;
  /** ISO-8601 server timestamp */
  timestamp: string;
}

/**
 * Standard error API response wrapper.
 */
export interface ApiErrorResponse {
  /** Discriminant — always `false` for errors */
  success: false;
  /** Structured error information */
  error: ApiError;
  /** Unique request trace identifier */
  requestId: string;
  /** ISO-8601 server timestamp */
  timestamp: string;
}

/**
 * Discriminated union of all possible API responses.
 */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// ─── Pagination ──────────────────────────────────────────────────────────────

/**
 * Pagination metadata included in list responses.
 */
export interface PaginationMeta {
  /** Current page number (1-based) */
  page: number;
  /** Items per page */
  limit: number;
  /** Total number of matching items */
  total: number;
  /** Total number of pages */
  totalPages: number;
  /** Whether a next page exists */
  hasNext: boolean;
  /** Whether a previous page exists */
  hasPrev: boolean;
}

/**
 * Paginated API response — extends the success wrapper with pagination info.
 */
export interface PaginatedResponse<T> extends ApiSuccessResponse<T[]> {
  /** Pagination metadata */
  pagination: PaginationMeta;
}

/**
 * Standard query parameters for paginated endpoints.
 */
export interface PaginationQuery {
  /** Page number (1-based, default 1) */
  page?: number;
  /** Items per page (default varies by endpoint) */
  limit?: number;
  /** Field name to sort by */
  sortBy?: string;
  /** Sort direction */
  sortOrder?: 'asc' | 'desc';
}
