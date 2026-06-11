'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';

export default function OAuthCallbackPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [error, setError] = useState('');

  useEffect(() => {
    const win = globalThis as any;
    const params = new URLSearchParams(win.location.search);
    const adminMode = params.get('mode') === 'admin';
    const oauthError = params.get('error');
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');
    const expiresIn = Number(params.get('expiresIn') || 900);
    const encodedUser = params.get('user');

    if (oauthError) {
      setError(oauthError);
      return;
    }

    if (!accessToken || !refreshToken || !encodedUser) {
      setError('Google login did not return a valid session.');
      return;
    }

    try {
      const base64 = encodedUser.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
      const user = JSON.parse(atob(padded));
      setAuth(user, { accessToken, refreshToken, expiresIn });
      router.replace(adminMode ? '/admin' : '/dashboard');
    } catch {
      setError('Could not complete Google login.');
    }
  }, [router, setAuth]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm">
        {error ? (
          <>
            <h1 className="text-xl font-bold text-slate-950">Google login failed</h1>
            <p className="mt-2 text-sm text-slate-500">{error}</p>
            <Link
              href="/auth/login"
              className="mt-5 inline-flex rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Back to login
            </Link>
          </>
        ) : (
          <>
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-indigo-600" />
            <h1 className="mt-4 text-xl font-bold text-slate-950">Completing Google login</h1>
            <p className="mt-2 text-sm text-slate-500">Please wait while we open your dashboard.</p>
          </>
        )}
      </div>
    </div>
  );
}
