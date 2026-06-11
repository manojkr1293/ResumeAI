'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail } from 'lucide-react';
import { apiPost } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/constants';

const getErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as any).response;
    return response?.data?.error?.message || response?.data?.message || 'Request failed';
  }
  return error instanceof Error ? error.message : 'Request failed';
};

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [resetLink, setResetLink] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setStatus('');
    setResetLink('');
    setLoading(true);

    try {
      const data = await apiPost<{ message: string; resetLink?: string }>(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
      setStatus(data.message);
      if (data.resetLink) {
        setResetLink(data.resetLink);
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-md bg-indigo-50 text-indigo-600">
            <Mail className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-bold text-slate-950">Reset your password</h1>
          <p className="mt-2 text-sm text-slate-500">
            Enter your account email and we will prepare a password reset link.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {status && (
          <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {status}
          </div>
        )}

        {resetLink && (
          <div className="mb-4 rounded-md border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-800">
            <p className="font-semibold">Development reset link</p>
            <Link href={resetLink} className="mt-1 block break-all underline">
              {resetLink}
            </Link>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
              Email address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail((event.target as any).value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              placeholder="you@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Preparing link...' : 'Send reset link'}
          </button>
        </form>

        <Link href="/auth/login" className="mt-5 inline-block text-sm font-medium text-slate-600 hover:text-slate-950">
          Back to login
        </Link>
      </div>
    </div>
  );
}
