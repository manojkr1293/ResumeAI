'use client';

import { useEffect, useState } from 'react';
import { Activity, Download, Share2, Users } from 'lucide-react';
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
} from '../_components/admin-ui';

export default function AdminAnalyticsPage() {
  const { mounted, isAuthenticated, router } = useAdminGate();
  const [range, setRange] = useState('30d');
  const [overview, setOverview] = useState<any>(null);
  const [funnel, setFunnel] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    if (!mounted || !isAuthenticated) return;
    void loadAnalytics();
  }, [mounted, isAuthenticated, range]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      const [overviewData, funnelData, activityData] = await Promise.all([
        apiGet<any>(API_ENDPOINTS.ADMIN.OVERVIEW, { range }),
        apiGet<any>(API_ENDPOINTS.ADMIN.FUNNEL, { range }),
        apiGet<any>(API_ENDPOINTS.ADMIN.ACTIVITY, { range }),
      ]);
      setOverview(overviewData);
      setFunnel(funnelData.funnel || []);
      setActivity(activityData.events || []);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 401) return router.replace('/admin/login');
      if (status === 403) return setAccessDenied(true);
      setError(err?.response?.data?.error?.message || err?.message || 'Could not load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;
  if (accessDenied) return <AdminAccessDenied />;

  const stats = overview?.overview || {};
  const maxFunnel = Math.max(...funnel.map((item) => item.value), 1);

  return (
    <AdminShell
      title="Analytics"
      description="Understand visitor flow, conversion, tracked actions, and recent activity."
      range={range}
      onRangeChange={setRange}
    >
      <ErrorNotice message={error} />
      {loading ? (
        <LoadingPanel label="Loading analytics..." />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Metric icon={Activity} label="Visitors" value={stats.visitors} helper={`${stats.pageViews || 0} page views`} />
            <Metric icon={Users} label="Signup conversion" value={`${stats.signupConversion || 0}%`} helper={`${stats.signups || 0} signups, ${stats.logins || 0} logins`} />
            <Metric icon={Download} label="Downloads" value={stats.downloads} helper="Tracked resume downloads" />
            <Metric icon={Share2} label="Shares" value={stats.shares} helper="Tracked share actions" />
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <Panel title="Conversion Funnel">
              <div className="space-y-4">
                {funnel.map((item) => (
                  <BarRow key={item.label} label={item.label} value={item.value} max={maxFunnel} />
                ))}
              </div>
            </Panel>

            <Panel title="Activity Timeline">
              <div className="space-y-3">
                {activity.map((event) => (
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
        </div>
      )}
    </AdminShell>
  );
}
