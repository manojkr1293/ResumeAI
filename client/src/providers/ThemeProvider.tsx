'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { STORAGE_KEYS } from '@/lib/constants';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
}

export function ThemeProvider({
  children,
  defaultTheme = 'dark',
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);

  // Initialize theme from storage
  useEffect(() => {
    if (typeof globalThis === 'undefined') return;
    const win = globalThis as any;
    const savedTheme = win.localStorage.getItem(STORAGE_KEYS.THEME) as Theme | null;
    if (savedTheme) {
      setThemeState(savedTheme);
    }
  }, []);

  useEffect(() => {
    if (typeof globalThis === 'undefined') return;
    const win = globalThis as any;
    const root = win.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = win.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    if (typeof globalThis !== 'undefined') {
      const win = globalThis as any;
      win.localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
    }
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  // Sync with OS color scheme changes if set to 'system'
  useEffect(() => {
    if (theme !== 'system') {
      return;
    }

    if (typeof globalThis === 'undefined') return;
    const win = globalThis as any;
    const mediaQuery = win.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e: any) => {
      const root = win.document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
