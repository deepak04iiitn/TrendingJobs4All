import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, ExternalLink, Search } from 'lucide-react';
import { toast } from 'react-toastify';
import AdminSectionHeader from '../../components/admin/AdminSectionHeader';
import AdminDataTable from '../../components/admin/AdminDataTable';
import AdminKpiCard from '../../components/admin/AdminKpiCard';
import { fetchRoadmaps, deleteRoadmap } from '../../lib/admin-api';
import { focusRing } from '../../theme/tokens';

const difficultyTone = {
  Beginner: 'bg-emerald-50 text-emerald-700',
  Intermediate: 'bg-amber-50 text-amber-700',
  Advanced: 'bg-rose-50 text-rose-700',
};

export default function AdminRoadmaps() {
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = () => {
    setLoading(true);
    fetchRoadmaps()
      .then((data) => setRoadmaps(Array.isArray(data?.data) ? data.data : []))
      .catch(() => toast.error('Failed to load roadmaps'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const filteredRoadmaps = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return roadmaps;
    return roadmaps.filter(
      (r) => r.title?.toLowerCase().includes(q) || r.role?.toLowerCase().includes(q)
    );
  }, [roadmaps, search]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this roadmap permanently? All learner progress on it will also be removed.')) return;
    try {
      await deleteRoadmap(id);
      setRoadmaps((prev) => prev.filter((r) => r._id !== id));
      toast.success('Roadmap deleted');
    } catch {
      toast.error('Delete failed');
    }
  };

  const totalNodes = roadmaps.reduce((sum, r) => sum + (r.nodes?.length || 0), 0);
  const totalHours = roadmaps.reduce((sum, r) => sum + (r.totalEstimatedHours || 0), 0);

  return (
    <div>
      <AdminSectionHeader
        title="Roadmaps"
        description="Manage role-based learning roadmaps and their estimated effort."
        actions={
          <Link
            to="/roadmaps/create"
            className={`inline-flex items-center gap-1.5 rounded-xl bg-[#2C241B] px-4 py-2 text-sm font-medium text-[#FFFDF8] hover:bg-[#1A1510] ${focusRing}`}
          >
            <Plus className="h-4 w-4" /> New roadmap
          </Link>
        }
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <AdminKpiCard label="Active roadmaps" value={roadmaps.length} />
        <AdminKpiCard label="Total skill nodes" value={totalNodes} />
        <AdminKpiCard label="Total estimated hours" value={totalHours} tone="bronze" />
      </div>

      <div className="mb-4">
        <label className="relative block max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#78716C]" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title or role..."
            className={`w-full rounded-xl border border-[#E5DCCE] bg-[#FFFDF8] py-2 pl-9 pr-3 text-sm outline-none focus:border-[#C4A574] ${focusRing}`}
          />
        </label>
      </div>

      <AdminDataTable
          rows={filteredRoadmaps}
          loading={loading}
          empty="No roadmaps yet. Create the first one."
          columns={[
            {
              key: 'title',
              label: 'Roadmap',
              render: (r) => (
                <div>
                  <p className="font-medium text-[#1C1917]">{r.title}</p>
                  <p className="text-[11px] text-[#78716C]">{r.role}</p>
                </div>
              ),
            },
            {
              key: 'difficulty',
              label: 'Difficulty',
              render: (r) => (
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${difficultyTone[r.difficulty] || 'bg-[#EFE8DC] text-[#6B5A48]'}`}>
                  {r.difficulty || 'N/A'}
                </span>
              ),
            },
            {
              key: 'nodes',
              label: 'Skill nodes',
              render: (r) => r.nodes?.length ?? 0,
            },
            {
              key: 'totalEstimatedHours',
              label: 'Est. hours',
              render: (r) => r.totalEstimatedHours ?? '—',
            },
            {
              key: 'createdAt',
              label: 'Created',
              render: (r) => (r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—'),
            },
            {
              key: 'actions',
              label: '',
              render: (r) => (
                <div className="flex gap-1">
                  <a
                    href={`/roadmaps/${r.role}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`rounded-lg p-2 text-[#6B5A48] hover:bg-[#F7F3EC] ${focusRing}`}
                    title="View"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <button
                    type="button"
                    onClick={() => handleDelete(r._id)}
                    className={`rounded-lg p-2 text-rose-600 hover:bg-rose-50 ${focusRing}`}
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ),
            },
          ]}
        />
    </div>
  );
}
