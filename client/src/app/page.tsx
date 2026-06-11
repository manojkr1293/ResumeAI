'use client';

import Link from 'next/link';
import {
  Bot,
  CheckCircle2,
  FileText,
  Gauge,
  LayoutDashboard,
  LockKeyhole,
  MessageSquareText,
  PenLine,
  Share2,
  Sparkles,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';

const mainFeatures = [
  {
    icon: LayoutDashboard,
    title: 'Manage resumes by role',
    description: 'Create, duplicate, preview, download, delete, and mark a primary resume from one quiet dashboard.',
  },
  {
    icon: Sparkles,
    title: 'Improve content with AI',
    description: 'Generate summaries, sharpen bullets, improve project descriptions, and get resume coach feedback.',
  },
  {
    icon: Gauge,
    title: 'Check readiness before applying',
    description: 'Run ATS matching, see missing keywords, and follow a focused checklist before downloading.',
  },
];

const supportFeatures = [
  { icon: PenLine, label: 'AI summary generator' },
  { icon: Bot, label: 'Skill suggestions' },
  { icon: MessageSquareText, label: 'Resume coach' },
  { icon: Share2, label: 'Shareable links' },
];

const resumeVersions = [
  { title: 'Frontend Resume', score: '84%', status: 'Primary' },
  { title: 'Data Analyst Resume', score: '76%', status: 'Tailored' },
  { title: 'Backend Resume', score: 'Draft', status: 'In progress' },
];

const workflow = [
  ['Create profile', 'Save account and role defaults.'],
  ['Build resume', 'Fill each section step by step.'],
  ['Analyze ATS', 'Match against a job description.'],
  ['Download or share', 'Print cleanly or copy a link.'],
];

export default function HomePage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const primaryHref = isAuthenticated ? '/dashboard' : '/auth/register';
  const primaryLabel = isAuthenticated ? 'Go to Dashboard' : 'Create Resume';
  const secondaryHref = isAuthenticated ? '/scratch' : '/auth/login';
  const secondaryLabel = isAuthenticated ? 'Start New Resume' : 'Sign in';

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <nav className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-indigo-600 text-white">
              <FileText className="h-5 w-5" />
            </span>
            <span className="text-lg font-bold">ResumeAI</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href={secondaryHref}
              className="rounded-md px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-950"
            >
              {secondaryLabel}
            </Link>
            <Link
              href={primaryHref}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              {primaryLabel}
            </Link>
          </div>
        </div>
      </nav>

      <section className="mx-auto grid max-w-7xl gap-16 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-8 lg:pb-28 lg:pt-24">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-700">
            <Sparkles className="h-4 w-4" />
            AI resume builder for targeted applications
          </div>
          <h1 className="max-w-2xl text-4xl font-bold leading-tight text-slate-950 sm:text-5xl">
            Build calm, ATS-ready resumes for every job role
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-slate-600">
            Create multiple resumes, tailor each one to a job description, improve weak content with AI, and download a clean printable resume when it is ready.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href={primaryHref}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              <FileText className="h-4 w-4" />
              {primaryLabel}
            </Link>
            <Link
              href="#how-it-works"
              className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              See product flow
            </Link>
          </div>

          <div className="mt-9 grid max-w-lg gap-3 text-sm text-slate-600 sm:grid-cols-3">
            {['ATS analysis', 'Clean PDF print', 'Share links'].map((item) => (
              <span key={item} className="inline-flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                {item}
              </span>
            ))}
          </div>
        </div>

        <ProductPreview />
      </section>

      <section id="how-it-works" className="bg-slate-50/70">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="text-sm font-semibold text-indigo-700">Product rhythm</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-950">A simple path from draft to ready</h2>
            <p className="mt-4 text-sm leading-7 text-slate-500">
              Move through the work in small steps, with AI suggestions available when they are useful.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {workflow.map(([step, description], index) => (
              <div key={step} className="rounded-lg border border-slate-200 bg-white p-5">
                <div className="mb-6 flex h-9 w-9 items-center justify-center rounded-md bg-slate-900 text-sm font-bold text-white">
                  {index + 1}
                </div>
                <h3 className="font-semibold text-slate-950">{step}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-500">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="mb-12 max-w-2xl">
          <p className="text-sm font-semibold text-indigo-700">Core value</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-950">Three things the product does well</h2>
          <p className="mt-4 text-sm leading-7 text-slate-500">
            Everything is organized around the real workflow: manage versions, improve content, and check readiness.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {mainFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="rounded-lg border border-slate-200 bg-white p-6">
                <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-md bg-indigo-50 text-indigo-700">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-slate-950">{feature.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-500">{feature.description}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {supportFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.label} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <Icon className="h-4 w-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-700">{feature.label}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-slate-50/70">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-20 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:px-8 lg:py-24">
          <div>
            <p className="text-sm font-semibold text-indigo-700">AI improvement example</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-950">Small wording changes can make impact clearer</h2>
            <p className="mt-4 text-sm leading-7 text-slate-500">
              The builder keeps suggestions hidden until the user asks for AI, then gives selectable, practical options.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-white p-5">
              <p className="mb-4 text-sm font-semibold text-slate-500">Before</p>
              <p className="text-sm leading-7 text-slate-600">
                Worked on React project and made dashboard pages for users.
              </p>
            </div>
            <div className="rounded-lg border border-emerald-200 bg-white p-5">
              <p className="mb-4 text-sm font-semibold text-emerald-700">After</p>
              <p className="text-sm leading-7 text-slate-700">
                Built a responsive React dashboard with reusable components, improving task completion speed by 30% and reducing repeated UI work across core workflows.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.85fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold text-indigo-700">Resume management</p>
            <h2 className="mt-2 max-w-2xl text-3xl font-bold text-slate-950">Different job roles deserve different resumes</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500">
              A frontend role, data analyst role, and backend role should not use the same resume. Dashboard management keeps those versions organized.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {resumeVersions.map((resume) => (
                <div key={resume.title} className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-900">{resume.title}</p>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">{resume.score}</span>
                  </div>
                  <p className="text-xs leading-5 text-slate-500">{resume.status}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-700">
                <LockKeyhole className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-950">Privacy stays simple</h3>
                <p className="mt-3 text-sm leading-7 text-slate-500">
                  Your resume data stays private. You control downloads and share links, and you can delete resumes from the dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8 lg:pb-24">
        <div className="rounded-lg border border-indigo-100 bg-indigo-50 px-6 py-10 sm:px-8 lg:flex lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-950">Ready to build a role-specific resume?</h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600">
              Start from scratch or go straight to your dashboard if you already have resumes.
            </p>
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row lg:mt-0">
            <Link
              href={primaryHref}
              className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              {primaryLabel}
            </Link>
            <Link
              href={secondaryHref}
              className="inline-flex items-center justify-center rounded-md border border-indigo-200 bg-white px-5 py-3 text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
            >
              {secondaryLabel}
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-600 text-white">
              <FileText className="h-4 w-4" />
            </span>
            <span className="text-sm font-semibold text-slate-950">ResumeAI</span>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-slate-500">
            <Link href="/dashboard" className="hover:text-slate-950">Dashboard</Link>
            <Link href="/auth/login" className="hover:text-slate-950">Login</Link>
            <Link href="/auth/register" className="hover:text-slate-950">Register</Link>
            <Link href="/profile" className="hover:text-slate-950">Profile</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

function ProductPreview() {
  return (
    <div className="rounded-lg border border-slate-100 bg-white p-3 shadow-lg shadow-slate-200/70">
      <div className="mb-3 flex items-center gap-1.5 px-1">
        <span className="h-2.5 w-2.5 rounded-full bg-rose-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
        <span className="ml-3 rounded-full bg-slate-50 px-3 py-1 text-xs text-slate-500">resumeai.local/dashboard</span>
      </div>
      <div className="rounded-md border border-slate-100 bg-white p-4 sm:p-5">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-950">Resume workspace</p>
            <p className="mt-1 text-xs text-slate-500">Dashboard, builder, and readiness in one calm flow</p>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            Ready resume found
          </span>
        </div>

        <div className="grid gap-5 lg:grid-cols-[0.82fr_1.18fr]">
          <div className="space-y-4">
            <div className="rounded-md border border-slate-100 bg-slate-50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-slate-500">My resumes</span>
                <span className="text-xs text-slate-500">3 versions</span>
              </div>
              <div className="space-y-2">
                {resumeVersions.map((resume, index) => (
                  <div
                    key={resume.title}
                    className={`rounded-md border p-3 ${
                      index === 0 ? 'border-indigo-200 bg-white' : 'border-slate-100 bg-white/80'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-xs font-semibold text-slate-800">{resume.title}</p>
                      <span className="text-xs text-slate-500">{resume.score}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-md border border-indigo-100 bg-indigo-50 p-4">
              <p className="mb-3 text-xs font-semibold uppercase text-indigo-700">ATS job match</p>
              <div className="mb-3 flex items-end gap-2">
                <p className="text-3xl font-bold text-indigo-950">82%</p>
                <p className="pb-1 text-xs font-medium text-indigo-700">Frontend role</p>
              </div>
              <div className="h-2 rounded-full bg-white">
                <div className="h-2 w-4/5 rounded-full bg-indigo-600" />
              </div>
              <p className="mt-3 text-xs leading-5 text-indigo-800">Add accessibility and testing keywords if they are honest matches.</p>
            </div>

            <div className="rounded-md border border-slate-100 bg-white p-4">
              <p className="mb-3 text-xs font-semibold uppercase text-slate-500">Actions</p>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700">
                  <FileText className="h-3 w-3" />
                  Edit
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700">
                  <Share2 className="h-3 w-3" />
                  Share
                </span>
                <span className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700">PDF</span>
              </div>
            </div>
          </div>

          <div className="rounded-md border border-slate-100 bg-white p-5 sm:p-6">
            <div className="border-b border-slate-200 pb-5 text-center">
              <p className="text-2xl font-bold text-slate-950">Manoj Kumar</p>
              <p className="mt-2 text-sm text-slate-500">Frontend Developer | Patna | LinkedIn</p>
            </div>
            <div className="mt-5 space-y-5">
              <div>
                <p className="mb-2 border-b border-slate-200 pb-1 text-xs font-bold uppercase text-slate-900">Professional Summary</p>
                <p className="text-xs leading-6 text-slate-600">
                  Frontend developer focused on responsive interfaces, React workflows, and measurable user experience improvements.
                </p>
              </div>
              <div>
                <p className="mb-2 border-b border-slate-200 pb-1 text-xs font-bold uppercase text-slate-900">Experience</p>
                <ul className="space-y-2 pl-4 text-xs leading-6 text-slate-600">
                  <li>Built reusable React components for dashboard workflows, improving repeated task speed by 30%.</li>
                  <li>Improved form usability with clearer validation, cleaner spacing, and mobile-friendly controls.</li>
                </ul>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['React', 'TypeScript', 'Tailwind', 'API Integration'].map((skill) => (
                  <span key={skill} className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
