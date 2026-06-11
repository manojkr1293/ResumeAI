import type { ApiErrorDetail } from '@resume-ai/shared';

/**
 * Base custom application error class.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly details?: ApiErrorDetail[];
  public readonly originalError?: Error;

  constructor(
    message: string,
    statusCode: number,
    code: string,
    isOperational = true,
    details?: ApiErrorDetail[],
    originalError?: Error
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);

    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.details = details;
    this.originalError = originalError;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Error raised when input fields or request parameters fail schema validation (400 Bad Request).
 */
export class ValidationError extends AppError {
  constructor(message = 'Validation failed', details?: ApiErrorDetail[], originalError?: Error) {
    super(message, 400, 'VALIDATION_ERROR', true, details, originalError);
  }
}

/**
 * Error raised when authentication fails due to missing, expired or invalid credentials (401 Unauthorized).
 */
export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required', originalError?: Error) {
    super(message, 401, 'AUTHENTICATION_ERROR', true, undefined, originalError);
  }
}

/**
 * Error raised when a client is authenticated but lacks access rights to a specific resource or plan tier (403 Forbidden).
 */
export class AuthorizationError extends AppError {
  constructor(message = 'Access denied. Lacking required subscription privileges.', originalError?: Error) {
    super(message, 403, 'AUTHORIZATION_ERROR', true, undefined, originalError);
  }
}

/**
 * Error raised when a requested resource is not found (404 Not Found).
 */
export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', originalError?: Error) {
    super(message, 404, 'NOT_FOUND', true, undefined, originalError);
  }
}

/**
 * Error raised when a request conflicts with current server state, e.g., duplicate unique keys (409 Conflict).
 */
export class ConflictError extends AppError {
  constructor(message = 'Resource conflict detected', originalError?: Error) {
    super(message, 409, 'CONFLICT', true, undefined, originalError);
  }
}

/**
 * Error raised when rate limits are exceeded (429 Too Many Requests).
 */
export class RateLimitError extends AppError {
  constructor(message = 'Too many requests. Please try again later.', originalError?: Error) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED', true, undefined, originalError);
  }
}

/**
 * Error raised when external AI services fail, time out, or reject requests (502 Bad Gateway).
 */
export class AIServiceError extends AppError {
  constructor(message = 'AI generation service failed. Please try again.', originalError?: Error) {
    super(message, 502, 'AI_SERVICE_ERROR', true, undefined, originalError);
  }
}

/**
 * Error raised for unhandled internal failures that represent true programming errors or environment crashes (500 Internal Server Error).
 */
export class InternalError extends AppError {
  constructor(message = 'An unexpected server error occurred', originalError?: Error) {
    super(message, 500, 'INTERNAL_ERROR', false, undefined, originalError);
  }
}
