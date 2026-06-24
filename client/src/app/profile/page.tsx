'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';
import { LockKeyhole, Save, UserRound } from 'lucide-react';
import { apiGet, apiPost, apiPut } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/constants';
import { useAuthStore } from '@/stores/auth.store';

const EXPERIENCE_LEVELS = [
  { value: 'INTERN', label: 'Intern' },
  { value: 'ENTRY', label: 'Entry' },
  { value: 'MID', label: 'Mid' },
  { value: 'SENIOR', label: 'Senior' },
  { value: 'LEAD', label: 'Lead' },
  { value: 'EXECUTIVE', label: 'Executive' },
];

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
];

const getErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as any).response;
    return response?.data?.error?.message || response?.data?.message || 'Request failed';
  }
  return error instanceof Error ? error.message : 'Request failed';
};

export default function ProfilePage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const storeUser = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    targetRole: '',
    experienceLevel: 'ENTRY',
    preferredLang: 'en',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) {
      return;
    }

    if (!isAuthenticated) {
      router.replace('/auth/login');
      return;
    }

    void loadProfile();
  }, [isAuthenticated, isMounted, router]);

  const loadProfile = async () => {
    try {
      setError('');
      const data = await apiGet<{ user: any }>(API_ENDPOINTS.AUTH.ME);
      const user = data.user;
      setProfile({
        fullName: user.fullName || '',
        email: user.email || '',
        targetRole: user.targetRole || '',
        experienceLevel: user.experienceLevel || 'ENTRY',
        preferredLang: user.preferredLang || 'en',
      });
      updateUser({ ...(storeUser || {}), ...user } as any);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const showNotice = (message: string) => {
    setNotice(message);
    setTimeout(() => setNotice(''), 2500);
  };

  const handleProfileSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSaving(true);

    try {
      const data = await apiPut<{ user: any }>(API_ENDPOINTS.AUTH.PROFILE, {
        fullName: profile.fullName,
        targetRole: profile.targetRole,
        experienceLevel: profile.experienceLevel,
        preferredLang: profile.preferredLang,
      });
      updateUser({ ...(storeUser || {}), ...data.user } as any);
      showNotice('Profile updated');
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    setPasswordSaving(true);
    try {
      const data = await apiPost<{ message: string }>(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showNotice(data.message || 'Password changed');
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setPasswordSaving(false);
    }
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-950">Profile</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your account details and password.
          </p>
        </div>

        {(error || notice) && (
          <div
            className={`mb-5 rounded-md border px-4 py-3 text-sm ${
              error ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'
            }`}
          >
            {error || notice}
          </div>
        )}

        {loading ? (
          <div className="rounded-lg border border-slate-200 bg-white p-8 text-sm text-slate-500">
            Loading profile...
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            <form onSubmit={handleProfileSubmit} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-indigo-50 text-indigo-600">
                  <UserRound className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-950">Personal details</h2>
                  <p className="text-sm text-slate-500">Used for your account and resume defaults.</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Full name</label>
                  <input
                    value={profile.fullName}
                    onChange={(event) => setProfile((prev) => ({ ...prev, fullName: (event.target as any).value }))}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
                  <input
                    value={profile.email}
                    className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-slate-500"
                    disabled
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Target role</label>
                  <input
                    value={profile.targetRole}
                    onChange={(event) => setProfile((prev) => ({ ...prev, targetRole: (event.target as any).value }))}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    placeholder="Frontend Developer"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Experience level</label>
                  <select
                    value={profile.experienceLevel}
                    onChange={(event) => setProfile((prev) => ({ ...prev, experienceLevel: (event.target as any).value }))}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  >
                    {EXPERIENCE_LEVELS.map((level) => (
                      <option key={level.value} value={level.value}>{level.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Preferred language</label>
                  <select
                    value={profile.preferredLang}
                    onChange={(event) => setProfile((prev) => ({ ...prev, preferredLang: (event.target as any).value }))}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  >
                    {LANGUAGES.map((language) => (
                      <option key={language.value} value={language.value}>{language.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="mt-5 inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save profile'}
              </button>
            </form>

            <form onSubmit={handlePasswordSubmit} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-slate-700">
                  <LockKeyhole className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-950">Change password</h2>
                  <p className="text-sm text-slate-500">Update your password after login.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Current password</label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(event) => setPasswordForm((prev) => ({ ...prev, currentPassword: (event.target as any).value }))}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">New password</label>
                  <input
                    type="password"
                    minLength={8}
                    value={passwordForm.newPassword}
                    onChange={(event) => setPasswordForm((prev) => ({ ...prev, newPassword: (event.target as any).value }))}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Confirm new password</label>
                  <input
                    type="password"
                    minLength={8}
                    value={passwordForm.confirmPassword}
                    onChange={(event) => setPasswordForm((prev) => ({ ...prev, confirmPassword: (event.target as any).value }))}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={passwordSaving}
                className="mt-5 inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <LockKeyhole className="h-4 w-4" />
                {passwordSaving ? 'Updating...' : 'Update password'}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
