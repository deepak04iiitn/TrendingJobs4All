import { useCallback, useEffect, useState } from 'react';
import { Search, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import AdminSectionHeader from '../../components/admin/AdminSectionHeader';
import AdminDataTable from '../../components/admin/AdminDataTable';
import AdminPagination from '../../components/admin/AdminPagination';
import { useAdminPaginatedList } from '../../hooks/useAdminPaginatedList';
import { fetchComments, deleteComment } from '../../lib/admin-api';
import { focusRing } from '../../theme/tokens';

const PAGE_SIZE = 12;

export default function AdminComments() {
  const [search, setSearch] = useState('');

  const fetcher = useCallback(async ({ page, limit, search: q }) => {
    const startIndex = (page - 1) * limit;
    const data = await fetchComments({ startIndex, limit, sort: 'desc', search: q });
    return { items: data.comments || [], total: data.totalComments || 0 };
  }, []);

  const { page, goToPage, rows, total, totalPages, limit, loading, error } = useAdminPaginatedList(
    fetcher,
    { search },
    PAGE_SIZE
  );

  useEffect(() => {
    if (error) toast.error('Failed to load comments');
  }, [error]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await deleteComment(id);
      toast.success('Deleted');
      goToPage(page);
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <div>
      <AdminSectionHeader
        title="Job comments"
        description="Review and remove comments left on job postings."
      />

      <div className="mb-4">
        <label className="relative block max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#78716C]" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search comment text..."
            className={`w-full rounded-xl border border-[#E5DCCE] bg-[#FFFDF8] py-2 pl-9 pr-3 text-sm outline-none focus:border-[#C4A574] ${focusRing}`}
          />
        </label>
      </div>

      <AdminDataTable
        rows={rows}
        loading={loading}
        empty="No comments yet."
        columns={[
          {
            key: 'content',
            label: 'Comment',
            render: (r) => <span className="line-clamp-2 max-w-md text-[#2C241B]">{r.content}</span>,
          },
          {
            key: 'likes',
            label: 'Likes',
            render: (r) => r.numberOfLikes ?? r.likes?.length ?? 0,
          },
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
