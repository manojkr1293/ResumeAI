'use client';

import { useEffect, useState } from 'react';
import { Activity, Bot, Download, FileText, Gauge, Share2, Users } from 'lucide-react';
import { apiGet } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/constants';
import {
  AdminAccessDenied,
  AdminShell,
  BarRow,
  ErrorNotice,
  LoadingPanel,
  Metric,
  Panel,
  formatDateTime,
  useAdminGate,
} from './_components/admin-ui';

export default function AdminOverviewPage() {
  const { mounted, isAuthenticated, router } = useAdminGate();
  const [range, setRange] = useState('30d');
  const [overview, setOverview] = useState<any>(null);
  const [resumes, setResumes] = useState<any>(null);
  const [ai, setAi] = useState<any>(null);
  const [funnel, setFunnel] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [errorsReport, setErrorsReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    if (!mounted || !isAuthenticated) return;
    void loadReports();
  }, [mounted, isAuthenticated, range]);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError('');
      setAccessDenied(false);
      const [overviewData, resumesData, aiData, funnelData, activityData, errorsData] = await Promise.all([
        apiGet<any>(API_ENDPOINTS.ADMIN.OVERVIEW, { range }),
        apiGet<any>(API_ENDPOINTS.ADMIN.RESUMES),
        apiGet<any>(API_ENDPOINTS.ADMIN.AI),
        apiGet<any>(API_ENDPOINTS.ADMIN.FUNNEL, { range }),
        apiGet<any>(API_ENDPOINTS.ADMIN.ACTIVITY, { range }),
        apiGet<any>(API_ENDPOINTS.ADMIN.ERRORS, { range }),
      ]);
      setOverview(overviewData);
      setResumes(resumesData);
      setAi(aiData);
      setFunnel(funnelData.funnel || []);
      setActivity(activityData.events || []);
      setErrorsReport(errorsData);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 401) {
        router.replace('/admin/login');
        return;
      }
      if (status === 403) {
        setAccessDenied(true);
        return;
      }
      setError(err?.response?.data?.error?.message || err?.message || 'Could not load admin reports');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;
  if (accessDenied) return <AdminAccessDenied />;

  const stats = overview?.overview || {};
  const maxFunnel = Math.max(...funnel.map((item) => item.value), 1);
  const maxAiUsage = Math.max(...(ai?.byModule || []).map((item: any) => item.count), 1);

  return (
    <AdminShell
      title="Admin Overview"
      description="High-level growth, resume quality, AI usage, funnel, and site health."
      range={range}
      onRangeChange={setRange}
    >
      <ErrorNotice message={error} />
      {loading ? (
        <LoadingPanel />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Metric icon={Users} label="Total users" value={stats.totalUsers} helper={`${stats.usersInRange || 0} new in range`} />
            <Metric icon={FileText} label="Total resumes" value={stats.totalResumes} helper={`${stats.resumesInRange || 0} created in range`} />
            <Metric icon={Bot} label="AI usage" value={stats.totalAiEvents} helper={`${stats.aiEventsInRange || 0} AI actions in range`} />
            <Metric icon={Gauge} label="Avg ATS score" value={`${stats.avgAtsScore || 0}%`} helper={`${stats.atsAnalyses || 0} ATS analyses`} />
            <Metric icon={Activity} label="Visitors" value={stats.visitors} helper={`${stats.pageViews || 0} page views`} />
            <Metric icon={Users} label="Signup conversion" value={`${stats.signupConversion || 0}%`} helper={`${stats.signups || 0} signups, ${stats.logins || 0} logins`} />
            <Metric icon={Download} label="Downloads" value={stats.downloads} helper="Tracked dashboard downloads" />
            <Metric icon={Share2} label="Shares" value={stats.shares} helper="Tracked share link copies" />
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <Panel title="Conversion Funnel">
              <div className="space-y-4">
                {funnel.map((item) => (
                  <BarRow key={item.label} label={item.label} value={item.value} max={maxFunnel} />
                ))}
              </div>
            </Panel>

            <Panel title="Resume Quality Gaps">
              <div className="grid gap-3 sm:grid-cols-2">
                {Object.entries(resumes?.sectionGaps || {}).map(([key, value]) => (
                  <div key={key} className="rounded-md bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase text-slate-500">{key.replace(/([A-Z])/g, ' $1')}</p>
                    <p className="mt-2 text-2xl font-bold text-slate-950">{String(value)}</p>
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <Panel title="AI Usage by Feature">
              <div className="space-y-4">
                {(ai?.byModule || []).slice(0, 8).map((item: any) => (
                  <BarRow key={item.moduleName} label={item.moduleName} value={item.count} max={maxAiUsage} helper={`${item.tokenUsage || 0} tokens`} />
                ))}
              </div>
            </Panel>

            <Panel title="Recent Activity">
              <div className="space-y-3">
                {activity.slice(0, 8).map((event) => (
                  <div key={event.id} className="flex gap-3 rounded-md border border-slate-100 bg-slate-50 p-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-indigo-500" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900">{event.eventType.replace(/_/g, ' ')}</p>
                      <p className="truncate text-xs text-slate-500">{event.user?.email || event.path || event.sessionId}</p>
                    </div>
                    <span className="shrink-0 text-xs text-slate-500">{formatDateTime(event.createdAt)}</span>
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          <Panel title="Site Health">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-md bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">API errors</p>
                <p className="mt-2 text-2xl font-bold text-slate-950">{errorsReport?.total || 0}</p>
              </div>
              {(errorsReport?.byPath || []).slice(0, 2).map((item: any) => (
                <div key={item.path} className="rounded-md bg-rose-50 p-4">
                  <p className="truncate text-xs font-semibold uppercase text-rose-700">{item.path}</p>
                  <p className="mt-2 text-2xl font-bold text-rose-950">{item.count}</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}
    </AdminShell>
  );
}
