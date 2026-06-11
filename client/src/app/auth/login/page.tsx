'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, FileText, Loader2, LockKeyhole, Mail } from 'lucide-react';
import { apiPost } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/constants';
import { useAuthStore } from '@/stores/auth.store';
import { getMarketingContext } from '@/components/analytics-tracker';
import type { AuthenticatedUser } from '@/types';

const getErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as any).response;
    return response?.data?.error?.message || response?.data?.message || 'Login failed';
  }
  return error instanceof Error ? error.message : 'Login failed';
};

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const emailError = touched.email && email && !isValidEmail(email) ? 'Enter a valid email address.' : '';
  const passwordError = touched.password && !password ? 'Password is required.' : '';

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setTouched({ email: true, password: true });
    setError('');

    if (!isValidEmail(email) || !password) {
      return;
    }

    setLoading(true);
    try {
      const data = await apiPost<AuthenticatedUser>(API_ENDPOINTS.AUTH.LOGIN, { email, password, marketing: getMarketingContext() });
      setAuth(data.user, data.tokens);
      router.replace('/dashboard');
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const win = globalThis as any;
    win.location.href = `${API_BASE_URL}${API_ENDPOINTS.AUTH.GOOGLE}`;
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Link href="/" className="inline-flex items-center justify-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-indigo-600 text-white">
              <FileText className="h-5 w-5" />
            </span>
            <span className="text-lg font-bold text-slate-950">ResumeAI</span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-slate-950">Sign in to your account</h1>
          <p className="mt-2 text-sm text-slate-500">
            Continue building job-ready, ATS-focused resumes.
          </p>
        </div>

          <form method="post" onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
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
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">or sign in with email</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
                Email address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full rounded-md border border-slate-300 py-2 pl-9 pr-3 text-slate-950 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  placeholder="you@example.com"
                  value={email}
                  onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                  onChange={(event) => setEmail((event.target as any).value)}
                />
              </div>
              {emailError && <p className="mt-1 text-xs text-rose-600">{emailError}</p>}
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between gap-3">
                <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                  Password
                </label>
                <Link href="/auth/forgot-password" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className="w-full rounded-md border border-slate-300 py-2 pl-9 pr-10 text-slate-950 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  placeholder="Password"
                  value={password}
                  onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
                  onChange={(event) => setPassword((event.target as any).value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-2 top-1/2 rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800 -translate-y-1/2"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordError && <p className="mt-1 text-xs text-rose-600">{passwordError}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          <p className="mt-4 text-center text-sm text-slate-500">
            New to ResumeAI?{' '}
            <Link href="/auth/register" className="font-semibold text-indigo-600 hover:text-indigo-700">
              Create an account
            </Link>
          </p>
        </form>

        <p className="mt-4 text-center text-xs text-slate-500">
          Your data stays private. You control your resumes.
        </p>
      </div>
    </div>
  );
}
