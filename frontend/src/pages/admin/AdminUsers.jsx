import { useCallback, useEffect, useState } from 'react';
import { Search, Trash2, X } from 'lucide-react';
import { toast } from 'react-toastify';
import AdminSectionHeader from '../../components/admin/AdminSectionHeader';
import AdminDataTable from '../../components/admin/AdminDataTable';
import AdminPagination from '../../components/admin/AdminPagination';
import { useAdminPaginatedList } from '../../hooks/useAdminPaginatedList';
import { fetchUsers, deleteUser } from '../../lib/admin-api';
import { focusRing } from '../../theme/tokens';

const PAGE_SIZE = 12;

export default function AdminUsers() {
  const [search, setSearch] = useState('');
  const [date, setDate] = useState('');

  const fetcher = useCallback(async ({ page, limit, search: q, date: d }) => {
    const startIndex = (page - 1) * limit;
    const data = await fetchUsers({ startIndex, limit, search: q, date: d });
    return {
      items: data.users,
      total: data.matchedCount ?? data.totalUsers ?? 0,
      extra: { visitedCount: data.visitedCount },
    };
  }, []);

  const { page, goToPage, rows: users, total, totalPages, limit, loading, error, extra } = useAdminPaginatedList(
    fetcher,
    { search, date },
    PAGE_SIZE
  );

  useEffect(() => {
    if (error) toast.error('Failed to load users');
  }, [error]);

  const handleDelete = async (id, isAdmin) => {
    if (isAdmin) {
      toast.error('Cannot delete admin users');
      return;
    }
    if (!window.confirm('Delete this user permanently?')) return;
    try {
      await deleteUser(id);
      toast.success('User deleted');
      goToPage(page);
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <div>
      <AdminSectionHeader
        title="Users"
        description="Directory of registered accounts, visit activity, and moderation controls."
      />

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <label className="relative">
          <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6B5A48]">Search</span>
          <Search className="pointer-events-none absolute bottom-2.5 left-3 h-4 w-4 text-[#78716C]" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Username or email..."
            className={`w-64 rounded-xl border border-[#E5DCCE] bg-[#FFFDF8] py-2 pl-9 pr-3 text-sm outline-none focus:border-[#C4A574] ${focusRing}`}
          />
        </label>
        <label>
          <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6B5A48]">Joined on</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={`block rounded-xl border border-[#E5DCCE] bg-[#FFFDF8] px-3 py-2 text-sm text-[#2C241B] outline-none focus:border-[#C4A574] ${focusRing}`}
          />
        </label>
        {date && (
          <button
            type="button"
            onClick={() => setDate('')}
            className={`inline-flex items-center gap-1 rounded-xl border border-[#E5DCCE] bg-[#FFFDF8] px-3 py-2 text-xs text-[#6B5A48] ${focusRing}`}
          >
            <X className="h-3.5 w-3.5" /> Clear date
          </button>
        )}
        <div className="ml-auto flex gap-4 pb-2 text-xs text-[#78716C]">
          <span>
            Matching: <strong className="text-[#2C241B]">{total}</strong>
          </span>
          {extra.visitedCount != null && (
            <span>
              Visited that day: <strong className="text-[#2C241B]">{extra.visitedCount}</strong>
            </span>
          )}
        </div>
      </div>

      <AdminDataTable
        rows={users}
        loading={loading}
        empty="No users found."
        columns={[
          {
            key: 'user',
            label: 'User',
            render: (u) => (
              <div className="flex items-center gap-2.5">
                <img
                  src={u.profilePicture || '/assets/Profile.jpg'}
                  alt=""
                  className="h-8 w-8 shrink-0 rounded-full object-cover"
                />
                <div className="min-w-0">
                  <p className="truncate font-medium text-[#1C1917]">{u.username}</p>
                  <p className="truncate text-[11px] text-[#78716C]">{u.email}</p>
                </div>
              </div>
            ),
          },
          {
            key: 'status',
            label: 'Status',
            render: (u) => (
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${u.isUserAdmin ? 'bg-[#2C241B] text-[#FFFDF8]' : 'bg-[#EFE8DC] text-[#6B5A48]'}`}>
                {u.isUserAdmin ? 'Admin' : u.status || 'User'}
              </span>
            ),
          },
          {
            key: 'createdAt',
            label: 'Joined',
            render: (u) => (u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'),
          },
          {
            key: 'lastVisit',
            label: 'Last visit',
            render: (u) => (u.lastVisit ? new Date(u.lastVisit).toLocaleDateString() : '—'),
          },
          {
            key: 'actions',
            label: '',
            render: (u) => (
              <button
                type="button"
                disabled={u.isUserAdmin}
                onClick={() => handleDelete(u._id, u.isUserAdmin)}
                className={`rounded-lg p-2 text-rose-600 hover:bg-rose-50 disabled:opacity-30 ${focusRing}`}
                aria-label="Delete user"
              >
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
