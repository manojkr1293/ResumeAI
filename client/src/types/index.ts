import type React from 'react';
import type { Theme } from '@/providers/ThemeProvider';

// Re-export common backend schemas for direct integration in components
export * from '@resume-ai/shared';

// Theme Type definition
export type { Theme };

/**
 * Standard interface for mapping sidebar and header navigation items.
 */
export interface NavItem {
  title: string;
  href: string;
  disabled?: boolean;
  external?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  label?: string;
  description?: string;
}

/**
 * Interface mapping breadcrumb navigation steps.
 */
export interface BreadcrumbItem {
  title: string;
  href?: string;
  active?: boolean;
}

/**
 * Common properties for client-side modal dialogues.
 */
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
}

/**
 * Classification types for client notifications.
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'default';
