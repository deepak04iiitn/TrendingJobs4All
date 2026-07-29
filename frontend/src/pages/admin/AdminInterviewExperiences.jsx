import { useCallback, useEffect, useState } from 'react';
import { Search, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import AdminSectionHeader from '../../components/admin/AdminSectionHeader';
import AdminDataTable from '../../components/admin/AdminDataTable';
import AdminPagination from '../../components/admin/AdminPagination';
import { useAdminPaginatedList } from '../../hooks/useAdminPaginatedList';
import { fetchInterviews, deleteInterview } from '../../lib/admin-api';
import { focusRing } from '../../theme/tokens';

const PAGE_SIZE = 12;

export default function AdminInterviewExperiences() {
  const [search, setSearch] = useState('');

  const fetcher = useCallback(async ({ page, limit, search: q }) => {
    const data = await fetchInterviews({ page, limit, search: q });
    return { items: data.items || [], total: data.total || 0 };
  }, []);

  const { page, goToPage, rows, total, totalPages, limit, loading, error } = useAdminPaginatedList(
    fetcher,
    { search },
    PAGE_SIZE
  );

  useEffect(() => {
    if (error) toast.error('Failed to load interview experiences');
  }, [error]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this interview experience?')) return;
    try {
      await deleteInterview(id);
      toast.success('Deleted');
      goToPage(page);
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <div>
      <AdminSectionHeader
        title="Interview experiences"
        description="Review and remove community-submitted interview experiences."
      />

      <div className="mb-4">
        <label className="relative block max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#78716C]" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company or role..."
            className={`w-full rounded-xl border border-[#E5DCCE] bg-[#FFFDF8] py-2 pl-9 pr-3 text-sm outline-none focus:border-[#C4A574] ${focusRing}`}
          />
        </label>
      </div>

      <AdminDataTable
        rows={rows}
        loading={loading}
        empty="No interview experiences yet."
        columns={[
          {
            key: 'company',
            label: 'Company / Role',
            render: (r) => (
              <div>
                <p className="font-medium text-[#1C1917]">{r.company}</p>
                <p className="text-[11px] text-[#78716C]">{r.position}</p>
              </div>
            ),
          },
          { key: 'fullName', label: 'Author', render: (r) => r.fullName || '—' },
          {
            key: 'createdAt',
            label: 'Date',
            render: (r) => (r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—'),
          },
          {
            key: 'actions',
            label: '',
            render: (r) => (
              <button type="button" onClick={() => handleDelete(r._id)} className={`rounded-lg p-2 text-rose-600 hover:bg-rose-50 ${focusRing}`}>
                <Trash2 className="h-4 w-4" />
              </button>
            ),
          },
        ]}
      />
      <AdminPagination page={page} totalPages={totalPages} total={total} limit={limit} loading={loading} onPageChange={goToPage} />
    </div>
  );
}
