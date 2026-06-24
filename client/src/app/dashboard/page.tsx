'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Copy,
  Download,
  Edit3,
  ExternalLink,
  FileText,
  MoreHorizontal,
  Plus,
  Search,
  Share2,
  Sparkles,
  Star,
  Trash2,
  Upload,
  UserRound,
} from 'lucide-react';
import { apiDelete, apiGet, apiPost, apiPut } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/constants';
import { useAuthStore } from '@/stores/auth.store';
import { trackAnalyticsEvent } from '@/components/analytics-tracker';

type ResumeFilter = 'all' | 'recent' | 'ready' | 'draft';

const FILTERS: Array<{ id: ResumeFilter; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'recent', label: 'Recently updated' },
  { id: 'ready', label: 'High ATS' },
  { id: 'draft', label: 'Drafts' },
];

const getErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as any).response;
    return response?.data?.error?.message || response?.data?.message || 'Request failed';
  }
  return error instanceof Error ? error.message : 'Request failed';
};

const getSectionContent = (resume: any, sectionType: string) => {
  const section = Array.isArray(resume.sections)
    ? resume.sections.find((item: any) => item.sectionType === sectionType)
    : null;
  return section?.content || null;
};

const getResumeContactName = (resume: any) => {
  const contact = getSectionContent(resume, 'CONTACT');
  const fullName = `${contact?.firstName || ''} ${contact?.lastName || ''}`.trim();
  return fullName || null;
};

const getResumeSummary = (resume: any) => {
  const summary = getSectionContent(resume, 'SUMMARY')?.text || '';
  return summary.length > 130 ? `${summary.slice(0, 130)}...` : summary;
};

const getTargetRole = (resume: any) => {
  const title = (resume.title || '').replace(/resume$/i, '').trim();
  const experience = getSectionContent(resume, 'EXPERIENCE')?.items || [];
  const firstRole = Array.isArray(experience)
    ? experience.find((item: any) => item?.position)?.position
    : '';
  return title || firstRole || 'General role';
};

const getSectionCount = (resume: any) => {
  return Array.isArray(resume.sections)
    ? resume.sections.filter((section: any) => section.isVisible !== false).length
    : 0;
};

const getScore = (resume: any) => {
  return Math.max(Number(resume.atsScore || 0), Number(resume.overallScore || 0));
};

const getResumeStatus = (resume: any) => {
  const score = getScore(resume);
  const sectionCount = getSectionCount(resume);

  if (score >= 75) {
    return { label: 'Ready', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  }

  if (score > 0 || sectionCount >= 5 || resume.status === 'ACTIVE') {
    return { label: 'Needs Work', className: 'bg-amber-50 text-amber-700 border-amber-200' };
  }

  return { label: 'Draft', className: 'bg-slate-100 text-slate-600 border-slate-200' };
};

const formatDate = (value?: string) => {
  if (!value) {
    return 'Recently';
  }

  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export default function DashboardPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<ResumeFilter>('all');
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const [busyResumeId, setBusyResumeId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

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

    void fetchResumes();
  }, [isAuthenticated, isMounted, router]);

  const fetchResumes = async () => {
    try {
      setError('');
      const data = await apiGet<{ resumes: any[] }>(API_ENDPOINTS.RESUMES.BASE);
      setResumes(data.resumes || []);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const total = resumes.length;
    const ready = resumes.filter((resume) => getScore(resume) >= 75).length;
    const scored = resumes.filter((resume) => getScore(resume) > 0);
    const averageAts = scored.length
      ? Math.round(scored.reduce((sum, resume) => sum + getScore(resume), 0) / scored.length)
      : 0;
    const lastUpdated = resumes[0]?.updatedAt ? formatDate(resumes[0].updatedAt) : 'No activity';

    return { total, ready, averageAts, lastUpdated };
  }, [resumes]);

  const filteredResumes = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const sorted = [...resumes].sort((a, b) => {
      return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
    });

    return sorted.filter((resume) => {
      const searchText = [
        resume.title,
        getTargetRole(resume),
        getResumeContactName(resume),
        getResumeSummary(resume),
        resume.status,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      const matchesQuery = !normalizedQuery || searchText.includes(normalizedQuery);
      const score = getScore(resume);
      const status = getResumeStatus(resume).label;

      if (!matchesQuery) {
        return false;
      }

      if (activeFilter === 'ready') {
        return score >= 75;
      }

      if (activeFilter === 'draft') {
        return status === 'Draft';
      }

      if (activeFilter === 'recent') {
        return true;
      }

      return true;
    });
  }, [activeFilter, query, resumes]);

  const showNotice = (message: string) => {
    setNotice(message);
    setTimeout(() => setNotice(''), 2500);
  };

  const handleCreateBlankResume = () => {
    const win = globalThis as any;
    win?.localStorage.removeItem('scratchResume');
    router.push('/scratch');
  };

  const handleCreateFromProfile = () => {
    router.push('/profile');
  };

  const handleDuplicateResume = async (resume: any) => {
    try {
      setBusyResumeId(resume.id);
      await apiPost<{ resume: any }>(API_ENDPOINTS.RESUMES.DUPLICATE(resume.id), {
        newTitle: `${resume.title || 'Untitled Resume'} Copy`,
      });
      showNotice('Resume duplicated');
      await fetchResumes();
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setBusyResumeId(null);
    }
  };

  const handleSetPrimary = async (id: string) => {
    try {
      setBusyResumeId(id);
      await apiPut<{ resume: any }>(API_ENDPOINTS.RESUMES.PRIMARY(id));
      showNotice('Primary resume updated');
      await fetchResumes();
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setBusyResumeId(null);
    }
  };

  const handleDeleteResume = async (id: string) => {
    const win = globalThis as any;
    if (!win?.confirm('Delete this resume? This cannot be undone.')) {
      return;
    }

    try {
      setBusyResumeId(id);
      await apiDelete<{ message: string }>(API_ENDPOINTS.RESUMES.BY_ID(id));
      showNotice('Resume deleted');
      await fetchResumes();
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setBusyResumeId(null);
    }
  };

  const handleShareResume = async (id: string) => {
    const win = globalThis as any;
    const shareUrl = `${win.location.origin}/share/${id}`;
    try {
      await win.navigator?.clipboard?.writeText(shareUrl);
      trackAnalyticsEvent('resume_share', {}, 'resume', id);
      showNotice('Share link copied');
    } catch {
      showNotice(shareUrl);
    }
  };

  const handleDownloadResume = (id: string) => {
    trackAnalyticsEvent('resume_download', {}, 'resume', id);
    router.push(`/scratch?resumeId=${id}&print=1`);
  };

  const handleLogout = () => {
    logout();
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-indigo-700">Workspace</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-950">My Resumes</h2>
            <p className="mt-1 text-sm text-slate-500">
              Choose whether you want to build a new resume or optimize an existing one.
            </p>
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={() => setCreateMenuOpen((value) => !value)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              Create Resume
            </button>
            {createMenuOpen && (
              <div className="absolute right-0 z-10 mt-2 w-64 rounded-lg border border-slate-200 bg-white p-2 shadow-lg">
                <button
                  type="button"
                  onClick={handleCreateBlankResume}
                  className="flex w-full items-start gap-3 rounded-md px-3 py-3 text-left hover:bg-slate-50"
                >
                  <FileText className="mt-0.5 h-4 w-4 text-indigo-600" />
                  <span>
                    <span className="block text-sm font-semibold text-slate-950">Blank Resume</span>
                    <span className="block text-xs text-slate-500">
                      Start step by step from scratch.
                    </span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleCreateFromProfile}
                  className="flex w-full items-start gap-3 rounded-md px-3 py-3 text-left hover:bg-slate-50"
                >
                  <Sparkles className="mt-0.5 h-4 w-4 text-indigo-600" />
                  <span>
                    <span className="block text-sm font-semibold text-slate-950">From Profile</span>
                    <span className="block text-xs text-slate-500">
                      Use your profile data and AI suggestions.
                    </span>
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mb-6 grid gap-4 lg:grid-cols-2">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-indigo-50 text-indigo-700">
                <FileText className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-indigo-700">Create Resume</p>
                <h3 className="mt-1 text-lg font-bold text-slate-950">Build from scratch</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Start a fresh resume with guided sections, autosave, preview, and download.
                </p>
                <button
                  type="button"
                  onClick={handleCreateBlankResume}
                  className="mt-4 inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  <Plus className="h-4 w-4" />
                  Create from Scratch
                </button>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-emerald-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
                <Upload className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-emerald-700">Optimize Resume</p>
                <h3 className="mt-1 text-lg font-bold text-slate-950">Upload existing resume</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Upload PDF/DOCX or paste resume text, add a job description, and get ATS +
                  LinkedIn + cover letter output.
                </p>
                <Link
                  href="/optimize"
                  className="mt-4 inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  <Sparkles className="h-4 w-4" />
                  Optimize Existing Resume
                </Link>
              </div>
            </div>
          </section>
        </div>

        {(error || notice) && (
          <div
            className={`mb-4 rounded-md border px-4 py-3 text-sm ${
              error
                ? 'border-rose-200 bg-rose-50 text-rose-700'
                : 'border-emerald-200 bg-emerald-50 text-emerald-700'
            }`}
          >
            {error || notice}
          </div>
        )}

        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Resumes"
            value={stats.total.toString()}
            helper="All active resumes"
          />
          <StatCard label="Ready Resumes" value={stats.ready.toString()} helper="ATS score 75+" />
          <StatCard
            label="Average ATS"
            value={stats.averageAts ? `${stats.averageAts}%` : '-'}
            helper="Across scored resumes"
          />
          <StatCard label="Last Updated" value={stats.lastUpdated} helper="Most recent activity" />
        </div>

        <div className="mb-5 rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery((event.target as any).value)}
                className="w-full rounded-md border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-950 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                placeholder="Search by title, role, name, or status"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {FILTERS.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setActiveFilter(filter.id)}
                  className={`rounded-md px-3 py-2 text-sm font-medium ${
                    activeFilter === filter.id
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="rounded-lg border border-slate-200 bg-white py-16 text-center text-sm text-slate-500">
            Loading resumes...
          </div>
        ) : resumes.length === 0 ? (
          <EmptyState
            onCreateBlank={handleCreateBlankResume}
            onCreateFromProfile={handleCreateFromProfile}
          />
        ) : filteredResumes.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white py-14 text-center">
            <p className="text-sm font-medium text-slate-900">No resumes match this view.</p>
            <p className="mt-1 text-sm text-slate-500">Try another filter or search term.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredResumes.map((resume, index) => (
              <ResumeCard
                key={resume.id}
                resume={resume}
                index={index}
                busy={busyResumeId === resume.id}
                onDelete={() => void handleDeleteResume(resume.id)}
                onDuplicate={() => void handleDuplicateResume(resume)}
                onDownload={() => handleDownloadResume(resume.id)}
                onPrimary={() => void handleSetPrimary(resume.id)}
                onShare={() => void handleShareResume(resume.id)}
              />
            ))}
          </div>
        )}

        {resumes.length > 0 && (
          <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-slate-950">Recent activity</h3>
            <div className="mt-3 space-y-2">
              {resumes.slice(0, 3).map((resume) => (
                <div
                  key={`activity-${resume.id}`}
                  className="flex items-center justify-between gap-4 text-sm"
                >
                  <span className="truncate text-slate-700">
                    {resume.title || 'Untitled Resume'} updated
                  </span>
                  <span className="shrink-0 text-slate-500">{formatDate(resume.updatedAt)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{helper}</p>
    </div>
  );
}

function EmptyState({
  onCreateBlank,
  onCreateFromProfile,
}: {
  onCreateBlank: () => void;
  onCreateFromProfile: () => void;
}) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-indigo-50 text-indigo-600">
        <FileText className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-950">Create your first resume</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
        Start with a blank builder, use profile data, or optimize an existing resume upload.
      </p>
      <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
        <button
          type="button"
          onClick={onCreateBlank}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          Start from Scratch
        </button>
        <button
          type="button"
          onClick={onCreateFromProfile}
          className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <Sparkles className="h-4 w-4" />
          Use Profile Data
        </button>
        <Link
          href="/optimize"
          className="inline-flex items-center justify-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
        >
          <Upload className="h-4 w-4" />
          Optimize Upload
        </Link>
      </div>
    </div>
  );
}

function ResumeCard({
  resume,
  index,
  busy,
  onDelete,
  onDuplicate,
  onDownload,
  onPrimary,
  onShare,
}: {
  resume: any;
  index: number;
  busy: boolean;
  onDelete: () => void;
  onDuplicate: () => void;
  onDownload: () => void;
  onPrimary: () => void;
  onShare: () => void;
}) {
  const status = getResumeStatus(resume);
  const score = getScore(resume);
  const contactName = getResumeContactName(resume);
  const summary = getResumeSummary(resume);
  const targetRole = getTargetRole(resume);
  const sectionCount = getSectionCount(resume);

  return (
    <article
      className={`rounded-lg border bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md ${
        resume.isPrimary ? 'border-indigo-300 ring-1 ring-indigo-100' : 'border-slate-200'
      }`}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex min-w-0 gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-100 text-sm font-semibold text-slate-700">
            {index + 1}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-base font-semibold text-slate-950">
                {resume.title || 'Untitled Resume'}
              </h3>
              {resume.isPrimary && (
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                  <Star className="h-3 w-3 fill-current" />
                  Primary
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-slate-500">{targetRole}</p>
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${status.className}`}
        >
          {status.label}
        </span>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2 rounded-md bg-slate-50 p-3 text-center">
        <div>
          <p className="text-xs text-slate-500">ATS</p>
          <p className="text-sm font-semibold text-slate-950">{score ? `${score}%` : '-'}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Sections</p>
          <p className="text-sm font-semibold text-slate-950">{sectionCount}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Updated</p>
          <p className="text-sm font-semibold text-slate-950">{formatDate(resume.updatedAt)}</p>
        </div>
      </div>

      {contactName && <p className="mb-1 text-sm font-medium text-slate-800">{contactName}</p>}
      {summary ? (
        <p className="mb-4 min-h-10 text-sm leading-6 text-slate-500">{summary}</p>
      ) : (
        <p className="mb-4 min-h-10 text-sm leading-6 text-slate-400">
          No summary yet. Add one to make this resume easier to evaluate.
        </p>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        <Link
          href={`/scratch?resumeId=${resume.id}`}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          <Edit3 className="h-4 w-4" />
          Edit
        </Link>
        <Link
          href={`/share/${resume.id}`}
          className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          title="Preview"
        >
          <ExternalLink className="h-4 w-4" />
        </Link>
        <button
          type="button"
          onClick={onDownload}
          className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          title="Download"
        >
          <Download className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onShare}
          className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          title="Copy share link"
        >
          <Share2 className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={onPrimary}
          disabled={busy || resume.isPrimary}
          className="inline-flex items-center justify-center gap-1 rounded-md px-2 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          title="Set primary"
        >
          <Star className="h-3.5 w-3.5" />
          Primary
        </button>
        <button
          type="button"
          onClick={onDuplicate}
          disabled={busy}
          className="inline-flex items-center justify-center gap-1 rounded-md px-2 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          title="Duplicate"
        >
          <Copy className="h-3.5 w-3.5" />
          Copy
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={busy}
          className="inline-flex items-center justify-center gap-1 rounded-md px-2 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
          title="Delete"
        >
          {busy ? <MoreHorizontal className="h-3.5 w-3.5" /> : <Trash2 className="h-3.5 w-3.5" />}
          Delete
        </button>
      </div>
    </article>
  );
}
