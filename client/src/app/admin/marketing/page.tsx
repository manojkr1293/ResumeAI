'use client';

import { useEffect, useMemo, useState } from 'react';
import { Clipboard, Download, Lightbulb, Megaphone, MousePointerClick, Share2, Target, TrendingUp, Users } from 'lucide-react';
import { apiGet } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/constants';
import {
  AdminAccessDenied,
  AdminShell,
  BarRow,
  EmptyState,
  ErrorNotice,
  LoadingPanel,
  Metric,
  Panel,
  SearchBox,
  downloadCsv,
  formatDate,
  formatDateTime,
  useAdminGate,
} from '../_components/admin-ui';

export default function AdminMarketingPage() {
  const { mounted, isAuthenticated, router } = useAdminGate();
  const [range, setRange] = useState('30d');
  const [report, setReport] = useState<any>(null);
  const [leadQuery, setLeadQuery] = useState('');
  const [campaignSource, setCampaignSource] = useState('instagram');
  const [campaignName, setCampaignName] = useState('frontend_resume');
  const [campaignMedium, setCampaignMedium] = useState('social');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    if (!mounted || !isAuthenticated) return;
    void loadMarketing();
  }, [mounted, isAuthenticated, range]);

  const loadMarketing = async () => {
    try {
      setLoading(true);
      setError('');
      setReport(await apiGet<any>(API_ENDPOINTS.ADMIN.MARKETING, { range }));
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 401) return router.replace('/admin/login');
      if (status === 403) return setAccessDenied(true);
      setError(err?.response?.data?.error?.message || err?.message || 'Could not load marketing report');
    } finally {
      setLoading(false);
    }
  };

  const campaignUrl = useMemo(() => {
    if (!mounted) return '';
    const origin = globalThis.location?.origin || 'http://localhost:3000';
    const params = new URLSearchParams({
      utm_source: campaignSource.trim() || 'direct',
      utm_medium: campaignMedium.trim() || 'campaign',
      utm_campaign: campaignName.trim() || 'resumeai',
    });
    return `${origin}/auth/register?${params.toString()}`;
  }, [mounted, campaignSource, campaignMedium, campaignName]);

  const filteredLeads = useMemo(() => {
    const query = leadQuery.trim().toLowerCase();
    const leads = report?.leadExport || [];
    if (!query) return leads;
    return leads.filter((lead: any) =>
      [lead.name, lead.email, lead.targetRole, lead.source, lead.campaign, lead.stage].some((item) =>
        String(item || '').toLowerCase().includes(query)
      )
    );
  }, [report, leadQuery]);

  const copyCampaignUrl = async () => {
    await navigator.clipboard.writeText(campaignUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  if (!mounted) return null;
  if (accessDenied) return <AdminAccessDenied />;

  const success = report?.successSignals || {};
  const retention = report?.retention || {};
  const maxSourceVisitors = Math.max(...(report?.acquisition || []).map((item: any) => item.visitors), 1);
  const maxRoleCount = Math.max(...(report?.roleInsights || []).map((item: any) => item.count), 1);

  return (
    <AdminShell
      title="Marketing"
      description="Track acquisition, campaigns, lead intent, retention, and proof points for growth."
      range={range}
      onRangeChange={setRange}
    >
      <ErrorNotice message={error} />
      {loading ? (
        <LoadingPanel label="Loading marketing reports..." />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Metric icon={Users} label="Total leads" value={success.totalLeads} helper={`${success.highIntentLeads || 0} high-intent leads`} />
            <Metric icon={TrendingUp} label="Return rate" value={`${retention.returnRate || 0}%`} helper={`${retention.returningUsers || 0} returning users`} />
            <Metric icon={Target} label="High ATS resumes" value={success.highAtsResumes} helper="ATS score 80+ in range" />
            <Metric icon={Lightbulb} label="AI suggestions" value={success.aiSuggestions} helper="AI actions in range" />
            <Metric icon={Download} label="Downloads" value={success.downloads} helper="Resume download signals" />
            <Metric icon={Share2} label="Shares" value={success.shares} helper="Share intent signals" />
            <Metric icon={MousePointerClick} label="Active users" value={retention.activeUsers} helper={`${retention.sevenDayActiveUsers || 0} active in last 7 days`} />
            <Metric icon={Megaphone} label="Campaigns" value={(report?.campaigns || []).length} helper="Tracked source/campaign pairs" />
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
            <Panel title="Campaign Link Builder">
              <div className="grid gap-3 sm:grid-cols-3">
                <label className="text-sm font-medium text-slate-700">
                  Source
                  <input
                    value={campaignSource}
                    onChange={(event) => setCampaignSource(event.target.value)}
                    className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </label>
                <label className="text-sm font-medium text-slate-700">
                  Medium
                  <input
                    value={campaignMedium}
                    onChange={(event) => setCampaignMedium(event.target.value)}
                    className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </label>
                <label className="text-sm font-medium text-slate-700">
                  Campaign
                  <input
                    value={campaignName}
                    onChange={(event) => setCampaignName(event.target.value)}
                    className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </label>
              </div>
              <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-3">
                <p className="break-all text-sm text-slate-700">{campaignUrl}</p>
              </div>
              <button
                type="button"
                onClick={copyCampaignUrl}
                className="mt-4 inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                <Clipboard className="h-4 w-4" />
                {copied ? 'Copied' : 'Copy campaign link'}
              </button>
            </Panel>

            <Panel title="Acquisition Sources">
              <div className="space-y-4">
                {(report?.acquisition || []).map((item: any) => (
                  <BarRow
                    key={item.source}
                    label={`${item.source} (${item.conversionRate}% signup)`}
                    value={item.visitors}
                    max={maxSourceVisitors}
                    helper={`${item.signups} signups`}
                  />
                ))}
                {!(report?.acquisition || []).length && <EmptyState message="No acquisition data found yet." />}
              </div>
            </Panel>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <Panel title="Campaign Performance">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Campaign</th>
                      <th className="px-4 py-3 font-semibold">Source</th>
                      <th className="px-4 py-3 font-semibold">Visitors</th>
                      <th className="px-4 py-3 font-semibold">Signups</th>
                      <th className="px-4 py-3 font-semibold">Downloads</th>
                      <th className="px-4 py-3 font-semibold">Conversion</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(report?.campaigns || []).map((item: any) => (
                      <tr key={`${item.source}-${item.campaign}`}>
                        <td className="px-4 py-3 font-medium text-slate-900">{item.campaign}</td>
                        <td className="px-4 py-3 text-slate-600">{item.source}</td>
                        <td className="px-4 py-3 text-slate-600">{item.visitors}</td>
                        <td className="px-4 py-3 text-slate-600">{item.signups}</td>
                        <td className="px-4 py-3 text-slate-600">{item.downloads}</td>
                        <td className="px-4 py-3 text-slate-600">{item.conversionRate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>

            <Panel title="Target Role Insights">
              <div className="space-y-4">
                {(report?.roleInsights || []).map((item: any) => (
                  <BarRow key={item.role} label={item.role} value={item.count} max={maxRoleCount} helper={`${item.downloads} downloads`} />
                ))}
              </div>
            </Panel>
          </div>

          <Panel
            title="Lead Export"
            action={
              <button
                type="button"
                onClick={() => downloadCsv('resumeai-marketing-leads.csv', filteredLeads.map((lead: any) => ({
                  name: lead.name,
                  email: lead.email,
                  targetRole: lead.targetRole,
                  source: lead.source,
                  campaign: lead.campaign,
                  stage: lead.stage,
                  resumes: lead.resumeCount,
                  aiUsage: lead.aiUsageCount,
                  downloads: lead.downloadCount,
                  shares: lead.shareCount,
                  lastActivity: formatDateTime(lead.lastActivity),
                  joined: formatDate(lead.joinedAt),
                })))}
                className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Download className="h-3.5 w-3.5" />
                CSV
              </button>
            }
          >
            <SearchBox value={leadQuery} onChange={setLeadQuery} placeholder="Search leads by name, email, role, campaign, stage..." />
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Lead</th>
                    <th className="px-4 py-3 font-semibold">Source</th>
                    <th className="px-4 py-3 font-semibold">Stage</th>
                    <th className="px-4 py-3 font-semibold">Resumes</th>
                    <th className="px-4 py-3 font-semibold">AI</th>
                    <th className="px-4 py-3 font-semibold">Last Activity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLeads.slice(0, 80).map((lead: any) => (
                    <tr key={lead.id}>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900">{lead.name || '-'}</p>
                        <p className="text-xs text-slate-500">{lead.email}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{lead.source} / {lead.campaign}</td>
                      <td className="px-4 py-3 text-slate-600">{lead.stage}</td>
                      <td className="px-4 py-3 text-slate-600">{lead.resumeCount}</td>
                      <td className="px-4 py-3 text-slate-600">{lead.aiUsageCount}</td>
                      <td className="px-4 py-3 text-slate-600">{formatDateTime(lead.lastActivity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          <Panel title="High Intent Leads">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {(report?.highIntentLeads || []).slice(0, 12).map((lead: any) => (
                <div key={lead.id} className="rounded-md border border-slate-200 bg-slate-50 p-4">
                  <p className="font-semibold text-slate-950">{lead.name || lead.email}</p>
                  <p className="truncate text-xs text-slate-500">{lead.email}</p>
                  <p className="mt-3 text-sm text-slate-700">{lead.reason}</p>
                  <p className="mt-2 text-xs text-slate-500">{lead.source} / {lead.campaign}</p>
                </div>
              ))}
              {!(report?.highIntentLeads || []).length && <EmptyState message="No high-intent leads yet." />}
            </div>
          </Panel>
        </div>
      )}
    </AdminShell>
  );
}
