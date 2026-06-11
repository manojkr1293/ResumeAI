'use client';

import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/constants';
import {
  AdminAccessDenied,
  AdminShell,
  BarRow,
  ErrorNotice,
  LoadingPanel,
  Panel,
  formatDateTime,
  useAdminGate,
} from '../_components/admin-ui';

export default function AdminAiPage() {
  const { mounted, isAuthenticated, router } = useAdminGate();
  const [ai, setAi] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    if (!mounted || !isAuthenticated) return;
    void loadAi();
  }, [mounted, isAuthenticated]);

  const loadAi = async () => {
    try {
      setLoading(true);
      setError('');
      setAi(await apiGet<any>(API_ENDPOINTS.ADMIN.AI));
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 401) return router.replace('/admin/login');
      if (status === 403) return setAccessDenied(true);
      setError(err?.response?.data?.error?.message || err?.message || 'Could not load AI usage');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;
  if (accessDenied) return <AdminAccessDenied />;

  const maxAiUsage = Math.max(...(ai?.byModule || []).map((item: any) => item.count), 1);

  return (
    <AdminShell title="AI Usage" description="See which AI features users depend on and where token usage is going.">
      <ErrorNotice message={error} />
      {loading ? (
        <LoadingPanel label="Loading AI usage..." />
      ) : (
        <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <Panel title="Usage by Feature">
            <div className="space-y-4">
              {(ai?.byModule || []).map((item: any) => (
                <BarRow key={item.moduleName} label={item.moduleName} value={item.count} max={maxAiUsage} helper={`${item.tokenUsage || 0} tokens`} />
              ))}
            </div>
          </Panel>

          <Panel title="Recent AI Requests">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Feature</th>
                    <th className="px-4 py-3 font-semibold">User</th>
                    <th className="px-4 py-3 font-semibold">Resume</th>
                    <th className="px-4 py-3 font-semibold">Tokens</th>
                    <th className="px-4 py-3 font-semibold">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(ai?.recent || []).map((item: any) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 font-medium text-slate-900">{item.moduleName}</td>
                      <td className="px-4 py-3 text-slate-600">{item.user?.email || '-'}</td>
                      <td className="px-4 py-3 text-slate-600">{item.resume?.title || '-'}</td>
                      <td className="px-4 py-3 text-slate-600">{item.tokenUsage || 0}</td>
                      <td className="px-4 py-3 text-slate-600">{formatDateTime(item.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>
      )}
    </AdminShell>
  );
}
