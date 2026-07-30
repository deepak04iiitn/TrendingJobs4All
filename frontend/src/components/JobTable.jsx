import { useEffect, useState } from 'react';
import {
  Search,
  MapPin,
  Briefcase,
  Filter,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Clock,
  Building2,
  X,
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { easeOut } from './home/motion.jsx';
import { focusRing } from '../theme/tokens';

const truncateDescription = (description, wordLimit) => {
  if (typeof description !== 'string' || !description.trim() || description === 'Not Available') {
    return 'No description available';
  }

  const cleaned = description.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\s+/g, ' ').trim();
  const words = cleaned.split(' ');
  if (words.length > wordLimit) {
    return words.slice(0, wordLimit).join(' ') + '...';
  }
  return cleaned;
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1)
    .toString()
    .padStart(2, '0')}/${date.getFullYear()}`;
};

const formatUrlString = (company, title) => {
  const formatString = (str) =>
    str
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-');

  return `${formatString(company)}-${formatString(title)}`;
};

const isRecent = (dateStr) => {
  const jobDate = new Date(dateStr);
  const now = new Date();
  const hoursDifference = Math.floor((now - jobDate) / (1000 * 60 * 60));
  return hoursDifference <= 24;
};

const getTimeAgo = (dateStr) => {
  const jobDate = new Date(dateStr);
  const now = new Date();
  const diffInHours = Math.floor((now - jobDate) / (1000 * 60 * 60));

  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  const diffInWeeks = Math.floor(diffInDays / 7);
  return `${diffInWeeks}w ago`;
};

export default function JobTable() {
  const urlParams = new URLSearchParams(window.location.search);

  const [jobs, setJobs] = useState([]);
  const [currentPage, setCurrentPage] = useState(parseInt(urlParams.get('page')) || 1);
  const jobsPerPage = 8;
  const [searchKeyword, setSearchKeyword] = useState(urlParams.get('search') || '');
  const [minExpFilter, setMinExpFilter] = useState(urlParams.get('exp') || '');
  const [searchPage, setSearchPage] = useState(urlParams.get('page') || '');
  const [searchDate, setSearchDate] = useState(urlParams.get('date') || '');
  const [categoryFilter, setCategoryFilter] = useState(urlParams.get('category') || '');
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [isFilterChange, setIsFilterChange] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!showFilters) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setShowFilters(false);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [showFilters]);

  const updateSearchParams = (updates) => {
    const newParams = new URLSearchParams(window.location.search);

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });

    const newUrl = `${window.location.pathname}?${newParams.toString()}`;
    window.history.pushState({}, '', newUrl);

    if (Object.prototype.hasOwnProperty.call(updates, 'page')) {
      setSearchPage(updates.page);
    }
  };

  const handleFilterChange = (updates) => {
    setIsFilterChange(true);
    updateSearchParams({ ...updates, page: '1' });
  };

  const handleSearchKeywordChange = (value) => {
    setSearchKeyword(value);
    handleFilterChange({ search: value });
  };

  const handleMinExpChange = (value) => {
    setMinExpFilter(value);
    handleFilterChange({ exp: value });
  };

  const handleDateChange = (value) => {
    setSearchDate(value);
    handleFilterChange({ date: value });
  };

  const handleCategoryChange = (value) => {
    setCategoryFilter(value);
    handleFilterChange({ category: value });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setSearchPage(page.toString());
    updateSearchParams({ page: page.toString() });
  };

  const clearAllFilters = () => {
    setSearchKeyword('');
    setMinExpFilter('');
    setSearchDate('');
    setCategoryFilter('');
    setCurrentPage(1);
    setSearchPage('1');
    setIsFilterChange(true);
    window.history.pushState({}, '', window.location.pathname);
  };

  const handleApplyClick = (id, company, title, job) => {
    if (currentUser) {
      const formattedUrl = formatUrlString(company, title);
      const currentParams = new URLSearchParams(window.location.search);
      const jobKey = `jobData-${id}`;
      sessionStorage.setItem(jobKey, JSON.stringify(job));
      window.open(
        `/fulljd/${formattedUrl}/${id}?${currentParams.toString()}&jobKey=${jobKey}`,
        '_blank'
      );
    } else {
      setShowSignInModal(true);
    }
  };

  const handleSearchByPage = () => {
    const pageNum = parseInt(searchPage);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      handlePageChange(pageNum);
    } else {
      alert(`Please enter a valid page number between 1 and ${totalPages}`);
    }
  };

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setIsLoading(true);

        const params = new URLSearchParams();
        params.set('page', String(currentPage));
        params.set('limit', String(jobsPerPage));
        if (searchKeyword) params.set('search', searchKeyword);
        if (minExpFilter !== '') params.set('exp', String(minExpFilter));
        if (searchDate) params.set('date', searchDate);
        if (categoryFilter) params.set('category', categoryFilter);

        const { data } = await axios.get(`/backend/naukri?${params.toString()}`);

        const items = Array.isArray(data) ? data : data.items || [];
        const total = Array.isArray(data) ? items.length : data.total || 0;
        const serverTotalPages = Array.isArray(data)
          ? Math.ceil(total / jobsPerPage)
          : data.totalPages || 1;

        const processedJobs = items
          .map((item) => ({
            ...item,
            _id: item._id,
            title: item.job_title || item.title || 'Unknown',
            min_exp: parseFloat(item.min_exp) || 0,
            company: item.company || 'Unknown',
            location:
              Array.isArray(item.location) && item.location.length > 0
                ? item.location.join(' / ')
                : typeof item.location === 'string'
                  ? item.location
                  : 'Unknown',
            jd: item.full_jd || item.jd || '',
            date: item.time
              ? new Date(item.time).toISOString()
              : item.date
                ? new Date(item.date).toISOString()
                : new Date().toISOString(),
            apply_link: item.apply_link,
            category: item.category || '',
          }))
          .filter((job) => job._id);

        setJobs(processedJobs);
        setTotalJobs(total);
        setTotalPages(Math.max(serverTotalPages, 1));

        if (isFilterChange && currentPage > Math.max(serverTotalPages, 1)) {
          setCurrentPage(1);
          updateSearchParams({ page: '1' });
        }
      } catch (error) {
        console.error('Error fetching jobs:', error);
        setJobs([]);
        setTotalJobs(0);
        setTotalPages(1);
      } finally {
        setIsLoading(false);
        setIsFilterChange(false);
      }
    };

    fetchJobs();
  }, [currentUser, currentPage, searchKeyword, minExpFilter, searchDate, categoryFilter]);

  const startIndex = (currentPage - 1) * jobsPerPage;
  const currentJobs = jobs;
  const hasActiveFilters = Boolean(searchKeyword || minExpFilter || searchDate || categoryFilter);

  return (
    <div>
      {showSignInModal && (
        <div className="pointer-events-none fixed inset-0 z-40 bg-[#2C241B]/25" aria-hidden />
      )}

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.08, ease: easeOut }}
        className="jobs-search"
      >
        <div className="jobs-search__row">
          <div className="jobs-search__field">
            <Search className="jobs-search__icon h-4 w-4" aria-hidden />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchKeyword}
              onChange={(e) => handleSearchKeywordChange(e.target.value)}
              className="jobs-search__input"
              aria-label="Search jobs"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowFilters(true)}
            className={`jobs-search__toggle ${showFilters || hasActiveFilters ? 'is-open' : ''} ${focusRing}`}
            aria-expanded={showFilters}
            aria-controls="jobs-filter-drawer"
          >
            <Filter className="h-4 w-4" aria-hidden />
            Filters
            {hasActiveFilters && <span className="jobs-search__dot" aria-hidden />}
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
              className={`jobs-search__clear ${focusRing}`}
            >
              Clear
            </button>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {showFilters && (
          <>
            <motion.button
              key="jobs-filter-backdrop"
              type="button"
              aria-label="Close filters"
              className="jobs-filter-backdrop"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setShowFilters(false)}
            />
            <motion.aside
              key="jobs-filter-drawer"
              id="jobs-filter-drawer"
              role="dialog"
              aria-modal="true"
              aria-labelledby="jobs-filter-title"
              className="jobs-filter-drawer"
              initial={reduceMotion ? false : { x: '100%' }}
              animate={{ x: 0 }}
              exit={reduceMotion ? undefined : { x: '100%' }}
              transition={{ duration: 0.4, ease: easeOut }}
            >
              <div className="jobs-filter-drawer__head">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6B5A48]">
                    Refine
                  </p>
                  <h2
                    id="jobs-filter-title"
                    className="font-display mt-1 text-2xl font-semibold tracking-tight text-[#1C1917]"
                  >
                    Filters
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowFilters(false)}
                  className={`rounded-lg p-2 text-[#78716C] hover:bg-[#F7F3EC] hover:text-[#2C241B] ${focusRing}`}
                  aria-label="Close filters"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="jobs-filter-drawer__body">
                <div>
                  <label className="jobs-filter-label" htmlFor="jobs-filter-exp">
                    Experience
                  </label>
                  <input
                    id="jobs-filter-exp"
                    type="number"
                    placeholder="Min years"
                    value={minExpFilter}
                    onChange={(e) => handleMinExpChange(e.target.value)}
                    className={`jobs-input ${focusRing}`}
                  />
                </div>
                <div>
                  <label className="jobs-filter-label" htmlFor="jobs-filter-date">
                    Date
                  </label>
                  <input
                    id="jobs-filter-date"
                    type="date"
                    value={searchDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className={`jobs-input ${focusRing}`}
                  />
                </div>
                <div>
                  <label className="jobs-filter-label" htmlFor="jobs-filter-category">
                    Category
                  </label>
                  <select
                    id="jobs-filter-category"
                    value={categoryFilter}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className={`jobs-select ${focusRing}`}
                  >
                    <option value="">All</option>
                    <option value="qa">QA</option>
                    <option value="developer">Developer</option>
                    <option value="devops">DevOps</option>
                    <option value="intern">Intern</option>
                  </select>
                </div>
                <div>
                  <label className="jobs-filter-label" htmlFor="jobs-filter-page">
                    Page
                  </label>
                  <input
                    id="jobs-filter-page"
                    type="number"
                    placeholder={`1-${totalPages}`}
                    value={searchPage}
                    onChange={(e) => setSearchPage(e.target.value)}
                    className={`jobs-input ${focusRing}`}
                  />
                </div>
              </div>

              <div className="jobs-filter-drawer__foot">
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className={`jobs-filter-drawer__clear ${focusRing}`}
                  >
                    Clear all
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    const pageNum = parseInt(searchPage, 10);
                    if (!Number.isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
                      handlePageChange(pageNum);
                    }
                    setShowFilters(false);
                  }}
                  className={`jobs-filter-drawer__apply ${focusRing}`}
                >
                  Apply filters
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="mt-4 flex flex-col gap-1 text-sm text-[#78716C] sm:mt-5 sm:flex-row sm:items-center sm:justify-between">
        <span>
          Showing {totalJobs === 0 ? 0 : startIndex + 1}-
          {Math.min(startIndex + jobsPerPage, totalJobs)} of {totalJobs} roles
        </span>
        <span className="font-display tabular-nums text-[#6B5A48]">
          Page {currentPage} / {totalPages}
        </span>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-[#E5DCCE] border-t-[#C4A574]" />
            <p className="text-sm text-[#78716C]">Loading jobs...</p>
          </div>
        </div>
      ) : currentJobs.length > 0 ? (
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12, ease: easeOut }}
          className="jobs-list mt-5"
        >
          <div className="jobs-list__head">
            <span>#</span>
            <span>Role</span>
            <span>Company / Location</span>
            <span>Experience</span>
            <span>Posted</span>
            <span className="text-right">Open</span>
          </div>

          <ul>
            {currentJobs.map((job, index) => {
              const num = String(startIndex + index + 1).padStart(2, '0');
              const recent = isRecent(job.date);

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
                    className={`jobs-row group outline-none ${focusRing}`}
                    onClick={() => handleApplyClick(job._id, job.company, job.title, job)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleApplyClick(job._id, job.company, job.title, job);
                      }
                    }}
                  >
                    <span className="jobs-row__num text-base sm:text-lg">{num}</span>

                    <div className="min-w-0">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        {recent && (
                          <span className="jobs-new">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#C4A574]" aria-hidden />
                            New
                          </span>
                        )}
                        <span className="rounded-full border border-[#E5DCCE] bg-[#F7F3EC] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6B5A48]">
                          {job.category || 'General'}
                        </span>
                      </div>
                      <h2 className="jobs-row__title text-lg leading-snug sm:text-xl">{job.title}</h2>
                      <p className="mt-1.5 line-clamp-2 text-sm text-[#78716C] md:hidden">
                        {truncateDescription(job.jd, 16)}
                      </p>
                    </div>

                    <div className="min-w-0 space-y-1 text-sm text-[#57534E]">
                      <p className="flex items-center gap-1.5 font-medium">
                        <Building2 className="h-3.5 w-3.5 shrink-0 text-[#C4A574]" aria-hidden />
                        <span className="truncate">{job.company}</span>
                      </p>
                      <p className="flex items-center gap-1.5 text-[#78716C]">
                        <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
                        <span className="truncate">{job.location}</span>
                      </p>
                      <p className="hidden text-xs leading-relaxed text-[#78716C] md:line-clamp-2 lg:block">
                        {truncateDescription(job.jd, 14)}
                      </p>
                    </div>

                    <p className="flex items-center gap-1.5 text-sm text-[#57534E]">
                      <Briefcase className="h-3.5 w-3.5 text-[#C4A574] md:hidden" aria-hidden />
                      <span>{job.min_exp} yrs</span>
                    </p>

                    <div className="text-sm text-[#78716C]">
                      <p className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 md:hidden" aria-hidden />
                        {getTimeAgo(job.date)}
                      </p>
                      <p className="mt-0.5 hidden text-xs md:block">{formatDate(job.date)}</p>
                    </div>

                    <div className="flex md:justify-end">
                      <button
                        type="button"
                        className={`jobs-apply ${focusRing}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApplyClick(job._id, job.company, job.title, job);
                        }}
                      >
                        Open
                        <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                      </button>
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </ul>
        </motion.div>
      ) : (
        <div className="mt-8 rounded-[1.25rem] border border-[#E5DCCE] bg-[#FFFDF8] px-6 py-16 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[#E5DCCE] bg-[#F7F3EC]">
            <Search className="h-5 w-5 text-[#78716C]" aria-hidden />
          </div>
          <h3 className="font-display text-xl font-semibold text-[#1C1917]">No jobs found</h3>
          <p className="mx-auto mt-2 max-w-sm text-sm text-[#78716C]">
            Try a broader keyword or clear filters to see more QA and SDET openings.
          </p>
          <button
            type="button"
            onClick={clearAllFilters}
            className={`mt-5 rounded-full bg-[#2C241B] px-5 py-2.5 text-sm font-semibold text-[#FFFDF8] hover:bg-[#1A1510] ${focusRing}`}
          >
            Clear filters
          </button>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className={`jobs-page-btn inline-flex items-center justify-center ${focusRing}`}
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
                className={`jobs-page-btn ${currentPage === pageNum ? 'is-active' : ''} ${focusRing}`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className={`jobs-page-btn inline-flex items-center justify-center ${focusRing}`}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {showSignInModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[#2C241B]/35"
            onClick={() => setShowSignInModal(false)}
            aria-hidden
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="jobs-signin-title"
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[#E5DCCE] bg-[#FFFDF8] shadow-[0_28px_56px_-28px_rgba(44,36,27,0.35)]"
          >
            <div className="flex items-center justify-between border-b border-[#E5DCCE] px-5 py-4">
              <h3 id="jobs-signin-title" className="font-display text-lg font-semibold text-[#1C1917]">
                Sign in required
              </h3>
              <button
                type="button"
                onClick={() => setShowSignInModal(false)}
                className={`rounded-lg p-1.5 text-[#78716C] hover:bg-[#F7F3EC] ${focusRing}`}
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 sm:p-6">
              <p className="text-sm leading-relaxed text-[#57534E]">
                Sign in to open the full JD and apply for this QA or SDET role.
              </p>
              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => {
                    navigate('/sign-in');
                    setShowSignInModal(false);
                  }}
                  className={`flex-1 rounded-full bg-[#2C241B] px-5 py-2.5 text-sm font-semibold text-[#FFFDF8] hover:bg-[#1A1510] ${focusRing}`}
                >
                  Go to Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setShowSignInModal(false)}
                  className={`flex-1 rounded-full border border-[#E5DCCE] px-5 py-2.5 text-sm font-semibold text-[#2C241B] hover:bg-[#F7F3EC] ${focusRing}`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
