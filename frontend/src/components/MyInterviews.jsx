import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Trash2, Building2, ThumbsUp, ThumbsDown, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { focusRing } from '../theme/tokens';

const PAGE_SIZE = 10;

export default function MyInterviews() {
  const { currentUser } = useSelector((state) => state.user);
  const [experiences, setExperiences] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedExperienceId, setSelectedExperienceId] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchExperiences = useCallback(async (pageNum = 1) => {
    try {
      setLoading(true);
      const response = await fetch(
        `/backend/user/interviews/${currentUser._id}?page=${pageNum}&limit=${PAGE_SIZE}`,
      );
      if (!response.ok) throw new Error('Failed to fetch experiences');
      const data = await response.json();
      setExperiences(data.items || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
      setPage(data.page || pageNum);
    } catch (error) {
      console.error('Error fetching experiences:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUser._id]);

  useEffect(() => {
    fetchExperiences(page);
  }, [fetchExperiences, page]);

  const handleDeleteExperience = async () => {
    try {
      const response = await fetch(`/backend/interviews/delete/${selectedExperienceId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete experience');
      setDeleteModalOpen(false);
      const nextTotal = total - 1;
      const nextPages = Math.max(1, Math.ceil(nextTotal / PAGE_SIZE));
      const nextPage = Math.min(page, nextPages);
      if (nextPage !== page) setPage(nextPage);
      else fetchExperiences(nextPage);
    } catch (error) {
      console.error('Error deleting experience:', error);
    }
  };

  if (loading && experiences.length === 0) {
    return <p className="py-16 text-center text-sm text-[#78716C]">Loading your experiences...</p>;
  }

  if (!loading && total === 0) {
    return (
      <div className="overflow-hidden rounded-2xl border border-[#E5DCCE] bg-[#FFFDF8]">
        <div
          aria-hidden
          className="h-1.5 w-full"
          style={{ background: 'linear-gradient(90deg, #C4A574, #EFE8DC, #C4A574)' }}
        />
        <div className="px-6 py-14 text-center sm:px-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F7F3EC] text-[#C4A574]">
            <Building2 className="h-6 w-6" aria-hidden />
          </div>
          <h3 className="font-display mt-5 text-2xl font-semibold text-[#1C1917]">
            No interview stories yet
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[#57534E]">
            Share a QA or SDET interview experience — your notes can help the next candidate prepare
            with confidence.
          </p>
          <button
            type="button"
            onClick={() => navigate('/interview-experiences')}
            className={`mt-7 inline-flex items-center gap-2 rounded-xl bg-[#2C241B] px-5 py-2.5 text-sm font-medium text-[#FFFDF8] transition hover:bg-[#1A1510] ${focusRing}`}
          >
            <Plus className="h-4 w-4" aria-hidden />
            Share an experience
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-4 text-sm text-[#78716C]">
        <span className="font-medium tabular-nums text-[#2C241B]">{total}</span>{' '}
        experience{total === 1 ? '' : 's'} shared
        {pages > 1 && (
          <span className="ml-2 text-[#78716C]">
            · Page {page} of {pages}
          </span>
        )}
      </p>

      <div className="overflow-hidden rounded-2xl border border-[#E5DCCE] bg-[#FFFDF8]">
        {loading ? (
          <p className="py-10 text-center text-sm text-[#78716C]">Loading...</p>
        ) : (
          <ul className="divide-y divide-[#E5DCCE]">
            {experiences.map((exp) => (
              <li
                key={exp._id}
                className="flex flex-col gap-3 px-4 py-4 transition hover:bg-[#F7F3EC]/60 sm:flex-row sm:items-center sm:justify-between sm:px-5"
              >
                <div className="min-w-0">
                  <p className="font-display truncate text-base font-medium text-[#1C1917]">
                    {exp.company}
                  </p>
                  <p className="mt-0.5 truncate text-sm text-[#57534E]">{exp.position}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-[#78716C]">
                    <span className="inline-flex items-center gap-1">
                      <ThumbsUp className="h-3 w-3 text-[#C4A574]" /> {exp.numberOfLikes ?? 0}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <ThumbsDown className="h-3 w-3" /> {exp.numberOfDislikes ?? 0}
                    </span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {exp._id && (
                    <Link
                      to={`/interview-experience/${exp._id}`}
                      className={`inline-flex items-center gap-1 rounded-lg border border-[#E5DCCE] px-3 py-1.5 text-xs font-medium text-[#6B5A48] hover:bg-[#F7F3EC] ${focusRing}`}
                    >
                      <ExternalLink className="h-3 w-3" /> View
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedExperienceId(exp._id);
                      setDeleteModalOpen(true);
                    }}
                    className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 ${focusRing}`}
                  >
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {pages > 1 && (
        <nav className="mt-5 flex items-center justify-center gap-2" aria-label="Pagination">
          <button
            type="button"
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className={`inline-flex items-center gap-1 rounded-xl border border-[#E5DCCE] bg-[#FFFDF8] px-3 py-2 text-sm text-[#6B5A48] transition hover:bg-[#EFE8DC] disabled:opacity-40 ${focusRing}`}
          >
            <ChevronLeft className="h-4 w-4" /> Prev
          </button>
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              disabled={loading}
              onClick={() => setPage(p)}
              className={`h-9 min-w-9 rounded-xl px-2.5 text-sm font-medium transition ${focusRing} ${
                p === page
                  ? 'bg-[#2C241B] text-[#FFFDF8]'
                  : 'border border-[#E5DCCE] bg-[#FFFDF8] text-[#6B5A48] hover:bg-[#EFE8DC]'
              }`}
            >
              {p}
            </button>
          ))}
          <button
            type="button"
            disabled={page >= pages || loading}
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            className={`inline-flex items-center gap-1 rounded-xl border border-[#E5DCCE] bg-[#FFFDF8] px-3 py-2 text-sm text-[#6B5A48] transition hover:bg-[#EFE8DC] disabled:opacity-40 ${focusRing}`}
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </nav>
      )}

      {deleteModalOpen && (
        <div className="fixed inset-0 z-[2147483647] flex items-center justify-center bg-[#2C241B]/40 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-[#E5DCCE] bg-[#FFFDF8] p-6 shadow-xl">
            <h2 className="font-display text-lg font-semibold text-[#1C1917]">Delete experience?</h2>
            <p className="mt-2 text-sm text-[#57534E]">
              This removes your interview story permanently. This cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className={`rounded-xl border border-[#E5DCCE] px-4 py-2 text-sm text-[#6B5A48] hover:bg-[#F7F3EC] ${focusRing}`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteExperience}
                className={`rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 ${focusRing}`}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
