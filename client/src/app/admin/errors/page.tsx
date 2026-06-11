'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { apiGet } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/constants';
import {
  AdminAccessDenied,
  AdminShell,
  EmptyState,
  ErrorNotice,
  LoadingPanel,
  Metric,
  Panel,
  formatDateTime,
  useAdminGate,
} from '../_components/admin-ui';

export default function AdminErrorsPage() {
  const { mounted, isAuthenticated, router } = useAdminGate();
  const [range, setRange] = useState('30d');
  const [errorsReport, setErrorsReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    if (!mounted || !isAuthenticated) return;
    void loadErrors();
  }, [mounted, isAuthenticated, range]);

  const loadErrors = async () => {
    try {
      setLoading(true);
      setError('');
      setErrorsReport(await apiGet<any>(API_ENDPOINTS.ADMIN.ERRORS, { range }));
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 401) return router.replace('/admin/login');
      if (status === 403) return setAccessDenied(true);
      setError(err?.response?.data?.error?.message || err?.message || 'Could not load errors');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;
  if (accessDenied) return <AdminAccessDenied />;

  return (
    <AdminShell
      title="Errors"
      description="Monitor API failures grouped by endpoint and status so production issues are easier to spot."
      range={range}
      onRangeChange={setRange}
    >
      <ErrorNotice message={error} />
      {loading ? (
        <LoadingPanel label="Loading error monitor..." />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Metric icon={AlertTriangle} label="API errors" value={errorsReport?.total || 0} helper={`Tracked in ${range}`} />
            {(errorsReport?.byCode || []).slice(0, 3).map((item: any) => (
              <div key={item.code} className="rounded-lg border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">Status / Code</p>
                <p className="mt-2 text-2xl font-bold text-slate-950">{item.code}</p>
                <p className="mt-1 text-xs text-slate-500">{item.count} errors</p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
            <Panel title="Problem Endpoints">
              <div className="space-y-3">
                {(errorsReport?.byPath || []).map((item: any) => (
                  <div key={item.path} className="rounded-md border border-rose-100 bg-rose-50 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-sm font-semibold text-rose-950">{item.path}</p>
                      <span className="rounded bg-white px-2 py-1 text-xs font-semibold text-rose-700">{item.count}</span>
                    </div>
                    <p className="mt-1 text-xs text-rose-700">Last seen {formatDateTime(item.lastSeen)}</p>
                  </div>
                ))}
                {!(errorsReport?.byPath || []).length && <EmptyState message="No API errors tracked in this range." />}
              </div>
            </Panel>

            <Panel title="Recent Failures">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Path</th>
                      <th className="px-4 py-3 font-semibold">User</th>
                      <th className="px-4 py-3 font-semibold">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(errorsReport?.recent || []).map((event: any) => (
                      <tr key={event.id}>
                        <td className="max-w-[320px] truncate px-4 py-3 font-medium text-slate-900">{event.path || '-'}</td>
                        <td className="px-4 py-3 text-slate-600">{event.user?.email || '-'}</td>
                        <td className="px-4 py-3 text-slate-600">{formatDateTime(event.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
