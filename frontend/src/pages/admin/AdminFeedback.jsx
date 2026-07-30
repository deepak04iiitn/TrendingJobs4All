import { useCallback, useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { toast } from 'react-toastify';
import AdminSectionHeader from '../../components/admin/AdminSectionHeader';
import AdminDataTable from '../../components/admin/AdminDataTable';
import AdminPagination from '../../components/admin/AdminPagination';
import { useAdminPaginatedList } from '../../hooks/useAdminPaginatedList';
import { fetchBugs, updateBugStatus, fetchFeatures, updateFeatureStatus } from '../../lib/admin-api';
import { focusRing } from '../../theme/tokens';

const PAGE_SIZE = 12;

export default function AdminFeedback() {
  const [tab, setTab] = useState('bugs');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');

  const fetcher = useCallback(async ({ page, limit, tab: t, status: s, search: q }) => {
    const params = { page, limit, sortBy: 'createdAt', order: 'desc' };
    if (s) params.status = s;
    if (q) params.search = q;
    const data = t === 'bugs' ? await fetchBugs(params) : await fetchFeatures(params);
    return { items: data.items || [], total: data.total || 0 };
  }, []);

  const { page, goToPage, rows, total, totalPages, limit, loading, error } = useAdminPaginatedList(
    fetcher,
    { tab, status, search },
    PAGE_SIZE
  );

  useEffect(() => {
    if (error) toast.error('Failed to load feedback');
  }, [error]);

  const handleStatus = async (id, nextStatus) => {
    try {
      if (tab === 'bugs') await updateBugStatus(id, nextStatus);
      else await updateFeatureStatus(id, nextStatus);
      toast.success('Status updated');
      goToPage(page);
    } catch {
      toast.error('Update failed');
    }
  };

  const statusOptions = tab === 'bugs' ? ['Pending', 'Resolved'] : ['Pending', 'Implemented'];

  return (
    <div>
      <AdminSectionHeader
        title="Feedback queues"
        description="Triage bug reports and feature requests from the community."
      />

      <div className="mb-5 flex flex-wrap items-center gap-2">
        {[
          { id: 'bugs', label: 'Bugs' },
          { id: 'features', label: 'Features' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              setTab(t.id);
              setStatus('');
            }}
            className={`rounded-xl px-4 py-2 text-sm font-medium ${focusRing} ${
              tab === t.id ? 'bg-[#2C241B] text-[#FFFDF8]' : 'border border-[#E5DCCE] bg-[#FFFDF8] text-[#6B5A48]'
            }`}
          >
            {t.label}
          </button>
        ))}
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className={`rounded-xl border border-[#E5DCCE] bg-[#FFFDF8] px-3 py-2 text-sm text-[#2C241B] outline-none focus:border-[#C4A574] ${focusRing}`}
        >
          <option value="">All statuses</option>
          {statusOptions.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <label className="relative ml-auto">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#78716C]" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search email or description..."
            className={`w-64 rounded-xl border border-[#E5DCCE] bg-[#FFFDF8] py-2 pl-9 pr-3 text-sm outline-none focus:border-[#C4A574] ${focusRing}`}
          />
        </label>
      </div>

      <AdminDataTable
        rows={rows}
        loading={loading}
        empty="Queue is empty."
        columns={[
          {
            key: 'description',
            label: 'Report',
            render: (r) => (
              <div className="max-w-lg">
                <p className="line-clamp-2 text-[#2C241B]">{r.description}</p>
                <p className="mt-0.5 text-[11px] text-[#78716C]">{r.email}</p>
              </div>
            ),
          },
          {
            key: 'status',
            label: 'Status',
            render: (r) => (
              <select
                value={r.status}
                onChange={(e) => handleStatus(r._id, e.target.value)}
                className="rounded-lg border border-[#E5DCCE] bg-[#F7F3EC] px-2 py-1 text-xs"
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            ),
          },
          {
            key: 'createdAt',
            label: 'Submitted',
            render: (r) => (r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—'),
          },
        ]}
      />
      <AdminPagination page={page} totalPages={totalPages} total={total} limit={limit} loading={loading} onPageChange={goToPage} />
    </div>
  );
}
