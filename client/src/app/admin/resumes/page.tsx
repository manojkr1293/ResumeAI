'use client';

import { useEffect, useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import { apiGet } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/constants';
import {
  AdminAccessDenied,
  AdminShell,
  ErrorNotice,
  LoadingPanel,
  Panel,
  SearchBox,
  downloadCsv,
  formatDate,
  useAdminGate,
} from '../_components/admin-ui';

export default function AdminResumesPage() {
  const { mounted, isAuthenticated, router } = useAdminGate();
  const [resumes, setResumes] = useState<any>(null);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    if (!mounted || !isAuthenticated) return;
    void loadResumes();
  }, [mounted, isAuthenticated]);

  const loadResumes = async () => {
    try {
      setLoading(true);
      setError('');
      setResumes(await apiGet<any>(API_ENDPOINTS.ADMIN.RESUMES));
    } catch (err: any) {
      const httpStatus = err?.response?.status;
      if (httpStatus === 401) return router.replace('/admin/login');
      if (httpStatus === 403) return setAccessDenied(true);
      setError(err?.response?.data?.error?.message || err?.message || 'Could not load resumes');
    } finally {
      setLoading(false);
    }
  };

  const filteredResumes = useMemo(() => {
    const value = query.trim().toLowerCase();
    return (resumes?.resumes || []).filter((resume: any) => {
      const matchesStatus = status === 'all' || String(resume.status).toLowerCase() === status;
      const matchesQuery = !value || [resume.title, resume.owner?.email, resume.owner?.fullName, resume.status].some((item) =>
        String(item || '').toLowerCase().includes(value)
      );
      return matchesStatus && matchesQuery;
    });
  }, [resumes, query, status]);

  if (!mounted) return null;
  if (accessDenied) return <AdminAccessDenied />;

  return (
    <AdminShell title="Resumes" description="Review resume inventory, ATS scores, quality gaps, target roles, and status.">
      <ErrorNotice message={error} />
      {loading ? (
        <LoadingPanel label="Loading resumes..." />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Object.entries(resumes?.sectionGaps || {}).map(([key, value]) => (
              <div key={key} className="rounded-lg border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">{key.replace(/([A-Z])/g, ' $1')}</p>
                <p className="mt-2 text-2xl font-bold text-slate-950">{String(value)}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
            <Panel
              title="Resume Report"
              action={
                <button
                  type="button"
                  onClick={() => downloadCsv('resumeai-resumes.csv', filteredResumes.map((resume: any) => ({
                    title: resume.title,
                    owner: resume.owner?.email,
                    status: resume.status,
                    atsScore: resume.atsScore,
                    overallScore: resume.overallScore,
                    updated: formatDate(resume.updatedAt),
                  })))}
                  className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <Download className="h-3.5 w-3.5" />
                  CSV
                </button>
              }
            >
              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <SearchBox value={query} onChange={setQuery} placeholder="Search resumes by title, owner, status..." />
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="all">All status</option>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Resume</th>
                      <th className="px-4 py-3 font-semibold">Owner</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold">ATS</th>
                      <th className="px-4 py-3 font-semibold">Overall</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredResumes.map((resume: any) => (
                      <tr key={resume.id}>
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-900">{resume.title || '-'}</p>
                          <p className="text-xs text-slate-500">Updated {formatDate(resume.updatedAt)}</p>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{resume.owner?.email || '-'}</td>
                        <td className="px-4 py-3 text-slate-600">{resume.status}</td>
                        <td className="px-4 py-3 text-slate-600">{resume.atsScore || 0}%</td>
                        <td className="px-4 py-3 text-slate-600">{resume.overallScore || 0}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>

            <Panel title="Top Target Roles">
              <div className="space-y-3">
                {(resumes?.topRoles || []).map((item: any) => (
                  <div key={item.role} className="flex items-center justify-between rounded-md bg-slate-50 p-3 text-sm">
                    <span className="font-medium text-slate-700">{item.role}</span>
                    <span className="text-slate-500">{item.count}</span>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
