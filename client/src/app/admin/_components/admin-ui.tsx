'use client';

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bot,
  Download,
  FileText,
  Gauge,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Search,
  ShieldAlert,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';

export const formatDate = (value?: string) => value ? new Date(value).toLocaleDateString(undefined, {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
}) : '-';

export const formatDateTime = (value?: string) => value ? new Date(value).toLocaleString(undefined, {
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
}) : '-';

const csvValue = (value: any) => `"${String(value ?? '').replace(/"/g, '""')}"`;

export function downloadCsv(filename: string, rows: Record<string, any>[]) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]!);
  const csv = [
    headers.join(','),
    ...rows.map((row) => headers.map((header) => csvValue(row[header])).join(',')),
  ].join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

const navItems = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/resumes', label: 'Resumes', icon: FileText },
  { href: '/admin/ai', label: 'AI Usage', icon: Bot },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/marketing', label: 'Marketing', icon: Megaphone },
  { href: '/admin/errors', label: 'Errors', icon: ShieldAlert },
];

export function useAdminGate() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated) {
      router.replace('/admin/login');
    }
  }, [mounted, isAuthenticated, router]);

  return { mounted, isAuthenticated, router };
}

export function AdminShell({
  title,
  description,
  range,
  onRangeChange,
  children,
}: {
  title: string;
  description: string;
  range?: string;
  onRangeChange?: (range: string) => void;
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    router.replace('/admin/login');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="border-b border-slate-200 bg-white lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:w-[260px] lg:flex-col lg:border-b-0 lg:border-r">
        <div className="flex min-h-16 items-center justify-between px-4 lg:min-h-20 lg:px-5">
          <Link href="/admin" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-950">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-900 text-white">
              <FileText className="h-4 w-4" />
            </span>
            ResumeAI Admin
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-md p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            aria-label="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex gap-2 overflow-x-auto px-4 pb-4 lg:block lg:space-y-1 lg:px-3">
          {navItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex min-w-max items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold lg:w-full ${
                  active ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto hidden border-t border-slate-200 p-3 lg:block">
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-950"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      <main className="min-w-0 px-4 py-6 sm:px-6 lg:ml-[260px] lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-indigo-700">Owner reports</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-950">{title}</h1>
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          </div>

          {range && onRangeChange && (
            <div className="flex items-center gap-2">
              {['7d', '30d', '90d'].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => onRangeChange(item)}
                  className={`rounded-md px-3 py-1.5 text-sm font-semibold ${
                    range === item ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>
        {children}
      </main>
    </div>
  );
}

export function AdminAccessDenied() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm">
        <h1 className="text-xl font-bold text-slate-950">Admin access required</h1>
        <p className="mt-2 text-sm text-slate-500">
          This area is only for owner/admin accounts. Check `ADMIN_EMAILS` in your root `.env`, then restart the server.
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link href="/admin/login" className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
            Admin login
          </Link>
          <Link href="/dashboard" className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            User dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

export function LoadingPanel({ label = 'Loading reports...' }: { label?: string }) {
  return <div className="rounded-lg border border-slate-200 bg-white p-8 text-sm text-slate-500">{label}</div>;
}

export function ErrorNotice({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="mb-5 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
      {message}
    </div>
  );
}

export function Metric({ icon: Icon, label, value, helper }: { icon: LucideIcon; label: string; value: any; helper: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-slate-100 text-slate-700">
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-950">{value ?? 0}</p>
      <p className="mt-1 text-xs text-slate-500">{helper}</p>
    </div>
  );
}

export function Panel({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-semibold text-slate-950">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      />
    </div>
  );
}

export function BarRow({ label, value, max, helper }: { label: string; value: number; max: number; helper?: string }) {
  return (
    <div>
      <div className="mb-1 flex justify-between gap-3 text-sm">
        <span className="truncate font-medium text-slate-700">{label}</span>
        <span className="shrink-0 text-slate-500">{value}{helper ? ` - ${helper}` : ''}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100">
        <div className="h-2 rounded-full bg-indigo-600" style={{ width: `${Math.max(4, (value / max) * 100)}%` }} />
      </div>
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-slate-100 bg-slate-50 p-3 text-sm text-slate-500">
      <AlertTriangle className="h-4 w-4" />
      {message}
    </div>
  );
}

export const adminIcons = {
  Activity,
  Bot,
  Download,
  FileText,
  Gauge,
  Users,
};
