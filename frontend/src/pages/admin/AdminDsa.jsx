import { useCallback, useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { toast } from 'react-toastify';
import AdminSectionHeader from '../../components/admin/AdminSectionHeader';
import AdminDataTable from '../../components/admin/AdminDataTable';
import AdminKpiCard from '../../components/admin/AdminKpiCard';
import AdminPagination from '../../components/admin/AdminPagination';
import { useAdminPaginatedList } from '../../hooks/useAdminPaginatedList';
import { fetchDsaUsersStats, fetchDsaLeaderboard } from '../../lib/admin-api';
import { focusRing } from '../../theme/tokens';

const PAGE_SIZE = 12;

export default function AdminDsa() {
  const [tab, setTab] = useState('progress');
  const [search, setSearch] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);

  const fetcher = useCallback(async ({ page, limit, search: q }) => {
    const data = await fetchDsaUsersStats({ page, limit, search: q });
    return { items: data.items || [], total: data.total || 0, extra: { totalProblems: data.totalProblems || 0 } };
  }, []);

  const { page, goToPage, rows: users, total, totalPages, limit, loading, error, extra } = useAdminPaginatedList(
    fetcher,
    { search },
    PAGE_SIZE
  );

  useEffect(() => {
    if (error) toast.error('Failed to load DSA progress');
  }, [error]);

  useEffect(() => {
    if (tab !== 'leaderboard') return;
    setLeaderboardLoading(true);
    fetchDsaLeaderboard(25)
      .then((data) => setLeaderboard(data.items || []))
      .catch(() => toast.error('Failed to load leaderboard'))
      .finally(() => setLeaderboardLoading(false));
  }, [tab]);

  return (
    <div>
      <AdminSectionHeader
        title="DSA sheet"
        description="Track solver progress and leaderboard rankings across the QA/SDET problem set."
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <AdminKpiCard label="Problems in sheet" value={extra.totalProblems ?? 0} />
        <AdminKpiCard label="Active solvers" value={total} />
        <AdminKpiCard label="Top score" value={leaderboard[0]?.completedCount ?? 0} hint={leaderboard[0]?.username} tone="bronze" />
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        {[
          { id: 'progress', label: 'User progress' },
          { id: 'leaderboard', label: 'Leaderboard' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-xl px-4 py-2 text-sm font-medium ${focusRing} ${
              tab === t.id ? 'bg-[#2C241B] text-[#FFFDF8]' : 'border border-[#E5DCCE] bg-[#FFFDF8] text-[#6B5A48]'
            }`}
          >
            {t.label}
          </button>
        ))}
        {tab === 'progress' && (
          <label className="relative ml-auto">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#78716C]" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search username or email..."
              className={`w-64 rounded-xl border border-[#E5DCCE] bg-[#FFFDF8] py-2 pl-9 pr-3 text-sm outline-none focus:border-[#C4A574] ${focusRing}`}
            />
          </label>
        )}
      </div>

      {tab === 'progress' ? (
        <>
          <AdminDataTable
            rows={users}
            loading={loading}
            keyField="userId"
            empty="No DSA activity yet."
            columns={[
              {
                key: 'user',
                label: 'User',
                render: (u) => (
                  <div>
                    <p className="font-medium text-[#1C1917]">{u.username}</p>
                    <p className="text-[11px] text-[#78716C]">{u.email}</p>
                  </div>
                ),
              },
              { key: 'completedCount', label: 'Solved' },
              { key: 'favoriteCount', label: 'Favorites' },
              {
                key: 'completionPercentage',
                label: 'Progress',
                render: (u) => `${u.completionPercentage ?? 0}%`,
              },
              {
                key: 'lastCompletedAt',
                label: 'Last solved',
                render: (u) => (u.lastCompletedAt ? new Date(u.lastCompletedAt).toLocaleDateString() : '—'),
              },
            ]}
          />
          <AdminPagination page={page} totalPages={totalPages} total={total} limit={limit} loading={loading} onPageChange={goToPage} />
        </>
      ) : (
        <AdminDataTable
          rows={leaderboard}
          loading={leaderboardLoading}
          keyField="userId"
          empty="Leaderboard is empty."
          columns={[
            {
              key: 'rank',
              label: '#',
              render: (row) => {
                const idx = leaderboard.findIndex((x) => x.userId === row.userId);
                return (
                  <span className="font-mono text-xs tabular-nums text-[#C4A574]">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                );
              },
            },
            { key: 'user', label: 'Solver', render: (u) => u.username },
            { key: 'completedCount', label: 'Solved' },
            {
              key: 'completionPercentage',
              label: '%',
              render: (u) => `${u.completionPercentage ?? 0}%`,
            },
          ]}
        />
      )}
    </div>
  );
}
