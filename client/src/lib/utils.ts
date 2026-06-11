import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Standard utility combining classnames and resolving tailwind conflict overrides.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Helper to identify server-side rendering context vs browser.
 */
export function isServer(): boolean {
  return typeof window === 'undefined';
}

/**
 * Formats a Date object or ISO-8601 string into a local human-readable date.
 */
export function formatDate(date: string | Date, format = 'MM/YYYY'): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) {
    return '';
  }

  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const day = String(d.getDate()).padStart(2, '0');

  if (format === 'DD/MM/YYYY') {
    return `${day}/${month}/${year}`;
  }
  if (format === 'YYYY-MM-DD') {
    return `${year}-${month}-${day}`;
  }

  // Default: MM/YYYY
  return `${month}/${year}`;
}

/**
 * Converts a date into relative friendly time (e.g. "3 hours ago", "Yesterday").
 */
export function formatRelativeTime(date: string | Date): string {
  const timeMs = new Date(date).getTime();
  const nowMs = Date.now();
  const diffSec = Math.floor((nowMs - timeMs) / 1000);

  if (diffSec < 60) {
    return 'Just now';
  }

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) {
    return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
  }

  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) {
    return `${diffHr} hour${diffHr > 1 ? 's' : ''} ago`;
  }

  const diffDays = Math.floor(diffHr / 24);
  if (diffDays === 1) {
    return 'Yesterday';
  }
  if (diffDays < 30) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  }

  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
}

/**
 * Truncates raw text at a specified limit, ending with an ellipsis.
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength).trim() + '...';
}

/**
 * Traditional debounce closure wrapping to prevent duplicate consecutive execution.
 */
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      fn(...args);
      timer = null;
    }, delay);
  };
}

/**
 * Generates client-side unique identification strings (UUID v4 clone).
 */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Standard sleep/delay helper utilizing async-await.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Extracts initials from names (e.g. "John Doe" -> "JD").
 */
export function getInitials(name: string): string {
  if (!name) {
    return 'U';
  }
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return (parts[0] ?? '').slice(0, 2).toUpperCase();
  }
  const first = parts[0]?.[0] ?? '';
  const last = parts[parts.length - 1]?.[0] ?? '';
  return (first + last).toUpperCase();
}
