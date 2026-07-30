import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Helmet } from 'react-helmet-async';
import { motion, useReducedMotion } from 'framer-motion';
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
import { easeOut } from '../components/home/motion.jsx';
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

export default function MyJobs() {
  const urlParams = new URLSearchParams(window.location.search);
  const [savedJobs, setSavedJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(urlParams.get('search') || '');
  const [search, setSearch] = useState(urlParams.get('search') || '');
  const [currentPage, setCurrentPage] = useState(parseInt(urlParams.get('page'), 10) || 1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useSelector((state) => state.user);
  const userId = currentUser?._id;
  const reduceMotion = useReducedMotion();

  const updateSearchParams = (updates) => {
    const newParams = new URLSearchParams(window.location.search);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) newParams.set(key, String(value));
      else newParams.delete(key);
    });
    const qs = newParams.toString();
    window.history.pushState({}, '', qs ? `${window.location.pathname}?${qs}` : window.location.pathname);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      const next = searchInput.trim();
      if (next === search) return;
      setSearch(next);
      setCurrentPage(1);
      updateSearchParams({ search: next || null, page: '1' });
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput, search]);

  useEffect(() => {
    const fetchSavedJobs = async () => {
      if (!userId) {
        setIsLoading(false);
        setSavedJobs([]);
        setTotalJobs(0);
        setTotalPages(1);
        return;
      }

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
          updateSearchParams({ page: String(pages), search: search || null });
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
    updateSearchParams({ page: String(page), search: search || null });
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
        updateSearchParams({ page: String(pageToFetch), search: search || null });
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

  const seoTitle =
    totalJobs > 0
      ? `My Saved Jobs (${totalJobs}) | QA & SDET Roles - Route2Hire`
      : 'My Saved Jobs | QA & SDET Career Tracker - Route2Hire';

  const seoDescription =
    totalJobs > 0
      ? `Review and manage your ${totalJobs} saved QA, SDET and Test Automation jobs on Route2Hire. Open full JDs, apply, or remove roles from your shortlist.`
      : 'Save and manage QA, SDET and Test Automation jobs on Route2Hire. Build a shortlist of software testing roles and track opportunities you want to apply to.';

  if (!currentUser) {
    return (
      <>
        <Helmet>
          <title>My Saved Jobs | Sign in - Route2Hire</title>
          <meta
            name="description"
            content="Sign in to Route2Hire to save and manage QA, SDET and Test Automation job shortlists."
          />
          <meta name="robots" content="noindex,follow" />
          <link rel="canonical" href="https://route2hire.com/my-jobs" />
        </Helmet>

        <div className="myjobs-page flex min-h-screen items-center justify-center px-4 py-24">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: easeOut }}
            className="w-full max-w-md rounded-[1.25rem] border border-[#E5DCCE] bg-[#FFFDF8] p-8 text-center sm:p-10"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6B5A48]">
              Saved jobs
            </p>
            <h1 className="font-display mt-3 text-2xl font-semibold tracking-tight text-[#1C1917]">
              Sign in to view your shortlist
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-[#57534E]">
              Bookmark QA and SDET roles as you browse, then revisit them here anytime.
            </p>
            <button
              type="button"
              onClick={() => {
                const current = location.pathname + location.search + location.hash;
                navigate(`/sign-in?redirect=${encodeURIComponent(current)}`);
              }}
              className={`myjobs-cta mt-7 w-full justify-center ${focusRing}`}
            >
              Sign in
            </button>
          </motion.div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta
          name="keywords"
          content="saved QA jobs, saved SDET jobs, Test Automation shortlist, Route2Hire my jobs, software testing job bookmarks"
        />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://route2hire.com/my-jobs" />
        <meta property="og:image" content="https://route2hire.com/assets/Route2Hire.png" />
        <link rel="canonical" href="https://route2hire.com/my-jobs" />
        <meta name="robots" content="noindex,follow" />
      </Helmet>

      <div className="myjobs-page min-h-screen pb-16 pt-28 sm:pb-20 sm:pt-32">
        <section className="mx-auto max-w-6xl px-4 sm:px-6">
          <motion.header
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: easeOut }}
            className="mb-10 max-w-3xl sm:mb-12"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6B5A48]">
              Your shortlist
            </p>
            <h1 className="font-display mt-3 text-[clamp(2rem,5vw,3.25rem)] font-semibold leading-tight tracking-tight text-[#1C1917]">
              Saved QA and SDET jobs
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#57534E] sm:text-lg">
              Roles you bookmarked while browsing - open the full JD, apply, or remove anything
              that no longer fits.
            </p>
            <div className="myjobs-divider mt-6" aria-hidden />
            <p className="mt-5 text-sm text-[#78716C]">
              <span className="font-display text-lg font-semibold tabular-nums text-[#6B5A48]">
                {totalJobs}
              </span>{' '}
              saved {totalJobs === 1 ? 'role' : 'roles'}
            </p>
          </motion.header>

          {(totalJobs > 0 || search) && (
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.06, ease: easeOut }}
              className="mb-5"
            >
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
            </motion.div>
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
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: easeOut }}
              className="myjobs-empty"
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[#E5DCCE] bg-[#F7F3EC] text-[#6B5A48]">
                <Bookmark size={22} aria-hidden />
              </div>
              <h2 className="font-display text-2xl font-semibold text-[#1C1917]">
                No saved roles yet
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[#78716C]">
                Browse curated QA and SDET openings and bookmark the ones you want to revisit.
              </p>
              <Link to="/jobs" className={`myjobs-cta mt-7 ${focusRing}`}>
                Browse jobs
                <ExternalLink size={15} aria-hidden />
              </Link>
            </motion.div>
          ) : savedJobs.length === 0 ? (
            <div className="myjobs-empty">
              <h2 className="font-display text-xl font-semibold text-[#1C1917]">No matches</h2>
              <p className="mt-2 text-sm text-[#78716C]">
                Try a different keyword, or clear the search.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  setSearch('');
                  setCurrentPage(1);
                  updateSearchParams({ search: null, page: '1' });
                }}
                className={`myjobs-cta mt-6 ${focusRing}`}
              >
                Clear search
              </button>
            </div>
          ) : (
            <>
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 14 }}
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
                        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
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
        </section>
      </div>
    </>
  );
}
