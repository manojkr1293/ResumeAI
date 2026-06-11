'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Eye, EyeOff, FileText, Loader2, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { apiPost } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/constants';
import { useAuthStore } from '@/stores/auth.store';
import { getMarketingContext } from '@/components/analytics-tracker';
import type { AuthenticatedUser } from '@/types';

const getErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as any).response;
    return response?.data?.error?.message || response?.data?.message || 'Registration failed';
  }
  return error instanceof Error ? error.message : 'Registration failed';
};

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    experienceLevel: 'ENTRY',
    preferredLang: 'en',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordChecks = useMemo(() => [
    { label: '8+ characters', valid: formData.password.length >= 8 },
    { label: 'Includes a letter', valid: /[a-z]/i.test(formData.password) },
    { label: 'Includes a number', valid: /\d/.test(formData.password) },
  ], [formData.password]);
  const passwordStrength = passwordChecks.filter((item) => item.valid).length;
  const passwordStrengthLabel = passwordStrength === 3 ? 'Strong' : passwordStrength === 2 ? 'Good' : 'Weak';

  const fieldErrors = {
    fullName: touched.fullName && !formData.fullName.trim() ? 'Full name is required.' : '',
    email: touched.email && formData.email && !isValidEmail(formData.email) ? 'Enter a valid email address.' : '',
    password: touched.password && formData.password.length > 0 && formData.password.length < 8 ? 'Password must be at least 8 characters.' : '',
    confirmPassword: touched.confirmPassword && formData.confirmPassword && formData.confirmPassword !== formData.password
      ? 'Passwords do not match.'
      : '',
  };

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setTouched({ fullName: true, email: true, password: true, confirmPassword: true });
    setError('');

    if (
      !formData.fullName.trim() ||
      !isValidEmail(formData.email) ||
      formData.password.length < 8 ||
      formData.password !== formData.confirmPassword
    ) {
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword: _confirmPassword, ...payload } = formData;
      const data = await apiPost<AuthenticatedUser>(API_ENDPOINTS.AUTH.REGISTER, { ...payload, marketing: getMarketingContext() });
      setAuth(data.user, data.tokens);
      router.replace('/dashboard');
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = event.target as any;
    setFormData((prev) => ({
      ...prev,
      [target.name]: target.value,
    }));
  };

  const handleGoogleLogin = () => {
    const win = globalThis as any;
    win.location.href = `${API_BASE_URL}${API_ENDPOINTS.AUTH.GOOGLE}`;
  };

  const markTouched = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="mb-6 text-center">
          <Link href="/" className="inline-flex items-center justify-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-indigo-600 text-white">
              <FileText className="h-5 w-5" />
            </span>
            <span className="text-lg font-bold text-slate-950">ResumeAI</span>
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-slate-950">Create your account</h1>
          <p className="mt-2 text-sm text-slate-500">
            Start building tailored resumes for each job role.
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
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400">or create with email</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label htmlFor="fullName" className="mb-1 block text-sm font-medium text-slate-700">
                Full name
              </label>
              <div className="relative">
                <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onBlur={() => markTouched('fullName')}
                  onChange={handleChange}
                  className="w-full rounded-md border border-slate-300 py-2 pl-9 pr-3 text-slate-950 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  placeholder="Your full name"
                />
              </div>
              {fieldErrors.fullName && <p className="mt-1 text-xs text-rose-600">{fieldErrors.fullName}</p>}
            </div>

            <div className="md:col-span-2">
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
                  value={formData.email}
                  onBlur={() => markTouched('email')}
                  onChange={handleChange}
                  className="w-full rounded-md border border-slate-300 py-2 pl-9 pr-3 text-slate-950 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  placeholder="you@example.com"
                />
              </div>
              {fieldErrors.email && <p className="mt-1 text-xs text-rose-600">{fieldErrors.email}</p>}
            </div>

            <PasswordField
              id="password"
              name="password"
              label="Password"
              value={formData.password}
              show={showPassword}
              autoComplete="new-password"
              onToggle={() => setShowPassword((value) => !value)}
              onBlur={() => markTouched('password')}
              onChange={handleChange}
            />
            <PasswordField
              id="confirmPassword"
              name="confirmPassword"
              label="Confirm password"
              value={formData.confirmPassword}
              show={showConfirmPassword}
              autoComplete="new-password"
              onToggle={() => setShowConfirmPassword((value) => !value)}
              onBlur={() => markTouched('confirmPassword')}
              onChange={handleChange}
            />
            {(fieldErrors.password || fieldErrors.confirmPassword) && (
              <div className="md:col-span-2 -mt-2">
                {fieldErrors.password && <p className="text-xs text-rose-600">{fieldErrors.password}</p>}
                {fieldErrors.confirmPassword && <p className="text-xs text-rose-600">{fieldErrors.confirmPassword}</p>}
              </div>
            )}

            <div className="md:col-span-2 rounded-md border border-slate-200 bg-slate-50 p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Password strength</p>
                <span className="text-xs font-semibold text-slate-700">{passwordStrengthLabel}</span>
              </div>
              <div className="mb-3 grid grid-cols-3 gap-1">
                {[0, 1, 2].map((index) => (
                  <div
                    key={index}
                    className={`h-1.5 rounded-full ${index < passwordStrength ? 'bg-indigo-600' : 'bg-slate-200'}`}
                  />
                ))}
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                {passwordChecks.map((item) => (
                  <div key={item.label} className="flex items-center gap-1.5 text-xs text-slate-600">
                    <CheckCircle2 className={`h-3.5 w-3.5 ${item.valid ? 'text-emerald-600' : 'text-slate-300'}`} />
                    {item.label}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="experienceLevel" className="mb-1 block text-sm font-medium text-slate-700">
                Experience level
              </label>
              <select
                id="experienceLevel"
                name="experienceLevel"
                required
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                value={formData.experienceLevel}
                onChange={handleChange}
              >
                <option value="INTERN">Intern</option>
                <option value="ENTRY">Entry Level</option>
                <option value="MID">Mid Level</option>
                <option value="SENIOR">Senior</option>
                <option value="LEAD">Lead</option>
                <option value="EXECUTIVE">Executive</option>
              </select>
            </div>

            <div>
              <label htmlFor="preferredLang" className="mb-1 block text-sm font-medium text-slate-700">
                Preferred language
              </label>
              <select
                id="preferredLang"
                name="preferredLang"
                required
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-950 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                value={formData.preferredLang}
                onChange={handleChange}
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="zh">Chinese</option>
                <option value="ja">Japanese</option>
                <option value="ko">Korean</option>
                <option value="pt">Portuguese</option>
                <option value="ar">Arabic</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? 'Creating account...' : 'Create account and start building'}
          </button>

          <p className="mt-4 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
              Sign in
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

function PasswordField({
  id,
  name,
  label,
  value,
  show,
  autoComplete,
  onToggle,
  onBlur,
  onChange,
}: {
  id: string;
  name: string;
  label: string;
  value: string;
  show: boolean;
  autoComplete: string;
  onToggle: () => void;
  onBlur: () => void;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="relative">
        <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          id={id}
          name={name}
          type={show ? 'text' : 'password'}
          autoComplete={autoComplete}
          required
          minLength={8}
          value={value}
          onBlur={onBlur}
          onChange={onChange}
          className="w-full rounded-md border border-slate-300 py-2 pl-9 pr-10 text-slate-950 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          placeholder={label}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-2 top-1/2 rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800 -translate-y-1/2"
          title={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
