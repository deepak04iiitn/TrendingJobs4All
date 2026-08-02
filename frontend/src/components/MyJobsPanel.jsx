import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  Search,
  MapPin,
  Building2,
  Briefcase,
  Trash2,
  ExternalLink,
  Bookmark,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import RelatedLinks from '../components/RelatedLinks';
import { easeOut } from './home/motion.jsx';
import { focusRing } from '../theme/tokens';
import '../styles/MyJobs.css';

const JOBS_PER_PAGE = 10;

const formatUrlString = (company, title) => {
  const formatString = (str) =>
    String(str || '')
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-');

  return `${formatString(company)}-${formatString(title)}`;
};

export default function MyJobsPanel() {
  const [savedJobs, setSavedJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const userId = currentUser?._id;

  useEffect(() => {
    const timer = setTimeout(() => {
      const next = searchInput.trim();
      if (next === search) return;
      setSearch(next);
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput, search]);

  useEffect(() => {
    const fetchSavedJobs = async () => {
      if (!userId) return;

      try {
        setIsLoading(true);
        const params = new URLSearchParams();
        params.set('page', String(currentPage));
        params.set('limit', String(JOBS_PER_PAGE));
        if (search) params.set('search', search);

        const response = await axios.get(`/backend/saved-jobs/${userId}?${params.toString()}`);
        const data = response.data;
        const items = Array.isArray(data) ? data : data.items || [];
        const total = Array.isArray(data) ? items.length : data.total || 0;
        const pages = Array.isArray(data)
          ? Math.max(1, Math.ceil(total / JOBS_PER_PAGE))
          : data.totalPages || 1;

        setSavedJobs(items);
        setTotalJobs(total);
        setTotalPages(Math.max(1, pages));

        if (currentPage > pages) {
          setCurrentPage(pages);
        }
      } catch (error) {
        console.error('Error fetching saved jobs:', error);
        setSavedJobs([]);
        setTotalJobs(0);
        setTotalPages(1);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavedJobs();
  }, [userId, currentPage, search]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleRemoveJob = async (jobId, event) => {
    event.stopPropagation();
    try {
      await axios.delete(`/backend/saved-jobs/${userId}/${jobId}`);

      const params = new URLSearchParams();
      const pageToFetch =
        savedJobs.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
      params.set('page', String(pageToFetch));
      params.set('limit', String(JOBS_PER_PAGE));
      if (search) params.set('search', search);

      const response = await axios.get(`/backend/saved-jobs/${userId}?${params.toString()}`);
      const data = response.data;
      const items = Array.isArray(data) ? data : data.items || [];
      const total = Array.isArray(data) ? items.length : data.total || 0;
      const pages = Array.isArray(data)
        ? Math.max(1, Math.ceil(total / JOBS_PER_PAGE))
        : data.totalPages || 1;

      if (pageToFetch !== currentPage) {
        setCurrentPage(pageToFetch);
      }

      setSavedJobs(items);
      setTotalJobs(total);
      setTotalPages(Math.max(1, pages));
    } catch (err) {
      console.error('Error removing job:', err);
    }
  };

  const handleRowOpen = (jobId, company, title) => {
    const formattedUrl = formatUrlString(company, title);
    navigate(`/fulljd/${formattedUrl}/${jobId}`);
  };

  const startIndex = (currentPage - 1) * JOBS_PER_PAGE;

  return (
    <div className="myjobs-page">
      {(totalJobs > 0 || search) && (
        <div className="mb-5">
          <label className="myjobs-search">
            <Search className="h-4 w-4 shrink-0 text-[#78716C]" aria-hidden />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search saved roles..."
              aria-label="Search saved jobs"
            />
          </label>
        </div>
      )}

      {!isLoading && totalJobs > 0 && (
        <div className="mb-4 flex flex-col gap-1 text-sm text-[#78716C] sm:flex-row sm:items-center sm:justify-between">
          <span>
            Showing {totalJobs === 0 ? 0 : startIndex + 1}-
            {Math.min(startIndex + savedJobs.length, totalJobs)} of {totalJobs} roles
          </span>
          <span className="font-display tabular-nums text-[#6B5A48]">
            Page {currentPage} / {totalPages}
          </span>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-[#E5DCCE] border-t-[#C4A574]" />
            <p className="text-sm text-[#78716C]">Loading saved roles...</p>
          </div>
        </div>
      ) : totalJobs === 0 && !search ? (
        <div className="myjobs-empty">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[#E5DCCE] bg-[#F7F3EC] text-[#6B5A48]">
            <Bookmark size={22} aria-hidden />
          </div>
          <h2 className="font-display text-2xl font-semibold text-[#1C1917]">No saved roles yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[#78716C]">
            Browse curated QA and SDET openings and bookmark the ones you want to revisit.
          </p>
          <a href="/jobs" className={`myjobs-cta mt-7 ${focusRing}`}>
            Browse jobs
            <ExternalLink size={15} aria-hidden />
          </a>
        </div>
      ) : savedJobs.length === 0 ? (
        <div className="myjobs-empty">
          <h2 className="font-display text-xl font-semibold text-[#1C1917]">No matches</h2>
          <p className="mt-2 text-sm text-[#78716C]">Try a different keyword, or clear the search.</p>
          <button
            type="button"
            onClick={() => {
              setSearchInput('');
              setSearch('');
              setCurrentPage(1);
            }}
            className={`myjobs-cta mt-6 ${focusRing}`}
          >
            Clear search
          </button>
        </div>
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease: easeOut }}
            className="myjobs-list"
          >
            <ul>
              {savedJobs.map((job, index) => {
                const num = String(startIndex + index + 1).padStart(2, '0');
                const locationText = Array.isArray(job.location)
                  ? job.location.filter(Boolean).join(', ')
                  : job.location || 'Not specified';

                return (
                  <motion.li
                    key={job._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: Math.min(index * 0.04, 0.24),
                      duration: 0.4,
                      ease: easeOut,
                    }}
                  >
                    <div
                      role="button"
                      tabIndex={0}
                      className={`myjobs-row outline-none ${focusRing}`}
                      onClick={() => handleRowOpen(job.jobId, job.company, job.title)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleRowOpen(job.jobId, job.company, job.title);
                        }
                      }}
                    >
                      <span className="myjobs-row__num">{num}</span>

                      <div className="min-w-0">
                        <h2 className="myjobs-row__title">{job.title}</h2>
                        <div className="myjobs-row__meta">
                          <span>
                            <Building2 size={13} aria-hidden />
                            {job.company}
                          </span>
                          <span>
                            <MapPin size={13} aria-hidden />
                            {locationText}
                          </span>
                          <span>
                            <Briefcase size={13} aria-hidden />
                            {job.min_exp}+ yrs
                          </span>
                        </div>
                      </div>

                      <div className="myjobs-row__actions">
                        <a
                          href={job.apply_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`myjobs-apply ${focusRing}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          Apply
                          <ExternalLink size={14} aria-hidden />
                        </a>
                        <button
                          type="button"
                          onClick={(e) => handleRemoveJob(job._id, e)}
                          className={`myjobs-remove ${focusRing}`}
                          aria-label={`Remove ${job.title} from saved jobs`}
                          title="Remove from saved"
                        >
                          <Trash2 size={16} aria-hidden />
                        </button>
                      </div>
                    </div>
                  </motion.li>
                );
              })}
            </ul>
          </motion.div>

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`myjobs-page-btn ${focusRing}`}
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const pageNum =
                  currentPage <= 3
                    ? i + 1
                    : currentPage >= totalPages - 2
                      ? totalPages - 4 + i
                      : currentPage - 2 + i;

                if (pageNum < 1 || pageNum > totalPages) return null;

                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => handlePageChange(pageNum)}
                    className={`myjobs-page-btn ${currentPage === pageNum ? 'is-active' : ''} ${focusRing}`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`myjobs-page-btn ${focusRing}`}
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}

      <div className="mt-14">
        <RelatedLinks type="job" />
      </div>
    </div>
  );
}
