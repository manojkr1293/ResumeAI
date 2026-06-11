import { v4 as uuidv4 } from 'uuid';

/**
 * Generates a unique request identifier (UUID v4).
 */
export const generateRequestId = (): string => {
  return uuidv4();
};

/**
 * Transforms an input string into a URL-friendly slug.
 */
export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start
    .replace(/-+$/, ''); // Trim - from end
};

/**
 * Truncates text to a specified maximum length, appending ellipsis if cut.
 */
export const truncate = (text: string, length: number): string => {
  if (text.length <= length) {
    return text;
  }
  return text.slice(0, length) + '...';
};

/**
 * Basic HTML tag sanitization to prevent rudimentary script injection.
 */
export const sanitizeHtml = (input: string): string => {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Delays execution of an asynchronous process.
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Retries an asynchronous function with a fixed delay, throwing after maximum attempts.
 */
export const retry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number,
  delayMs: number
): Promise<T> => {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
        await delay(delayMs);
      }
    }
  }
  throw lastError;
};

/**
 * Creates a shallow copy of an object, omitting selected keys.
 */
export const omit = <T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> => {
  const result = { ...obj };
  keys.forEach((key) => {
    delete result[key];
  });
  return result as Omit<T, K>;
};

/**
 * Creates a shallow copy of an object, containing only the selected keys.
 */
export const pick = <T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> => {
  const result = {} as Pick<T, K>;
  keys.forEach((key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
};
