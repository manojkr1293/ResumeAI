'use client';

import { useEffect, useMemo, useState } from 'react';
import { ChevronRight, Download, X } from 'lucide-react';
import { apiGet } from '@/lib/api-client';
import { API_ENDPOINTS } from '@/lib/constants';
import {
  AdminAccessDenied,
  AdminShell,
  EmptyState,
  ErrorNotice,
  LoadingPanel,
  Panel,
  SearchBox,
  downloadCsv,
  formatDate,
  formatDateTime,
  useAdminGate,
} from '../_components/admin-ui';

export default function AdminUsersPage() {
  const { mounted, isAuthenticated, router } = useAdminGate();
  const [users, setUsers] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedUserLoading, setSelectedUserLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    if (!mounted || !isAuthenticated) return;
    void loadUsers();
  }, [mounted, isAuthenticated]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await apiGet<any>(API_ENDPOINTS.ADMIN.USERS);
      setUsers(data.users || []);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 401) return router.replace('/admin/login');
      if (status === 403) return setAccessDenied(true);
      setError(err?.response?.data?.error?.message || err?.message || 'Could not load users');
    } finally {
      setLoading(false);
    }
  };

  const openUserDetail = async (userId: string) => {
    try {
      setSelectedUserLoading(true);
      setSelectedUser(await apiGet<any>(API_ENDPOINTS.ADMIN.USER_DETAIL(userId)));
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Could not load user details');
    } finally {
      setSelectedUserLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return users;
    return users.filter((user) =>
      [user.fullName, user.email, user.targetRole, user.loginMethod].some((item) =>
        String(item || '').toLowerCase().includes(value)
      )
    );
  }, [users, query]);

  if (!mounted) return null;
  if (accessDenied) return <AdminAccessDenied />;

  return (
    <AdminShell title="Users" description="Monitor signups, login method, resume creation, AI usage, and exports.">
      <ErrorNotice message={error} />
      {loading ? (
        <LoadingPanel label="Loading users..." />
      ) : (
        <Panel
          title="User Report"
          action={
            <button
              type="button"
              onClick={() => downloadCsv('resumeai-users.csv', filteredUsers.map((user) => ({
                name: user.fullName,
                email: user.email,
                targetRole: user.targetRole,
                loginMethod: user.loginMethod,
                resumes: user.resumeCount,
                aiUsage: user.aiUsageCount,
                exports: user.exportCount,
                joined: formatDate(user.createdAt),
              })))}
              className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Download className="h-3.5 w-3.5" />
              CSV
            </button>
          }
        >
          <SearchBox value={query} onChange={setQuery} placeholder="Search users by name, email, role, login method..." />
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">User</th>
                  <th className="px-4 py-3 font-semibold">Method</th>
                  <th className="px-4 py-3 font-semibold">Resumes</th>
                  <th className="px-4 py-3 font-semibold">AI</th>
                  <th className="px-4 py-3 font-semibold">Exports</th>
                  <th className="px-4 py-3 font-semibold">Joined</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{user.fullName || '-'}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{user.loginMethod}</td>
                    <td className="px-4 py-3 text-slate-600">{user.resumeCount}</td>
                    <td className="px-4 py-3 text-slate-600">{user.aiUsageCount}</td>
                    <td className="px-4 py-3 text-slate-600">{user.exportCount}</td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(user.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => openUserDetail(user.id)}
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-50"
                      >
                        View
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {(selectedUser || selectedUserLoading) && (
        <UserDetailPanel data={selectedUser} loading={selectedUserLoading} onClose={() => setSelectedUser(null)} />
      )}
    </AdminShell>
  );
}

function UserDetailPanel({ data, loading, onClose }: { data: any; loading: boolean; onClose: () => void }) {
  const user = data?.user;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/30">
      <aside className="h-full w-full max-w-xl overflow-y-auto bg-white shadow-xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white p-5">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">User detail</p>
            <h2 className="text-lg font-bold text-slate-950">{user?.fullName || 'Loading...'}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-md p-2 text-slate-500 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className="p-5 text-sm text-slate-500">Loading user report...</div>
        ) : (
          <div className="space-y-5 p-5">
            <div className="rounded-lg border border-slate-200 p-4">
              <p className="font-semibold text-slate-950">{user?.email}</p>
              <p className="mt-1 text-sm text-slate-500">{user?.targetRole || 'No target role'} · {user?.oauthProvider || 'EMAIL'}</p>
              <div className="mt-4 grid grid-cols-4 gap-3 text-center">
                <SmallStat label="Resumes" value={user?._count?.resumes} />
                <SmallStat label="AI" value={user?._count?.aiFeedbacks} />
                <SmallStat label="Exports" value={data?.exportsCount} />
                <SmallStat label="Events" value={user?._count?.analyticsEvents} />
              </div>
            </div>

            <DetailList title="Recent Resumes" items={(data?.resumes || []).map((resume: any) => ({
              key: resume.id,
              title: resume.title,
              meta: `${resume.status} · ATS ${resume.atsScore || 0}% · ${formatDate(resume.updatedAt)}`,
            }))} />

            <DetailList title="Recent AI Usage" items={(data?.aiFeedbacks || []).map((item: any) => ({
              key: item.id,
              title: item.moduleName,
              meta: `${item.resume?.title || 'No resume'} · ${item.tokenUsage || 0} tokens · ${formatDate(item.createdAt)}`,
            }))} />

            <DetailList title="Recent Activity" items={(data?.events || []).map((event: any) => ({
              key: event.id,
              title: event.eventType.replace(/_/g, ' '),
              meta: `${event.path || event.entityType || event.sessionId} · ${formatDateTime(event.createdAt)}`,
            }))} />
          </div>
        )}
      </aside>
    </div>
  );
}

function SmallStat({ label, value }: { label: string; value: any }) {
  return (
    <div className="rounded-md bg-slate-50 p-3">
      <p className="text-lg font-bold text-slate-950">{value ?? 0}</p>
      <p className="text-[11px] font-semibold uppercase text-slate-500">{label}</p>
    </div>
  );
}

function DetailList({ title, items }: { title: string; items: { key: string; title: string; meta: string }[] }) {
  return (
    <div>
      <h3 className="mb-3 font-semibold text-slate-950">{title}</h3>
      <div className="space-y-2">
        {items.slice(0, 8).map((item) => (
          <div key={item.key} className="rounded-md border border-slate-100 bg-slate-50 p-3">
            <p className="text-sm font-medium text-slate-900">{item.title}</p>
            <p className="mt-1 truncate text-xs text-slate-500">{item.meta}</p>
          </div>
        ))}
        {!items.length && <EmptyState message="No records found." />}
      </div>
    </div>
  );
}
