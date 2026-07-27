import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Bookmark,
  Share2,
  MapPin,
  Briefcase,
  Clock,
  ExternalLink,
  X,
  ArrowLeft,
  Building2,
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useSelector } from 'react-redux';
import CommentSection from '../components/CommentSection';
import RelatedLinks from '../components/RelatedLinks';
import { easeOut } from '../components/home/motion.jsx';
import { focusRing } from '../theme/tokens';
import '../styles/FullJd.css';

function Toast({ show, message, onHide }) {
  useEffect(() => {
    if (!show) return undefined;
    const timer = setTimeout(onHide, 2800);
    return () => clearTimeout(timer);
  }, [show, onHide]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: easeOut }}
          className="jd-toast"
          role="status"
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function FullJd() {
  const { id, url } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const passedJob = location.state?.job;
  const [job, setJob] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const reduceMotion = useReducedMotion();

  const { currentUser } = useSelector((state) => state.user);
  const userId = currentUser?._id;

  const getJobKeyFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('jobKey');
  };

  useEffect(() => {
    if (!userId) return;

    if (passedJob) {
      setJob(passedJob);
      checkIfJobIsSaved(passedJob._id);
      return;
    }

    const jobKey = getJobKeyFromUrl();
    if (jobKey) {
      const storedJob = sessionStorage.getItem(jobKey);
      if (storedJob) {
        try {
          const jobObj = JSON.parse(storedJob);
          setJob(jobObj);
          checkIfJobIsSaved(jobObj._id);
          return;
        } catch {
          /* fall through to fetch */
        }
      }
    }

    axios
      .get(`/backend/naukri/${url}/${id}`)
      .then((response) => {
        const jobData = response.data;
        setJob(jobData);
        checkIfJobIsSaved(jobData._id);
      })
      .catch((error) => console.error('Error fetching job data:', error));
  }, [id, url, userId, passedJob]);

  useEffect(() => {
    if (!isModalOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setIsModalOpen(false);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [isModalOpen]);

  const handleSaveJob = async () => {
    try {
      if (isSaved) {
        await axios.delete(`/backend/saved-jobs/${userId}/${job._id}`);
        setIsSaved(false);
      } else {
        if (!job._id || !job.title || !job.company) {
          alert('Unable to save job - missing required information');
          return;
        }

        const jobData = {
          jobId: job._id,
          title: job.title,
          company: job.company,
          location: Array.isArray(job.location) ? job.location : [job.location || 'Not specified'],
          min_exp: job.min_exp ? Number(job.min_exp) : 0,
          full_jd: job.jd || job.full_jd || 'No description available',
          apply_link: job.apply_link || '#',
          time: job.time || job.date || new Date().toISOString(),
        };

        await axios.post(`/backend/saved-jobs/${userId}`, jobData);
        setIsSaved(true);
      }
    } catch (err) {
      console.error('Error saving job:', err);
      if (err.response?.status === 400) {
        alert(`Unable to save job: ${err.response.data.message || 'Invalid data provided'}`);
      } else if (err.response?.status === 500) {
        alert('Server error occurred. Please try again later.');
      } else {
        alert('Network error occurred. Please check your connection.');
      }
    }
  };

  const checkIfJobIsSaved = async (jobId) => {
    try {
      const { data } = await axios.get(
        `/backend/saved-jobs/${userId}?jobId=${jobId}&page=1&limit=1`
      );
      const items = Array.isArray(data) ? data : data.items || [];
      setIsSaved(items.length > 0);
    } catch (err) {
      console.error('Error checking saved jobs:', err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '—';
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}/${date.getFullYear()}`;
  };

  const formatJobDescription = (description) => {
    if (!description) return 'No description available.';
    return description.split('\n').map((line, index) => (
      <span key={index}>
        {line}
        <br />
      </span>
    ));
  };

  const locationText = job
    ? Array.isArray(job.location)
      ? job.location.filter(Boolean).join(', ')
      : job.location || 'Not specified'
    : '';

  const postedAt = job?.time || job?.date;
  const description = job?.full_jd || job?.jd;
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  if (!currentUser) {
    return (
      <div className="jd-page flex min-h-screen items-center justify-center px-4 py-24">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easeOut }}
          className="jd-panel w-full max-w-md p-8 text-center sm:p-10"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6B5A48]">
            Access required
          </p>
          <h1 className="font-display mt-3 text-2xl font-semibold tracking-tight text-[#1C1917]">
            Sign in to view this role
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[#57534E]">
            Sign in to open the full JD, save the role, and join the discussion.
          </p>
          <button
            type="button"
            onClick={() => {
              const current = location.pathname + location.search + location.hash;
              navigate(`/sign-in?redirect=${encodeURIComponent(current)}`);
            }}
            className={`jd-apply mt-7 w-full ${focusRing}`}
          >
            Sign in
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>
          {job
            ? `${job.title} at ${job.company} | ${locationText} - Route2Hire`
            : 'Job Details | Route2Hire QA & SDET Platform'}
        </title>
        <meta
          name="description"
          content={
            job
              ? `Apply for ${job.title} at ${job.company} in ${locationText}. Find QA, SDET and Test Automation jobs on Route2Hire.`
              : 'View detailed job information for QA, SDET and Test Automation positions on Route2Hire.'
          }
        />
        <meta
          name="keywords"
          content={
            job
              ? `${job.title}, ${job.company}, QA jobs, SDET careers, Test Automation, ${locationText}`
              : 'QA jobs, SDET careers, Test Automation, Software Testing, Job details'
          }
        />
        <meta
          property="og:title"
          content={job ? `${job.title} at ${job.company} | Route2Hire` : 'Job Details | Route2Hire'}
        />
        <meta
          property="og:description"
          content={
            job
              ? `Apply for ${job.title} at ${job.company} in ${locationText}.`
              : 'Discover QA, SDET and Test Automation job opportunities on Route2Hire.'
          }
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:url"
          content={
            job
              ? `https://route2hire.com/fulljd/${url || job._id}/${job._id}`
              : 'https://route2hire.com/jobs'
          }
        />
        <meta property="og:image" content="https://route2hire.com/assets/Route2Hire.png" />
        <link
          rel="canonical"
          href={
            job
              ? `https://route2hire.com/fulljd/${url || job._id}/${job._id}`
              : 'https://route2hire.com/jobs'
          }
        />
      </Helmet>

      <div className="jd-page min-h-screen pb-16 pt-28 sm:pb-20 sm:pt-32">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          {job ? (
            <>
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: easeOut }}
              >
                <Link
                  to="/jobs"
                  className={`mb-8 inline-flex items-center gap-2 text-sm font-medium text-[#6B5A48] hover:text-[#2C241B] ${focusRing}`}
                >
                  <ArrowLeft size={16} aria-hidden />
                  Back to jobs
                </Link>

                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6B5A48]">
                  Role details
                </p>
                <h1 className="font-display mt-3 text-[clamp(1.85rem,4.5vw,2.85rem)] font-semibold leading-tight tracking-tight text-[#1C1917]">
                  {job.title}
                </h1>
                <p className="mt-3 flex items-center gap-2 text-lg text-[#57534E]">
                  <Building2 size={18} className="text-[#C4A574]" aria-hidden />
                  {job.company}
                </p>
                <div className="jd-divider mt-6" aria-hidden />

                <div className="jd-meta mt-6">
                  <span className="jd-meta__item">
                    <MapPin size={15} aria-hidden />
                    {locationText}
                  </span>
                  <span className="jd-meta__item">
                    <Briefcase size={15} aria-hidden />
                    {job.min_exp ?? 0} yrs experience
                  </span>
                  <span className="jd-meta__item">
                    <Clock size={15} aria-hidden />
                    Posted {formatDate(postedAt)}
                  </span>
                </div>

                <div className="jd-actions mt-8">
                  <a
                    href={job.apply_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`jd-apply ${focusRing}`}
                  >
                    Apply now
                    <ExternalLink size={16} aria-hidden />
                  </a>
                  <button
                    type="button"
                    onClick={handleSaveJob}
                    className={`jd-icon-btn ${isSaved ? 'is-saved' : ''} ${focusRing}`}
                    title={isSaved ? 'Remove from saved' : 'Save this job'}
                    aria-label={isSaved ? 'Remove from saved' : 'Save this job'}
                  >
                    <Bookmark size={18} className={isSaved ? 'fill-current' : ''} aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className={`jd-icon-btn ${focusRing}`}
                    title="Share this role"
                    aria-label="Share this role"
                  >
                    <Share2 size={18} aria-hidden />
                  </button>
                </div>
              </motion.div>

              <motion.section
                initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.08, ease: easeOut }}
                className="jd-panel mt-10 p-6 sm:p-8"
              >
                <h2 className="font-display text-2xl font-semibold tracking-tight text-[#1C1917]">
                  Job description
                </h2>
                <div className="jd-note mt-5">
                  If the apply link does not open, check the company careers page directly.
                </div>
                <div className="jd-body mt-6">{formatJobDescription(description)}</div>
              </motion.section>

              <motion.section
                initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.14, ease: easeOut }}
                className="jd-panel mt-8 p-6 sm:p-8"
              >
                <h2 className="font-display text-2xl font-semibold tracking-tight text-[#1C1917]">
                  Discussion
                </h2>
                <p className="mt-1 text-sm text-[#78716C]">
                  Ask questions or share tips about this role.
                </p>
                <div className="mt-6">
                  <CommentSection jobId={job._id} />
                </div>
              </motion.section>

              <div className="mt-12">
                <RelatedLinks type="job" />
              </div>

              <AnimatePresence>
                {isModalOpen && (
                  <>
                    <motion.button
                      type="button"
                      aria-label="Close share panel"
                      className="fixed inset-0 z-[70] border-0 bg-[#2C241B]/35"
                      initial={reduceMotion ? false : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      onClick={() => setIsModalOpen(false)}
                    />
                    <motion.div
                      role="dialog"
                      aria-modal="true"
                      aria-labelledby="jd-share-title"
                      className="fixed inset-x-4 top-1/2 z-[71] mx-auto w-full max-w-md -translate-y-1/2 overflow-hidden rounded-2xl border border-[#E5DCCE] bg-[#FFFDF8] shadow-[0_28px_56px_-28px_rgba(44,36,27,0.35)] sm:inset-x-auto"
                      initial={reduceMotion ? false : { opacity: 0, y: 20, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={reduceMotion ? undefined : { opacity: 0, y: 12, scale: 0.98 }}
                      transition={{ duration: 0.35, ease: easeOut }}
                    >
                      <div className="flex items-start justify-between border-b border-[#E5DCCE] px-5 py-4">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6B5A48]">
                            Share
                          </p>
                          <h2
                            id="jd-share-title"
                            className="font-display mt-1 text-xl font-semibold text-[#1C1917]"
                          >
                            Share this role
                          </h2>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsModalOpen(false)}
                          className={`rounded-lg p-2 text-[#78716C] hover:bg-[#F7F3EC] ${focusRing}`}
                          aria-label="Close"
                        >
                          <X size={18} />
                        </button>
                      </div>

                      <div className="p-5">
                        <div className="jd-share-grid">
                          <a
                            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`jd-share-item ${focusRing}`}
                          >
                            LinkedIn
                          </a>
                          <a
                            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`Check out this role: ${job.title} at ${job.company}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`jd-share-item ${focusRing}`}
                          >
                            Twitter
                          </a>
                          <a
                            href={`https://wa.me/?text=${encodeURIComponent(`Check out this job: ${job.title} at ${job.company} - ${shareUrl}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`jd-share-item ${focusRing}`}
                          >
                            WhatsApp
                          </a>
                          <a
                            href={`mailto:?subject=${encodeURIComponent(`Job Opportunity: ${job.title}`)}&body=${encodeURIComponent(`I found this role that might interest you:\n\n${job.title} at ${job.company}\n\nLocation: ${locationText}\nExperience: ${job.min_exp} years\n\n${shareUrl}`)}`}
                            className={`jd-share-item ${focusRing}`}
                          >
                            Email
                          </a>
                        </div>

                        <div className="mt-5 border-t border-[#E5DCCE] pt-5">
                          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#78716C]">
                            Copy link
                          </p>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={shareUrl}
                              readOnly
                              className="min-w-0 flex-1 rounded-xl border border-[#E5DCCE] bg-[#F7F3EC] px-3 py-2.5 text-sm text-[#57534E] outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(shareUrl);
                                setToastMessage('Link copied');
                                setShowToast(true);
                              }}
                              className={`shrink-0 rounded-xl bg-[#2C241B] px-4 py-2.5 text-sm font-semibold text-[#FFFDF8] hover:bg-[#1A1510] ${focusRing}`}
                            >
                              Copy
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </>
          ) : (
            <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
              <div className="mb-4 h-10 w-10 animate-spin rounded-full border-2 border-[#E5DCCE] border-t-[#C4A574]" />
              <p className="font-display text-xl font-semibold text-[#1C1917]">Loading role details</p>
              <p className="mt-2 text-sm text-[#78716C]">Fetching the full job description...</p>
            </div>
          )}
        </div>

        <Toast show={showToast} message={toastMessage} onHide={() => setShowToast(false)} />
      </div>
    </>
  );
}
