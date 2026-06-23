import React from 'react';
import Link from 'next/link';
import { FileText, UserRound, Sun, Moon } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';

interface BrandingHeaderProps {
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export default function BrandingHeader({ theme, onToggleTheme }: BrandingHeaderProps) {
  const logout = useAuthStore((state) => state.logout);

  return (
    <nav className="border-b border-slate-800/85 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50 print:hidden w-full transition-all duration-300">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-16 items-center justify-between py-3">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-400 to-indigo-500 text-white shadow-lg shadow-indigo-500/25 group-hover:scale-[1.05] transition-transform duration-300">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <span className="text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400 tracking-tight">ResumeAI</span>
              <p className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">Job Optimizer</p>
            </div>
          </Link>

          <div className="flex items-center gap-4 sm:gap-6">
            <Link
              href="/dashboard"
              className="text-xs font-semibold text-slate-400 hover:text-white transition-colors duration-200"
            >
              Dashboard
            </Link>
            
            <Link
              href="/profile"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors duration-200"
            >
              <UserRound className="h-3.5 w-3.5 text-slate-500" />
              <span>Profile</span>
            </Link>

            {onToggleTheme && (
              <button 
                onClick={onToggleTheme} 
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-850 hover:bg-slate-800 hover:border-slate-700 transition"
                title="Toggle Theme"
              >
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4 text-yellow-400" />
                ) : (
                  <Moon className="h-4 w-4 text-slate-400" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
