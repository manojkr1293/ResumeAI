'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LockKeyhole } from 'lucide-react';
import { apiPost } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/constants';

const getErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as any).response;
    return response?.data?.error?.message || response?.data?.message || 'Reset failed';
  }
  return error instanceof Error ? error.message : 'Reset failed';
};

export default function ResetPasswordPage() {
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const win = globalThis as any;
    setToken(new URLSearchParams(win.location.search).get('token') || '');
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setStatus('');

    if (!token) {
      setError('Reset token is missing. Please request a new reset link.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const data = await apiPost<{ message: string }>(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
        token,
        newPassword,
      });
      setStatus(data.message);
      setNewPassword('');
      setConfirmPassword('');
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
            <LockKeyhole className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-bold text-slate-950">Create a new password</h1>
          <p className="mt-2 text-sm text-slate-500">
            Use at least 8 characters. After reset, sign in again with the new password.
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

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="newPassword" className="mb-1 block text-sm font-medium text-slate-700">
              New password
            </label>
            <input
              id="newPassword"
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(event) => setNewPassword((event.target as any).value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              placeholder="New password"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-slate-700">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword((event.target as any).value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              placeholder="Confirm password"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !token}
            className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Resetting...' : 'Reset password'}
          </button>
        </form>

        <Link href="/auth/login" className="mt-5 inline-block text-sm font-medium text-slate-600 hover:text-slate-950">
          Back to login
        </Link>
      </div>
    </div>
  );
}
