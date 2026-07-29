import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import InterviewEmptyState from '../components/InterviewEmptyState';
import InterviewCommentSection from '../components/InterviewCommentSection';
import RelatedLinks from '../components/RelatedLinks';
import { useSelector } from 'react-redux';
import {
  X,
  Search,
  SlidersHorizontal,
  Plus,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  ChevronRight,
  Star,
  Quote,
  Briefcase,
  List,
} from 'lucide-react';
import slugify from '../utils/slugify';
import { focusRing } from '../theme/tokens';

const verdictTone = (verdict) => {
  if (verdict === 'selected') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  if (verdict === 'rejected') return 'border-rose-200 bg-rose-50 text-rose-700';
  return 'border-[#E5DCCE] bg-[#F7F3EC] text-[#6B5A48]';
};

const verdictLabel = (verdict) => {
  if (verdict === 'selected') return 'Selected';
  if (verdict === 'rejected') return 'Not selected';
  return 'Outcome not shared';
};

export default function InterviewExp() {
  const [sidePanel, setSidePanel] = useState({ open: false, type: 'filters' });
  // Mobile/tablet only: whether the "browse experiences" bottom sheet is open.
  // The desktop rail is a permanently-visible sticky column and does not use this state.
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [experiences, setExperiences] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedExperience, setSelectedExperience] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [isPremiumUser, setIsPremiumUser] = useState(false);
  const [isCheckingPremium, setIsCheckingPremium] = useState(true);
  const { currentUser } = useSelector((state) => state.user);
  const reduceMotion = useReducedMotion();

  const navigate = useNavigate();
  const { experienceId, slug } = useParams();

  // Single filters state that gets applied immediately
  const [filters, setFilters] = useState({
    companySearch: '',
    positionSearch: '',
    yoeSearch: '',
    verdictFilter: '',
    sortConfig: 'rating-desc',
  });
  const [panelFilters, setPanelFilters] = useState(filters);
  const [shareForm, setShareForm] = useState({
    fullName: '',
    company: '',
    position: '',
    yoe: '',
    verdict: '',
    experience: '',
    rating: 0,
    linkedin: '',
  });
  const [shareError, setShareError] = useState('');
  const [shareSuccess, setShareSuccess] = useState('');
  const [isSubmittingShare, setIsSubmittingShare] = useState(false);

  const openPanel = (type) => {
    if (type === 'filters') setPanelFilters(filters);
    setSidePanel({ open: true, type });
  };

  const closePanel = () => setSidePanel((prev) => ({ ...prev, open: false }));

  const handleShareChange = (field, value) => {
    setShareForm((prev) => ({ ...prev, [field]: value }));
  };

  // Check premium status
  useEffect(() => {
    const checkPremiumStatus = async () => {
      if (!currentUser?.email) {
        setIsPremiumUser(false);
        setIsCheckingPremium(false);
        return;
      }

      try {
        const response = await fetch('/backend/premium');
        const premiumUsers = await response.json();

        const userIsPremium = premiumUsers.some((user) => user.email === currentUser.email);
        setIsPremiumUser(userIsPremium);
      } catch (error) {
        console.error('Error checking premium status:', error);
        setIsPremiumUser(false);
      } finally {
        setIsCheckingPremium(false);
      }
    };

    checkPremiumStatus();
  }, [currentUser]);

  // Redirect from old /interviewExp route to canonical /interview-experiences
  useEffect(() => {
    const currentPath = window.location.pathname;
    if (currentPath === '/interviewExp' || currentPath.startsWith('/interviewExp/')) {
      const newPath = currentPath.replace('/interviewExp', '/interview-experiences');
      navigate(newPath, { replace: true });
      return;
    }
  }, [navigate]);

  useEffect(() => {
    fetchExperiences();
  }, []);

  // Lock page scroll while the mobile bottom sheet or the filters/share panel is open,
  // otherwise touch/wheel scrolling passes through to the page behind them.
  useEffect(() => {
    const isOverlayOpen = isSidebarOpen || sidePanel.open;
    if (!isOverlayOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isSidebarOpen, sidePanel.open]);

  // If the viewport grows into the desktop layout while the mobile sheet is open, close it —
  // the desktop rail is shown separately and doesn't need the sheet lingering open underneath.
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle URL parameter changes
  useEffect(() => {
    if (experienceId && experiences.length > 0) {
      const experience = experiences.find((exp) => exp._id === experienceId);
      if (experience) {
        setSelectedExperience(experience);
      } else if (experiences.length > 0) {
        // If invalid ID, redirect to first experience
        const firstExp = experiences[0];
        setSelectedExperience(firstExp);
        const slug = slugify(`${firstExp.company || 'company'}-${firstExp.position || 'role'}`);
        navigate(`/interview-experience/${slug}/${firstExp._id}`, { replace: true });
      }
    } else if (experiences.length > 0 && !selectedExperience) {
      // If no ID in URL, select first experience
      const firstExp = experiences[0];
      setSelectedExperience(firstExp);
      const slug = slugify(`${firstExp.company || 'company'}-${firstExp.position || 'role'}`);
      navigate(`/interview-experience/${slug}/${firstExp._id}`, { replace: true });
    }
  }, [experienceId, experiences, navigate, selectedExperience]);

  const fetchExperiences = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/backend/interviews/getInterviewExp');
      if (!response.ok) {
        throw new Error('Failed to fetch experiences');
      }
      const data = await response.json();
      setExperiences(data);
    } catch (error) {
      console.error('Error fetching experiences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle saving filters and applying them immediately
  const handleSaveAndApplyFilters = (newFilters) => {
    setFilters(newFilters);
  };

  // Handle clearing filters
  const handleClearFilters = (clearedFilters) => {
    setFilters(clearedFilters);
  };

  const handleExperienceSelect = (experience) => {
    setSelectedExperience(experience);
    const slug = slugify(`${experience.company || 'company'}-${experience.position || 'role'}`);
    navigate(`/interview-experience/${slug}/${experience._id}`);
    // Closes the mobile bottom sheet after picking an experience; already false on desktop.
    setIsSidebarOpen(false);
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= (rating || 0);
      stars.push(
        <Star
          key={i}
          size={14}
          className={isFilled ? 'fill-[#C4A574] text-[#C4A574]' : 'fill-transparent text-[#E5DCCE]'}
        />
      );
    }
    return <div className="flex items-center gap-0.5">{stars}</div>;
  };

  // Filter and sort experiences using the current filters state
  const filteredExperiences = useMemo(
    () =>
      experiences
        .filter((exp) => {
          const companyMatch = (exp.company || '').toLowerCase().includes(filters.companySearch.toLowerCase());
          const positionMatch = (exp.position || '').toLowerCase().includes(filters.positionSearch.toLowerCase());
          const yoeMatch =
            filters.yoeSearch === '' || (exp.yoe !== undefined && exp.yoe.toString() === filters.yoeSearch);
          const verdictMatch =
            filters.verdictFilter === '' ||
            (exp.verdict && exp.verdict.toLowerCase() === filters.verdictFilter.toLowerCase());

          // Add search term filtering
          const searchMatch =
            searchTerm === '' ||
            (exp.company || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (exp.position || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (exp.title || '').toLowerCase().includes(searchTerm.toLowerCase());

          return companyMatch && positionMatch && yoeMatch && verdictMatch && searchMatch;
        })
        .sort((a, b) => {
          const [field, order] = filters.sortConfig.split('-');
          const sortValue = order === 'asc' ? 1 : -1;

          if (field === 'rating') {
            return ((a.rating || 0) - (b.rating || 0)) * sortValue;
          } else if (field === 'likes') {
            return ((a.numberOfLikes || 0) - (b.numberOfLikes || 0)) * sortValue;
          } else if (field === 'dislikes') {
            return ((a.numberOfDislikes || 0) - (b.numberOfDislikes || 0)) * sortValue;
          }
          return 0;
        }),
    [experiences, filters, searchTerm]
  );

  // Handle successful form submission
  const handleFormSubmitSuccess = async () => {
    await fetchExperiences();
  };

  const handleShareSubmit = async (e) => {
    e.preventDefault();
    setShareError('');
    setShareSuccess('');

    if (!currentUser?._id) {
      setShareError('Please sign in to share your interview experience.');
      return;
    }

    if (!shareForm.company || !shareForm.position || !shareForm.experience || !shareForm.rating) {
      setShareError('Company, Position, Experience, and Rating are required.');
      return;
    }

    try {
      setIsSubmittingShare(true);
      const payload = {
        ...shareForm,
        fullName: shareForm.fullName.trim() || 'Anonymous',
        yoe: shareForm.yoe ? Number(shareForm.yoe) : 0,
        verdict: shareForm.verdict || 'N/A',
        userRef: currentUser._id,
      };

      const response = await fetch('/backend/interviews/createInterviewExp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to share experience');
      }

      setShareSuccess('Experience shared successfully.');
      setShareForm({
        fullName: '',
        company: '',
        position: '',
        yoe: '',
        verdict: '',
        experience: '',
        rating: 0,
        linkedin: '',
      });
      await handleFormSubmitSuccess();
      setTimeout(() => closePanel(), 600);
    } catch (error) {
      setShareError(error.message);
    } finally {
      setIsSubmittingShare(false);
    }
  };

  const handleLike = async (experienceId) => {
    if (!currentUser) {
      // You can add a toast notification here
      return;
    }

    try {
      const response = await fetch(`/backend/interviews/likeExperience/${experienceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        // Update the experience in the list
        setExperiences((prevExperiences) =>
          prevExperiences.map((exp) =>
            exp._id === experienceId
              ? {
                  ...exp,
                  numberOfLikes: data.likes,
                  numberOfDislikes: data.dislikes,
                  likes: exp.likes.includes(currentUser._id) ? exp.likes : [...exp.likes, currentUser._id],
                  dislikes: exp.dislikes.filter((id) => id !== currentUser._id),
                }
              : exp
          )
        );

        // Update selected experience if it's the one being liked
        if (selectedExperience?._id === experienceId) {
          setSelectedExperience((prev) => ({
            ...prev,
            numberOfLikes: data.likes,
            numberOfDislikes: data.dislikes,
            likes: prev.likes.includes(currentUser._id) ? prev.likes : [...prev.likes, currentUser._id],
            dislikes: prev.dislikes.filter((id) => id !== currentUser._id),
          }));
        }
      }
    } catch (error) {
      console.error('Error liking experience:', error);
    }
  };

  const handleDislike = async (experienceId) => {
    if (!currentUser) {
      // You can add a toast notification here
      return;
    }

    try {
      const response = await fetch(`/backend/interviews/dislikeExperience/${experienceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        // Update the experience in the list
        setExperiences((prevExperiences) =>
          prevExperiences.map((exp) =>
            exp._id === experienceId
              ? {
                  ...exp,
                  numberOfLikes: data.likes,
                  numberOfDislikes: data.dislikes,
                  dislikes: exp.dislikes.includes(currentUser._id) ? exp.dislikes : [...exp.dislikes, currentUser._id],
                  likes: exp.likes.filter((id) => id !== currentUser._id),
                }
              : exp
          )
        );

        // Update selected experience if it's the one being disliked
        if (selectedExperience?._id === experienceId) {
          setSelectedExperience((prev) => ({
            ...prev,
            numberOfLikes: data.likes,
            numberOfDislikes: data.dislikes,
            dislikes: prev.dislikes.includes(currentUser._id) ? prev.dislikes : [...prev.dislikes, currentUser._id],
            likes: prev.likes.filter((id) => id !== currentUser._id),
          }));
        }
      }
    } catch (error) {
      console.error('Error disliking experience:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F3EC] px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-[#E5DCCE] border-t-[#C4A574]" />
          <p className="text-sm font-medium text-[#6B5A48]">Loading interview experiences…</p>
        </div>
      </div>
    );
  }

  // Shared "contents" rail markup — rendered as an always-visible sticky column on
  // desktop, and inside a bottom-sheet drawer on mobile/tablet (see below).
  const renderRailContent = (variant) => (
    <>
      <div className={`shrink-0 border-b border-[#E5DCCE] bg-[#F7F3EC] p-5 ${variant === 'desktop' ? 'lg:rounded-t-2xl' : ''}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6B5A48]">Contents</p>
            <h2 className="font-display mt-1 text-xl font-semibold text-[#1C1917]">Browse experiences</h2>
            <p className="mt-1 text-xs text-[#78716C]">{filteredExperiences.length} shared so far</p>
          </div>
          {variant === 'mobile' && (
            <button
              type="button"
              onClick={() => setIsSidebarOpen(false)}
              aria-label="Close experiences list"
              className={`shrink-0 rounded-lg border border-[#E5DCCE] bg-[#FFFDF8] p-2 text-[#6B5A48] transition hover:bg-[#EFE8DC] ${focusRing}`}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <label className="relative mt-4 block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#78716C]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search company or role..."
            aria-label="Search interview experiences"
            className={`w-full rounded-xl border border-[#E5DCCE] bg-[#FFFDF8] py-2.5 pl-9 pr-3 text-sm text-[#2C241B] outline-none transition placeholder:text-[#78716C] focus:border-[#C4A574] focus:ring-2 focus:ring-[#C4A574]/30 ${focusRing}`}
          />
        </label>

        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => openPanel('filters')}
            className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#E5DCCE] bg-[#FFFDF8] px-3 py-2 text-xs font-semibold text-[#6B5A48] transition hover:bg-[#EFE8DC] ${focusRing}`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden />
            Filters
          </button>
          <button
            type="button"
            onClick={() => openPanel('share')}
            className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#2C241B] bg-[#2C241B] px-3 py-2 text-xs font-semibold text-[#FFFDF8] transition hover:bg-[#1A1510] ${focusRing}`}
          >
            <Plus className="h-3.5 w-3.5" aria-hidden />
            Share
          </button>
        </div>
      </div>

      <div className="relative min-h-0 flex-1">
        <div className="r2h-scroll-thin h-full space-y-0.5 overflow-y-auto overscroll-contain p-2.5">
          {filteredExperiences.map((experience, index) => {
            const isActive = selectedExperience?._id === experience._id;
            return (
              <button
                key={experience._id}
                type="button"
                onClick={() => handleExperienceSelect(experience)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${focusRing} ${
                  isActive ? 'bg-[#2C241B] text-[#FFFDF8]' : 'text-[#2C241B] hover:bg-[#F7F3EC]'
                }`}
              >
                <span className="font-display shrink-0 text-sm font-semibold text-[#C4A574]">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{experience.company}</span>
                  <span className={`block truncate text-xs ${isActive ? 'text-[#EFE8DC]' : 'text-[#78716C]'}`}>
                    {experience.position}
                  </span>
                </span>
                <span
                  aria-hidden
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                    experience.verdict === 'selected'
                      ? 'bg-emerald-500'
                      : experience.verdict === 'rejected'
                        ? 'bg-rose-400'
                        : isActive
                          ? 'bg-[#FFFDF8]/40'
                          : 'bg-[#D8CDBB]'
                  }`}
                />
              </button>
            );
          })}
          {filteredExperiences.length === 0 && (
            <p className="px-2 py-8 text-center text-sm text-[#78716C]">No experiences match your search.</p>
          )}
        </div>
        {filteredExperiences.length > 0 && (
          <div
            aria-hidden
            className={`pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#FFFDF8] to-transparent ${
              variant === 'desktop' ? 'lg:rounded-b-2xl' : ''
            }`}
          />
        )}
      </div>
    </>
  );

  return (
    <>
      <Helmet>
        <title>
          {selectedExperience
            ? `${selectedExperience.company} Interview Experience | QA, SDET & Test Automation - Route2Hire`
            : 'Interview Experiences | QA, SDET & Test Automation - Route2Hire'}
        </title>
        <meta
          name="description"
          content={
            selectedExperience
              ? `Read ${selectedExperience.company} interview experience for ${selectedExperience.position} role. Get insights, tips, and company-specific interview processes to ace your next QA interview on Route2Hire.`
              : 'Read real interview experiences from QA, SDET, Test Automation, and Software Testing professionals. Get insights, tips, and company-specific interview processes to ace your next QA interview on Route2Hire.'
          }
        />
        <meta
          name="keywords"
          content={
            selectedExperience
              ? `${selectedExperience.company} interview experience, ${selectedExperience.position} interview, QA interview stories, SDET interview experiences, Test Automation interviews, Software Testing interview experiences, QA interview tips, Company interview processes, QA career insights`
              : 'Interview experiences, QA interview stories, SDET interview experiences, Test Automation interviews, Software Testing interview experiences, QA interview tips, Company interview processes, QA career insights'
          }
        />
        <meta
          property="og:title"
          content={selectedExperience ? `${selectedExperience.company} Interview Experience | Route2Hire` : 'Interview Experiences | Route2Hire'}
        />
        <meta
          property="og:description"
          content={
            selectedExperience
              ? `Read ${selectedExperience.company} interview experience for ${selectedExperience.position} role. Get company-specific insights and tips to ace your software testing interviews.`
              : 'Read real interview experiences from QA, SDET, and Test Automation professionals. Get company-specific insights and tips to ace your software testing interviews.'
          }
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:url"
          content={
            selectedExperience && experienceId
              ? slug
                ? `https://route2hire.com/interview-experience/${slug}/${experienceId}`
                : `https://route2hire.com/interview-experience/${experienceId}`
              : 'https://route2hire.com/interview-experiences'
          }
        />
        <meta property="og:image" content="https://route2hire.com/assets/Route2Hire.png" />
        <link
          rel="canonical"
          href={
            selectedExperience && experienceId
              ? slug
                ? `https://route2hire.com/interview-experience/${slug}/${experienceId}`
                : `https://route2hire.com/interview-experience/${experienceId}`
              : 'https://route2hire.com/interview-experiences'
          }
        />
      </Helmet>

      <div className="relative min-h-screen bg-[#F7F3EC] pb-16 pt-28 sm:pb-20 sm:pt-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <motion.header
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="max-w-3xl border-b border-[#E5DCCE] pb-8"
          >
            <h1 className="font-display text-[clamp(2rem,4.4vw,3.4rem)] font-semibold leading-tight tracking-tight text-[#1C1917]">
              Real QA, SDET &amp; test automation interview experiences
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#57534E] sm:text-base">
              Learn from interview stories shared by QA, SDET and test automation professionals. Browse
              company-specific rounds, difficulty ratings and outcomes, then add your own experience to
              help the next candidate prepare with confidence.
            </p>
          </motion.header>

          {/* Mobile / tablet: obvious inline trigger for the experiences list, opens a bottom sheet */}
          <div className="mt-6 lg:hidden">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className={`flex w-full items-center justify-between gap-3 rounded-2xl border border-[#E5DCCE] bg-[#FFFDF8] px-4 py-3.5 text-left shadow-[0_2px_12px_-6px_rgba(44,36,27,0.1)] transition hover:bg-[#F7F3EC] ${focusRing}`}
            >
              <span className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#E5DCCE] bg-[#F7F3EC] text-[#C4A574]">
                  <List className="h-4 w-4" aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-[#2C241B]">Browse experiences</span>
                  <span className="block text-xs text-[#78716C]">{filteredExperiences.length} shared so far</span>
                </span>
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-[#78716C]" aria-hidden />
            </button>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start">
            {/* Contents rail — always visible, sticky column on desktop; hidden on mobile in favor of the bottom sheet */}
            <aside className="hidden lg:sticky lg:top-28 lg:z-0 lg:flex lg:h-[min(max(640px,calc(100vh-6rem)),960px)] lg:w-full lg:flex-col lg:overflow-hidden lg:rounded-2xl lg:border lg:border-[#E5DCCE] lg:bg-[#FFFDF8] lg:shadow-[0_2px_16px_-8px_rgba(44,36,27,0.1)]">
              {renderRailContent('desktop')}
            </aside>

            {/* Main article column */}
            <section className="min-w-0">
              {filteredExperiences.length === 0 ? (
                <motion.div
                  initial={reduceMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <InterviewEmptyState onShareClick={() => openPanel('share')} />
                </motion.div>
              ) : selectedExperience ? (
                <motion.article
                  key={selectedExperience._id}
                  initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="overflow-hidden rounded-2xl border border-[#E5DCCE] bg-[#FFFDF8] shadow-[0_2px_16px_-8px_rgba(44,36,27,0.1)]"
                >
                  <header className="rounded-t-2xl border-b border-[#E5DCCE] bg-[#F7F3EC] px-6 py-6 sm:px-8 sm:py-7">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6B5A48]">
                          {selectedExperience.position || 'Interview experience'}
                        </p>
                        <h2 className="font-display mt-2 truncate text-[clamp(1.6rem,3.4vw,2.6rem)] font-semibold leading-tight tracking-tight text-[#1C1917]">
                          {selectedExperience.company}
                        </h2>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${verdictTone(selectedExperience.verdict)}`}>
                            {verdictLabel(selectedExperience.verdict)}
                          </span>
                          {selectedExperience.yoe != null && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-[#E5DCCE] bg-[#FFFDF8] px-2.5 py-1 text-xs font-semibold text-[#6B5A48]">
                              <Briefcase className="h-3 w-3" aria-hidden />
                              {selectedExperience.yoe} YOE
                            </span>
                          )}
                          {typeof selectedExperience.rating !== 'undefined' && (
                            <span className="inline-flex items-center rounded-full border border-[#E5DCCE] bg-[#FFFDF8] px-2.5 py-1">
                              {renderStars(selectedExperience.rating)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleLike(selectedExperience._id)}
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-semibold transition ${focusRing} ${
                            selectedExperience.likes?.includes(currentUser?._id)
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                              : 'border-[#E5DCCE] bg-[#FFFDF8] text-[#6B5A48] hover:bg-[#F7F3EC]'
                          }`}
                        >
                          <ThumbsUp className={`h-4 w-4 ${selectedExperience.likes?.includes(currentUser?._id) ? 'fill-current' : ''}`} />
                          {selectedExperience.numberOfLikes || 0}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDislike(selectedExperience._id)}
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-semibold transition ${focusRing} ${
                            selectedExperience.dislikes?.includes(currentUser?._id)
                              ? 'border-rose-200 bg-rose-50 text-rose-700'
                              : 'border-[#E5DCCE] bg-[#FFFDF8] text-[#6B5A48] hover:bg-[#F7F3EC]'
                          }`}
                        >
                          <ThumbsDown className={`h-4 w-4 ${selectedExperience.dislikes?.includes(currentUser?._id) ? 'fill-current' : ''}`} />
                          {selectedExperience.numberOfDislikes || 0}
                        </button>
                      </div>
                    </div>
                  </header>

                  <div className="px-6 py-7 sm:px-8 sm:py-8">
                    <div className="relative rounded-2xl border border-[#E5DCCE] bg-[#F7F3EC] p-5 sm:p-7">
                      <Quote className="absolute -left-2 -top-3 h-8 w-8 text-[#C4A574]/40" aria-hidden />
                      <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-[#2C241B] sm:text-base">
                        {selectedExperience.description || selectedExperience.experience || 'No description available.'}
                      </p>
                    </div>
                    <p className="mt-4 text-right text-xs italic text-[#78716C]">
                      — {selectedExperience.fullName || 'Anonymous contributor'}
                    </p>
                  </div>

                  <div className="border-t border-[#E5DCCE] px-6 py-7 sm:px-8 sm:py-8">
                    <h3 className="font-display flex items-center gap-2 text-xl font-semibold text-[#1C1917]">
                      <MessageCircle className="h-5 w-5 text-[#C4A574]" aria-hidden />
                      Discussion
                    </h3>
                    <p className="mt-1 text-sm text-[#78716C]">
                      Ask questions or add your own perspective on this interview experience.
                    </p>
                    <div className="mt-5">
                      <InterviewCommentSection expId={selectedExperience._id} />
                    </div>
                  </div>
                </motion.article>
              ) : (
                <div className="rounded-2xl border border-dashed border-[#E5DCCE] bg-[#FFFDF8] px-6 py-16 text-center">
                  <p className="font-display text-2xl text-[#1C1917]">Select an experience</p>
                  <p className="mt-2 text-sm text-[#78716C]">
                    Choose an experience from the contents list to view its details.
                  </p>
                </div>
              )}
            </section>
          </div>

          <div className="mt-14">
            <RelatedLinks type="interview" />
          </div>
        </div>
      </div>

      {/* Mobile / tablet bottom sheet for the experiences list */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 z-[2147483646] bg-[#2C241B]/40 lg:hidden"
              aria-label="Close experiences list backdrop"
            />
            <motion.aside
              initial={reduceMotion ? false : { y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-x-0 bottom-0 z-[2147483647] flex h-[min(85vh,640px)] flex-col overflow-hidden rounded-t-3xl border-t border-[#E5DCCE] bg-[#FFFDF8] shadow-[0_-10px_30px_rgba(44,36,27,0.18)] lg:hidden"
            >
              <div className="flex shrink-0 justify-center bg-[#F7F3EC] pt-3">
                <span className="h-1.5 w-10 rounded-full bg-[#E5DCCE]" aria-hidden />
              </div>
              {renderRailContent('mobile')}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {sidePanel.open && (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closePanel}
              className="fixed inset-0 z-[2147483646] bg-[#2C241B]/35"
              aria-label="Close side panel backdrop"
            />
            <motion.aside
              initial={reduceMotion ? false : { x: 420 }}
              animate={{ x: 0 }}
              exit={{ x: 420 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="fixed right-0 top-0 z-[2147483647] h-full w-full max-w-[460px] border-l border-[#E5DCCE] bg-[#FFFDF8] shadow-[0_0_0_1px_rgba(229,220,206,0.5),_-10px_0_30px_rgba(44,36,27,0.12)]"
            >
              <div className="flex h-full flex-col">
                <div className="border-b border-[#E5DCCE] bg-[#FFFDF8] px-5 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-3xl text-[#1C1917]">
                      {sidePanel.type === 'filters' ? 'Filters' : 'Share experience'}
                    </h3>
                    <button
                      type="button"
                      onClick={closePanel}
                      className={`rounded-lg border border-[#E5DCCE] bg-[#F7F3EC] p-2 text-[#6B5A48] transition hover:bg-[#EFE8DC] ${focusRing}`}
                      aria-label="Close side panel"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-[#78716C]">
                    {sidePanel.type === 'filters'
                      ? 'Refine by company, role, experience level, and outcome.'
                      : 'Share your interview details to help the next candidate prepare better.'}
                  </p>
                </div>

                {sidePanel.type === 'filters' ? (
                  <>
                <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
                <div className="space-y-4">
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-[#78716C]">
                      Company
                    </span>
                    <input
                      value={panelFilters.companySearch}
                      onChange={(e) =>
                        setPanelFilters((prev) => ({ ...prev, companySearch: e.target.value }))
                      }
                      className={`w-full rounded-xl border border-[#E5DCCE] bg-[#F7F3EC] px-3 py-2.5 text-sm text-[#2C241B] outline-none transition focus:border-[#C4A574] focus:ring-2 focus:ring-[#C4A574]/30 ${focusRing}`}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-[#78716C]">
                      Position
                    </span>
                    <input
                      value={panelFilters.positionSearch}
                      onChange={(e) =>
                        setPanelFilters((prev) => ({ ...prev, positionSearch: e.target.value }))
                      }
                      className={`w-full rounded-xl border border-[#E5DCCE] bg-[#F7F3EC] px-3 py-2.5 text-sm text-[#2C241B] outline-none transition focus:border-[#C4A574] focus:ring-2 focus:ring-[#C4A574]/30 ${focusRing}`}
                    />
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-[#78716C]">
                        YOE
                      </span>
                      <input
                        value={panelFilters.yoeSearch}
                        onChange={(e) =>
                          setPanelFilters((prev) => ({ ...prev, yoeSearch: e.target.value }))
                        }
                        className={`w-full rounded-xl border border-[#E5DCCE] bg-[#F7F3EC] px-3 py-2.5 text-sm text-[#2C241B] outline-none transition focus:border-[#C4A574] focus:ring-2 focus:ring-[#C4A574]/30 ${focusRing}`}
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-[#78716C]">
                        Outcome
                      </span>
                      <select
                        value={panelFilters.verdictFilter}
                        onChange={(e) =>
                          setPanelFilters((prev) => ({ ...prev, verdictFilter: e.target.value }))
                        }
                        className={`w-full rounded-xl border border-[#E5DCCE] bg-[#F7F3EC] px-3 py-2.5 text-sm text-[#2C241B] outline-none transition focus:border-[#C4A574] focus:ring-2 focus:ring-[#C4A574]/30 ${focusRing}`}
                      >
                        <option value="">All</option>
                        <option value="selected">Selected</option>
                        <option value="rejected">Not selected</option>
                      </select>
                    </label>
                  </div>
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-[#78716C]">
                      Sort
                    </span>
                    <select
                      value={panelFilters.sortConfig}
                      onChange={(e) =>
                        setPanelFilters((prev) => ({ ...prev, sortConfig: e.target.value }))
                      }
                      className={`w-full rounded-xl border border-[#E5DCCE] bg-[#F7F3EC] px-3 py-2.5 text-sm text-[#2C241B] outline-none transition focus:border-[#C4A574] focus:ring-2 focus:ring-[#C4A574]/30 ${focusRing}`}
                    >
                      <option value="rating-desc">Rating: High to low</option>
                      <option value="rating-asc">Rating: Low to high</option>
                      <option value="likes-desc">Likes: High to low</option>
                      <option value="likes-asc">Likes: Low to high</option>
                      <option value="dislikes-asc">Dislikes: Low to high</option>
                      <option value="dislikes-desc">Dislikes: High to low</option>
                    </select>
                  </label>
                  </div>
                  </div>
                  <div className="border-t border-[#E5DCCE] bg-[#FFFDF8] px-5 py-4 sm:px-6">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const cleared = {
                          companySearch: '',
                          positionSearch: '',
                          yoeSearch: '',
                          verdictFilter: '',
                          sortConfig: 'rating-desc',
                        };
                        setPanelFilters(cleared);
                        handleClearFilters(cleared);
                      }}
                      className={`flex-1 rounded-xl border border-[#E5DCCE] bg-[#FFFDF8] px-4 py-2.5 text-sm font-medium text-[#6B5A48] transition hover:bg-[#F7F3EC] ${focusRing}`}
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleSaveAndApplyFilters(panelFilters);
                        closePanel();
                      }}
                      className={`flex-1 rounded-xl border border-[#2C241B] bg-[#2C241B] px-4 py-2.5 text-sm font-medium text-[#FFFDF8] transition hover:bg-[#1A1510] ${focusRing}`}
                    >
                      Apply
                    </button>
                  </div>
                  </div>
                  </>
              ) : (
                <>
                <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
                <form id="share-exp-form" className="space-y-4" onSubmit={handleShareSubmit}>
                  {shareError && (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                      {shareError}
                    </div>
                  )}
                  {shareSuccess && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                      {shareSuccess}
                    </div>
                  )}

                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#78716C]">Personal</p>
                    <div className="h-px bg-[#E5DCCE]" />
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <input
                      value={shareForm.fullName}
                      onChange={(e) => handleShareChange('fullName', e.target.value)}
                      placeholder="Full name (optional)"
                      className={`rounded-xl border border-[#E5DCCE] bg-[#F7F3EC] px-3 py-2.5 text-sm text-[#2C241B] outline-none transition focus:border-[#C4A574] focus:ring-2 focus:ring-[#C4A574]/30 ${focusRing}`}
                    />
                    <input
                      value={shareForm.linkedin}
                      onChange={(e) => handleShareChange('linkedin', e.target.value)}
                      placeholder="LinkedIn URL (optional)"
                      className={`rounded-xl border border-[#E5DCCE] bg-[#F7F3EC] px-3 py-2.5 text-sm text-[#2C241B] outline-none transition focus:border-[#C4A574] focus:ring-2 focus:ring-[#C4A574]/30 ${focusRing}`}
                    />
                  </div>

                  <div className="space-y-3 pt-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#78716C]">Role</p>
                    <div className="h-px bg-[#E5DCCE]" />
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <input
                      required
                      value={shareForm.company}
                      onChange={(e) => handleShareChange('company', e.target.value)}
                      placeholder="Company*"
                      className={`rounded-xl border border-[#E5DCCE] bg-[#F7F3EC] px-3 py-2.5 text-sm text-[#2C241B] outline-none transition focus:border-[#C4A574] focus:ring-2 focus:ring-[#C4A574]/30 ${focusRing}`}
                    />
                    <input
                      required
                      value={shareForm.position}
                      onChange={(e) => handleShareChange('position', e.target.value)}
                      placeholder="Position*"
                      className={`rounded-xl border border-[#E5DCCE] bg-[#F7F3EC] px-3 py-2.5 text-sm text-[#2C241B] outline-none transition focus:border-[#C4A574] focus:ring-2 focus:ring-[#C4A574]/30 ${focusRing}`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      min="0"
                      value={shareForm.yoe}
                      onChange={(e) => handleShareChange('yoe', e.target.value)}
                      placeholder="YOE"
                      className={`rounded-xl border border-[#E5DCCE] bg-[#F7F3EC] px-3 py-2.5 text-sm text-[#2C241B] outline-none transition focus:border-[#C4A574] focus:ring-2 focus:ring-[#C4A574]/30 ${focusRing}`}
                    />
                    <select
                      value={shareForm.verdict}
                      onChange={(e) => handleShareChange('verdict', e.target.value)}
                      className={`rounded-xl border border-[#E5DCCE] bg-[#F7F3EC] px-3 py-2.5 text-sm text-[#2C241B] outline-none transition focus:border-[#C4A574] focus:ring-2 focus:ring-[#C4A574]/30 ${focusRing}`}
                    >
                      <option value="">Outcome</option>
                      <option value="selected">Selected</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  <div className="space-y-3 pt-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#78716C]">Experience</p>
                    <div className="h-px bg-[#E5DCCE]" />
                  </div>
                  <div>
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-[#78716C]">
                      Difficulty rating*
                    </p>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => handleShareChange('rating', r)}
                          className={`rounded-full p-1 ${focusRing} ${r <= shareForm.rating ? 'text-[#C4A574]' : 'text-[#D8CDBB]'}`}
                          aria-label={`Rate ${r}`}
                        >
                          <Star className="h-6 w-6" fill={r <= shareForm.rating ? 'currentColor' : 'none'} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <textarea
                    required
                    rows={6}
                    value={shareForm.experience}
                    onChange={(e) => handleShareChange('experience', e.target.value)}
                    placeholder="Share your interview process, questions, and tips...*"
                    className={`w-full resize-none rounded-xl border border-[#E5DCCE] bg-[#F7F3EC] px-3 py-2.5 text-sm text-[#2C241B] outline-none transition focus:border-[#C4A574] focus:ring-2 focus:ring-[#C4A574]/30 ${focusRing}`}
                  />
                </form>
                </div>
                <div className="border-t border-[#E5DCCE] bg-[#FFFDF8] px-5 py-4 sm:px-6">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={closePanel}
                      className={`flex-1 rounded-xl border border-[#E5DCCE] bg-[#FFFDF8] px-4 py-2.5 text-sm font-medium text-[#6B5A48] transition hover:bg-[#F7F3EC] ${focusRing}`}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      form="share-exp-form"
                      disabled={isSubmittingShare}
                      className={`flex-1 rounded-xl border border-[#2C241B] bg-[#2C241B] px-4 py-2.5 text-sm font-semibold text-[#FFFDF8] transition hover:bg-[#1A1510] disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`}
                    >
                      {isSubmittingShare ? 'Submitting...' : 'Share experience'}
                    </button>
                  </div>
                </div>
                </>
              )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
