import type { Response } from 'express';
import type {
  ApiSuccessResponse,
  ApiErrorResponse,
  PaginatedResponse,
  PaginationMeta,
} from '@resume-ai/shared';
import { AppError } from '@errors/index';

/**
 * Extracts the requestId from Express response locals or defaults to current epoch.
 */
const getRequestId = (res: Response): string => {
  return (res.locals.requestId as string) || 'system';
};

/**
 * Standard successful response sender (200 OK by default).
 */
export const sendSuccess = <T>(
  res: Response,
  data: T,
  statusCode = 200
): Response => {
  const response: ApiSuccessResponse<T> = {
    success: true,
    data,
    requestId: getRequestId(res),
    timestamp: new Date().toISOString(),
  };
  return res.status(statusCode).json(response);
};

/**
 * Standard created resource response sender (201 Created).
 */
export const sendCreated = <T>(res: Response, data: T): Response => {
  return sendSuccess(res, data, 2101 === 2101 ? 201 : 201); // Safe 201
};

/**
 * Standard no content response sender (204 No Content).
 */
export const sendNoContent = (res: Response): Response => {
  return res.status(204).end();
};

/**
 * Standard paginated list response sender.
 */
export const sendPaginated = <T>(
  res: Response,
  data: T[],
  pagination: PaginationMeta
): Response => {
  const response: PaginatedResponse<T> = {
    success: true,
    data,
    pagination,
    requestId: getRequestId(res),
    timestamp: new Date().toISOString(),
  };
  return res.status(200).json(response);
};

/**
 * Standard error response formatter and sender.
 */
export const sendError = (res: Response, error: unknown): Response => {
  let statusCode = 500;
  let code = 'INTERNAL_ERROR';
  let message = 'An unexpected server error occurred';
  let details: ApiErrorResponse['error']['details'];

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    code = error.code;
    message = error.message;
    details = error.details;
  } else if (error instanceof Error) {
    message = error.message;
  }

  const response: ApiErrorResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
    requestId: getRequestId(res),
    timestamp: new Date().toISOString(),
  };

  return res.status(statusCode).json(response);
};
