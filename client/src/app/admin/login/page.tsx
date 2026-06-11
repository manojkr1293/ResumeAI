'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, FileText, Loader2, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { apiPost } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/constants';
import { useAuthStore } from '@/stores/auth.store';
import type { AuthenticatedUser } from '@/types';

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

const getErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as any).response;
    return response?.data?.error?.message || response?.data?.message || 'Admin login failed';
  }
  return error instanceof Error ? error.message : 'Admin login failed';
};

export default function AdminLoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/admin');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!isValidEmail(email) || !password) {
      setError('Enter a valid admin email and password.');
      return;
    }

    setLoading(true);
    try {
      const data = await apiPost<AuthenticatedUser>(API_ENDPOINTS.AUTH.LOGIN, { email, password });
      setAuth(data.user, data.tokens);
      router.replace('/admin');
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const win = globalThis as any;
    win.location.href = `${API_BASE_URL}${API_ENDPOINTS.AUTH.GOOGLE}?mode=admin`;
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Link href="/" className="inline-flex items-center justify-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-indigo-500 text-white">
              <FileText className="h-5 w-5" />
            </span>
            <span className="text-lg font-bold text-white">ResumeAI</span>
          </Link>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-sm font-semibold text-indigo-200">
            <ShieldCheck className="h-4 w-4" />
            Owner access
          </div>
          <h1 className="mt-4 text-2xl font-bold text-white">Admin login</h1>
          <p className="mt-2 text-sm text-slate-400">
            Sign in with an owner email to view reports and monitoring.
          </p>
        </div>

        <form method="post" onSubmit={handleSubmit} className="rounded-lg border border-slate-800 bg-white p-6 shadow-xl">
          {error && (
            <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="mb-5 inline-flex w-full items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full border border-slate-200 bg-white text-xs font-bold text-slate-700">
              G
            </span>
            Continue with Google
          </button>

          <div className="mb-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">or admin email</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="admin-email" className="mb-1 block text-sm font-medium text-slate-700">Admin email</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail((event.target as any).value)}
                  className="w-full rounded-md border border-slate-300 py-2 pl-9 pr-3 text-slate-950 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  placeholder="owner@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="admin-password" className="mb-1 block text-sm font-medium text-slate-700">Password</label>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword((event.target as any).value)}
                  className="w-full rounded-md border border-slate-300 py-2 pl-9 pr-10 text-slate-950 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  placeholder="Password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? 'Checking access...' : 'Open Admin Dashboard'}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-slate-400">
          User login remains separate at <Link href="/auth/login" className="font-semibold text-indigo-300 hover:text-indigo-200">/auth/login</Link>.
        </p>
      </div>
    </div>
  );
}
