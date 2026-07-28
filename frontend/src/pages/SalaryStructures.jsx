import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  X,
  Search,
  SlidersHorizontal,
  Plus,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  MapPin,
  Briefcase,
  GraduationCap,
  Linkedin,
  ChevronRight,
  Layers,
  IndianRupee,
} from 'lucide-react';
import SalaryCommentSection from '../components/SalaryCommentSection';
import RelatedLinks from '../components/RelatedLinks';
import slugify from '../utils/slugify';
import { focusRing } from '../theme/tokens';

const emptyShareForm = () => ({
  education: '',
  yearsOfExperience: '',
  priorExperience: '',
  company: '',
  position: '',
  location: '',
  salary: '',
  relocationSigningBonus: '',
  stockBonus: '',
  bonus: '',
  ctc: '',
  benefits: '',
  otherDetails: '',
  linkedin: '',
});

const emptyFilters = () => ({
  companySearch: '',
  positionSearch: '',
  locationSearch: '',
  experienceFilter: '',
  sortConfig: 'ctc-desc',
});

const parseNum = (value) => {
  const n = parseFloat(String(value ?? '').replace(/[^\d.]/g, ''));
  return Number.isFinite(n) ? n : 0;
};

const formatLpa = (value) => {
  const n = parseNum(value);
  if (!n) return value || '—';
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
};

export default function SalaryStructures() {
  const [sidePanel, setSidePanel] = useState({ open: false, type: 'filters' });
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [salaries, setSalaries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSalary, setSelectedSalary] = useState(null);
  const [filters, setFilters] = useState(emptyFilters());
  const [panelFilters, setPanelFilters] = useState(emptyFilters());
  const [shareForm, setShareForm] = useState(emptyShareForm());
  const [shareError, setShareError] = useState('');
  const [shareSuccess, setShareSuccess] = useState('');
  const [isSubmittingShare, setIsSubmittingShare] = useState(false);

  const { currentUser } = useSelector((state) => state.user);
  const reduceMotion = useReducedMotion();
  const navigate = useNavigate();
  const { salaryId, slug } = useParams();

  const openPanel = (type) => {
    if (type === 'filters') setPanelFilters(filters);
    if (type === 'share') {
      setShareError('');
      setShareSuccess('');
    }
    setSidePanel({ open: true, type });
  };

  const closePanel = () => setSidePanel((prev) => ({ ...prev, open: false }));

  const handleShareChange = (field, value) => {
    setShareForm((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    fetchSalaries();
  }, []);

  useEffect(() => {
    const isOverlayOpen = isLedgerOpen || sidePanel.open;
    if (!isOverlayOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isLedgerOpen, sidePanel.open]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setIsLedgerOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const fetchSalaries = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/backend/salary/getSalary');
      if (!response.ok) throw new Error('Failed to fetch salaries');
      const data = await response.json();
      setSalaries(data);
    } catch (error) {
      console.error('Error fetching salaries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSalaries = useMemo(() => {
    return salaries
      .filter((salary) => {
        const company = (salary.company || '').toLowerCase();
        const position = (salary.position || '').toLowerCase();
        const location = (salary.location || '').toLowerCase();
        const term = searchTerm.toLowerCase();

        const companyMatch = company.includes(filters.companySearch.toLowerCase());
        const positionMatch = position.includes(filters.positionSearch.toLowerCase());
        const locationMatch = location.includes(filters.locationSearch.toLowerCase());
        const experienceMatch =
          !filters.experienceFilter ||
          String(salary.yearsOfExperience) === String(filters.experienceFilter);
        const searchMatch =
          !term ||
          company.includes(term) ||
          position.includes(term) ||
          location.includes(term);

        return companyMatch && positionMatch && locationMatch && experienceMatch && searchMatch;
      })
      .sort((a, b) => {
        const [field, order] = filters.sortConfig.split('-');
        const sortValue = order === 'asc' ? 1 : -1;
        if (field === 'ctc') return (parseNum(a.ctc) - parseNum(b.ctc)) * sortValue;
        if (field === 'likes') return ((a.numberOfLikes || 0) - (b.numberOfLikes || 0)) * sortValue;
        if (field === 'dislikes')
          return ((a.numberOfDislikes || 0) - (b.numberOfDislikes || 0)) * sortValue;
        return 0;
      });
  }, [salaries, filters, searchTerm]);

  const marketPulse = useMemo(() => {
    if (filteredSalaries.length === 0) {
      return { count: 0, median: null, min: null, max: null };
    }
    const values = filteredSalaries.map((s) => parseNum(s.ctc)).filter((n) => n > 0).sort((a, b) => a - b);
    if (values.length === 0) return { count: filteredSalaries.length, median: null, min: null, max: null };
    const mid = Math.floor(values.length / 2);
    const median =
      values.length % 2 === 0 ? (values[mid - 1] + values[mid]) / 2 : values[mid];
    return {
      count: filteredSalaries.length,
      median,
      min: values[0],
      max: values[values.length - 1],
    };
  }, [filteredSalaries]);

  const handleSalarySelect = useCallback(
    (salary, { replace = false } = {}) => {
      setSelectedSalary(salary);
      const nextSlug = slugify(`${salary.company || 'company'}-${salary.position || 'role'}`);
      navigate(`/salaryStructures/${nextSlug}/${salary._id}`, { replace });
      setIsLedgerOpen(false);
    },
    [navigate]
  );

  useEffect(() => {
    if (!salaries.length) return;
    if (salaryId) {
      const found = salaries.find((s) => s._id === salaryId);
      if (found) {
        setSelectedSalary(found);
        return;
      }
    }
    if (filteredSalaries.length > 0) {
      const stillSelected =
        selectedSalary && filteredSalaries.some((s) => s._id === selectedSalary._id);
      if (!stillSelected) {
        handleSalarySelect(filteredSalaries[0], { replace: true });
      }
    } else if (selectedSalary) {
      setSelectedSalary(null);
    }
    // intentionally omit selectedSalary to avoid loops when filters change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salaryId, salaries, filteredSalaries, handleSalarySelect]);

  const compensationParts = useMemo(() => {
    if (!selectedSalary) return [];
    const parts = [
      { key: 'base', label: 'Base', value: parseNum(selectedSalary.salary), raw: selectedSalary.salary },
      { key: 'bonus', label: 'Bonus', value: parseNum(selectedSalary.bonus), raw: selectedSalary.bonus },
      { key: 'stock', label: 'Stock', value: parseNum(selectedSalary.stockBonus), raw: selectedSalary.stockBonus },
    ].filter((p) => p.value > 0 || (p.raw && p.raw !== 'N/A'));
    const total = parts.reduce((sum, p) => sum + (p.value || 0), 0) || parseNum(selectedSalary.ctc) || 1;
    return parts.map((p) => ({
      ...p,
      pct: Math.max(4, Math.round(((p.value || 0) / total) * 100)),
    }));
  }, [selectedSalary]);

  const handleLike = async () => {
    if (!selectedSalary || !currentUser) return;
    try {
      const response = await fetch(`/backend/salary/likeSalary/${selectedSalary._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!response.ok) return;
      const data = await response.json();
      const patch = {
        numberOfLikes: data.likes,
        numberOfDislikes: data.dislikes,
        likes: selectedSalary.likes?.includes(currentUser._id)
          ? selectedSalary.likes
          : [...(selectedSalary.likes || []), currentUser._id],
        dislikes: (selectedSalary.dislikes || []).filter((id) => id !== currentUser._id),
      };
      setSelectedSalary((prev) => (prev ? { ...prev, ...patch } : prev));
      setSalaries((prev) => prev.map((s) => (s._id === selectedSalary._id ? { ...s, ...patch } : s)));
    } catch {
      // noop
    }
  };

  const handleDislike = async () => {
    if (!selectedSalary || !currentUser) return;
    try {
      const response = await fetch(`/backend/salary/dislikeSalary/${selectedSalary._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!response.ok) return;
      const data = await response.json();
      const patch = {
        numberOfLikes: data.likes,
        numberOfDislikes: data.dislikes,
        dislikes: selectedSalary.dislikes?.includes(currentUser._id)
          ? selectedSalary.dislikes
          : [...(selectedSalary.dislikes || []), currentUser._id],
        likes: (selectedSalary.likes || []).filter((id) => id !== currentUser._id),
      };
      setSelectedSalary((prev) => (prev ? { ...prev, ...patch } : prev));
      setSalaries((prev) => prev.map((s) => (s._id === selectedSalary._id ? { ...s, ...patch } : s)));
    } catch {
      // noop
    }
  };

  const handleShareSubmit = async (e) => {
    e.preventDefault();
    setShareError('');
    setShareSuccess('');

    if (!currentUser?._id) {
      setShareError('Please sign in to share a salary structure.');
      return;
    }

    const required = [
      'education',
      'yearsOfExperience',
      'priorExperience',
      'company',
      'position',
      'location',
      'salary',
      'benefits',
      'ctc',
    ];
    if (required.some((field) => !shareForm[field])) {
      setShareError('Please fill in all required fields.');
      return;
    }

    try {
      setIsSubmittingShare(true);
      const response = await fetch('/backend/salary/createSalary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...shareForm, userRef: currentUser._id }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Something went wrong');
      }
      setShareSuccess('Salary shared successfully.');
      setShareForm(emptyShareForm());
      await fetchSalaries();
      setTimeout(() => closePanel(), 600);
    } catch (error) {
      setShareError(error.message);
    } finally {
      setIsSubmittingShare(false);
    }
  };

  const isLiked = selectedSalary?.likes?.includes(currentUser?._id);
  const isDisliked = selectedSalary?.dislikes?.includes(currentUser?._id);

  const canonicalUrl =
    selectedSalary && salaryId
      ? slug
        ? `https://route2hire.com/salaryStructures/${slug}/${salaryId}`
        : `https://route2hire.com/salaryStructures/${salaryId}`
      : 'https://route2hire.com/salary-structures';

  const inputClass = `w-full rounded-xl border border-[#E5DCCE] bg-[#F7F3EC] px-3 py-2.5 text-sm text-[#2C241B] outline-none transition focus:border-[#C4A574] focus:ring-2 focus:ring-[#C4A574]/30 ${focusRing}`;

  const ledgerContent = (variant = 'desktop') => (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 border-b border-[#E5DCCE] bg-[#F7F3EC] px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#6B5A48]">Ledger</p>
            <h2 className="font-display mt-0.5 text-lg font-semibold text-[#1C1917]">Browse offers</h2>
            <p className="mt-0.5 text-[11px] text-[#78716C]">
              {filteredSalaries.length} of {salaries.length} shown
            </p>
          </div>
          {variant === 'mobile' && (
            <button
              type="button"
              onClick={() => setIsLedgerOpen(false)}
              aria-label="Close salary ledger"
              className={`shrink-0 rounded-lg border border-[#E5DCCE] bg-[#FFFDF8] p-2 text-[#6B5A48] transition hover:bg-[#EFE8DC] ${focusRing}`}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <label className="relative mt-3 block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#78716C]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search company, role, city…"
            aria-label="Search salary structures"
            className={`w-full rounded-xl border border-[#E5DCCE] bg-[#FFFDF8] py-2 pl-8 pr-3 text-sm text-[#2C241B] outline-none transition placeholder:text-[#78716C] focus:border-[#C4A574] focus:ring-2 focus:ring-[#C4A574]/30 ${focusRing}`}
          />
        </label>

        <div className="mt-2.5 flex gap-2">
          <button
            type="button"
            onClick={() => openPanel('filters')}
            className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#E5DCCE] bg-[#FFFDF8] px-3 py-2 text-xs font-medium text-[#6B5A48] transition hover:bg-[#EFE8DC] ${focusRing}`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden />
            Filters
          </button>
          <button
            type="button"
            onClick={() => openPanel('share')}
            className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#2C241B] bg-[#2C241B] px-3 py-2 text-xs font-medium text-[#FFFDF8] transition hover:bg-[#1A1510] ${focusRing}`}
          >
            <Plus className="h-3.5 w-3.5" aria-hidden />
            Share
          </button>
        </div>
      </div>

      <div className="r2h-scroll-thin min-h-0 flex-1 overflow-y-auto overscroll-contain p-2">
        {filteredSalaries.length === 0 ? (
          <p className="px-2 py-10 text-center text-sm text-[#78716C]">No offers match your search.</p>
        ) : (
          <ul className="space-y-1">
            {filteredSalaries.map((salary) => {
              const isActive = selectedSalary?._id === salary._id;
              return (
                <li key={salary._id}>
                  <button
                    type="button"
                    onClick={() => handleSalarySelect(salary)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${focusRing} ${
                      isActive ? 'bg-[#2C241B] text-[#FFFDF8]' : 'text-[#2C241B] hover:bg-[#F7F3EC]'
                    }`}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-medium">{salary.company}</span>
                      <span
                        className={`mt-0.5 block truncate text-[11px] ${
                          isActive ? 'text-[#EFE8DC]' : 'text-[#78716C]'
                        }`}
                      >
                        {salary.position}
                        {salary.location ? ` · ${salary.location}` : ''}
                      </span>
                    </span>
                    <span
                      className={`shrink-0 text-right ${
                        isActive ? 'text-[#C4A574]' : 'text-[#6B5A48]'
                      }`}
                    >
                      <span className="font-display block text-base font-semibold leading-none tabular-nums">
                        {formatLpa(salary.ctc)}
                      </span>
                      <span
                        className={`mt-0.5 block text-[10px] uppercase tracking-[0.12em] ${
                          isActive ? 'text-[#EFE8DC]/70' : 'text-[#78716C]'
                        }`}
                      >
                        LPA
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F3EC] px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-[#E5DCCE] border-t-[#C4A574]" />
          <p className="text-sm font-medium text-[#6B5A48]">Loading salary insights…</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>
          {selectedSalary
            ? `${selectedSalary.position} at ${selectedSalary.company} Salary (${formatLpa(selectedSalary.ctc)} LPA) | Route2Hire`
            : 'Salary Structures | QA, SDET & Test Automation Salaries - Route2Hire'}
        </title>
        <meta
          name="description"
          content={
            selectedSalary
              ? `${selectedSalary.position} salary at ${selectedSalary.company}: ${formatLpa(selectedSalary.ctc)} LPA CTC${selectedSalary.location ? ` in ${selectedSalary.location}` : ''}. Compare base, bonus, stock and benefits for QA/SDET roles on Route2Hire.`
              : 'Explore salary structures for QA, SDET, Test Automation, and Software Testing roles. Compare CTC packages, negotiate with confidence, and share anonymous compensation data on Route2Hire.'
          }
        />
        <meta
          name="keywords"
          content={
            selectedSalary
              ? `${selectedSalary.company} salary, ${selectedSalary.position} salary, QA salary, SDET CTC, Test Automation compensation, ${selectedSalary.location || 'India'} QA salary`
              : 'QA salary, SDET salary, Test Automation salary, Software Testing salary, QA compensation, Salary insights, QA salary comparison, Test engineer salary'
          }
        />
        <meta
          property="og:title"
          content={
            selectedSalary
              ? `${selectedSalary.company} · ${selectedSalary.position} · ${formatLpa(selectedSalary.ctc)} LPA | Route2Hire`
              : 'Salary Structures | QA, SDET & Test Automation Salaries - Route2Hire'
          }
        />
        <meta
          property="og:description"
          content={
            selectedSalary
              ? `Compensation breakdown for ${selectedSalary.position} at ${selectedSalary.company}. Base, bonus, stock and benefits shared by the community.`
              : 'Compare salary structures for QA, SDET, and Test Automation roles. Get salary insights and compensation data for software testing professionals.'
          }
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content="https://route2hire.com/assets/Route2Hire.png" />
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>

      <div className="relative min-h-screen bg-[#F7F3EC] pb-16 pt-28 sm:pb-20 sm:pt-32">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(ellipse_at_20%_0%,_rgba(196,165,116,0.14),_transparent_55%),radial-gradient(ellipse_at_90%_10%,_rgba(44,36,27,0.05),_transparent_45%)]"
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <motion.header
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="max-w-3xl border-b border-[#E5DCCE] pb-8"
          >
            <h1 className="font-display text-[clamp(2rem,4.4vw,3.4rem)] font-semibold leading-tight tracking-tight text-[#1C1917]">
              QA &amp; SDET compensation, shared openly
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#57534E] sm:text-base">
              Browse real CTC packages across companies and roles. Compare base, bonus and stock,
              then share your own offer to keep pay transparent for the next QA or SDET candidate.
            </p>
          </motion.header>

          {/* Market pulse — unique to salary page */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4"
          >
            {[
              { label: 'Offers shown', value: marketPulse.count, suffix: '' },
              {
                label: 'Median CTC',
                value: marketPulse.median != null ? formatLpa(marketPulse.median) : '—',
                suffix: marketPulse.median != null ? ' LPA' : '',
              },
              {
                label: 'Lowest',
                value: marketPulse.min != null ? formatLpa(marketPulse.min) : '—',
                suffix: marketPulse.min != null ? ' LPA' : '',
              },
              {
                label: 'Highest',
                value: marketPulse.max != null ? formatLpa(marketPulse.max) : '—',
                suffix: marketPulse.max != null ? ' LPA' : '',
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-[#E5DCCE] bg-[#FFFDF8]/80 px-4 py-3.5 backdrop-blur-sm"
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#78716C]">
                  {stat.label}
                </p>
                <p className="font-display mt-1.5 text-2xl font-semibold tabular-nums text-[#1C1917]">
                  {stat.value}
                  <span className="text-sm font-normal text-[#6B5A48]">{stat.suffix}</span>
                </p>
              </div>
            ))}
          </motion.div>

          {/* Mobile ledger trigger */}
          <div className="mt-6 lg:hidden">
            <button
              type="button"
              onClick={() => setIsLedgerOpen(true)}
              className={`flex w-full items-center justify-between gap-3 rounded-2xl border border-[#E5DCCE] bg-[#FFFDF8] px-4 py-3.5 text-left shadow-[0_2px_12px_-6px_rgba(44,36,27,0.1)] transition hover:bg-[#F7F3EC] ${focusRing}`}
            >
              <span className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#E5DCCE] bg-[#F7F3EC] text-[#C4A574]">
                  <Layers className="h-4 w-4" aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-[#2C241B]">Browse offers</span>
                  <span className="block truncate text-xs text-[#78716C]">
                    {selectedSalary
                      ? `${selectedSalary.company} · ${formatLpa(selectedSalary.ctc)} LPA`
                      : `${filteredSalaries.length} offers available`}
                  </span>
                </span>
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-[#78716C]" aria-hidden />
            </button>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start">
            <aside className="hidden lg:sticky lg:top-28 lg:flex lg:h-[min(max(640px,calc(100vh-6rem)),960px)] lg:w-full lg:flex-col lg:overflow-hidden lg:rounded-2xl lg:border lg:border-[#E5DCCE] lg:bg-[#FFFDF8] lg:shadow-[0_2px_16px_-8px_rgba(44,36,27,0.1)]">
              {ledgerContent('desktop')}
            </aside>

            <section className="min-w-0">
              {filteredSalaries.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#E5DCCE] bg-[#FFFDF8] px-6 py-16 text-center">
                  <IndianRupee className="mx-auto h-8 w-8 text-[#C4A574]" aria-hidden />
                  <p className="font-display mt-4 text-2xl text-[#1C1917]">No salary data yet</p>
                  <p className="mx-auto mt-2 max-w-md text-sm text-[#78716C]">
                    Be the first to share a package, or loosen your filters to see more offers.
                  </p>
                  <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const cleared = emptyFilters();
                        setFilters(cleared);
                        setSearchTerm('');
                      }}
                      className={`rounded-xl border border-[#E5DCCE] bg-[#FFFDF8] px-4 py-2.5 text-sm font-medium text-[#6B5A48] transition hover:bg-[#F7F3EC] ${focusRing}`}
                    >
                      Clear filters
                    </button>
                    <button
                      type="button"
                      onClick={() => openPanel('share')}
                      className={`rounded-xl border border-[#2C241B] bg-[#2C241B] px-4 py-2.5 text-sm font-medium text-[#FFFDF8] transition hover:bg-[#1A1510] ${focusRing}`}
                    >
                      Share your CTC
                    </button>
                  </div>
                </div>
              ) : selectedSalary ? (
                <motion.article
                  key={selectedSalary._id}
                  initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="overflow-hidden rounded-2xl border border-[#E5DCCE] bg-[#FFFDF8] shadow-[0_2px_16px_-8px_rgba(44,36,27,0.1)]"
                >
                  {/* Offer letter header */}
                  <header className="relative border-b border-[#E5DCCE] bg-[#F7F3EC] px-5 py-6 sm:px-8 sm:py-8">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6B5A48]">
                          {selectedSalary.position}
                        </p>
                        <h2 className="font-display mt-2 text-[clamp(1.6rem,3.4vw,2.6rem)] font-semibold leading-tight tracking-tight text-[#1C1917]">
                          {selectedSalary.company}
                        </h2>
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[#6B5A48]">
                          {selectedSalary.location && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-[#E5DCCE] bg-[#FFFDF8] px-2.5 py-1">
                              <MapPin className="h-3 w-3" aria-hidden />
                              {selectedSalary.location}
                            </span>
                          )}
                          {selectedSalary.yearsOfExperience != null &&
                            selectedSalary.yearsOfExperience !== '' && (
                              <span className="inline-flex items-center gap-1 rounded-full border border-[#E5DCCE] bg-[#FFFDF8] px-2.5 py-1">
                                <Briefcase className="h-3 w-3" aria-hidden />
                                {selectedSalary.yearsOfExperience} YOE
                              </span>
                            )}
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#78716C]">
                          Total CTC
                        </p>
                        <p className="font-display mt-1 text-[clamp(2.2rem,5vw,3.4rem)] font-semibold leading-none tabular-nums text-[#1C1917]">
                          {formatLpa(selectedSalary.ctc)}
                          <span className="ml-1 text-base font-normal text-[#6B5A48]">LPA</span>
                        </p>
                        <div className="mt-3 flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={handleLike}
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition ${focusRing} ${
                              isLiked
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                : 'border-[#E5DCCE] bg-[#FFFDF8] text-[#6B5A48] hover:bg-[#EFE8DC]'
                            }`}
                          >
                            <ThumbsUp className={`h-3.5 w-3.5 ${isLiked ? 'fill-current' : ''}`} />
                            {selectedSalary.numberOfLikes || 0}
                          </button>
                          <button
                            type="button"
                            onClick={handleDislike}
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition ${focusRing} ${
                              isDisliked
                                ? 'border-rose-200 bg-rose-50 text-rose-700'
                                : 'border-[#E5DCCE] bg-[#FFFDF8] text-[#6B5A48] hover:bg-[#EFE8DC]'
                            }`}
                          >
                            <ThumbsDown className={`h-3.5 w-3.5 ${isDisliked ? 'fill-current' : ''}`} />
                            {selectedSalary.numberOfDislikes || 0}
                          </button>
                        </div>
                      </div>
                    </div>
                  </header>

                  <div className="px-5 py-6 sm:px-8 sm:py-8">
                    {/* Composition bar */}
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#78716C]">
                        Package composition
                      </p>
                      {compensationParts.length > 0 ? (
                        <>
                          <div className="mt-3 flex h-3 overflow-hidden rounded-full bg-[#EFE8DC]">
                            {compensationParts.map((part, i) => (
                              <div
                                key={part.key}
                                style={{ width: `${part.pct}%` }}
                                className={`h-full ${
                                  i === 0
                                    ? 'bg-[#2C241B]'
                                    : i === 1
                                      ? 'bg-[#C4A574]'
                                      : 'bg-[#6B5A48]'
                                }`}
                                title={`${part.label}: ${part.raw}`}
                              />
                            ))}
                          </div>
                          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                            {compensationParts.map((part, i) => (
                              <div key={part.key} className="border-l-2 border-[#E5DCCE] pl-3">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`h-2 w-2 rounded-full ${
                                      i === 0
                                        ? 'bg-[#2C241B]'
                                        : i === 1
                                          ? 'bg-[#C4A574]'
                                          : 'bg-[#6B5A48]'
                                    }`}
                                  />
                                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#78716C]">
                                    {part.label}
                                  </p>
                                </div>
                                <p className="font-display mt-1 text-xl font-semibold tabular-nums text-[#1C1917]">
                                  {part.raw || '—'}
                                </p>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <p className="mt-3 text-sm text-[#78716C]">Breakdown not shared for this offer.</p>
                      )}

                      {(selectedSalary.relocationSigningBonus || selectedSalary.bonus || selectedSalary.stockBonus) && (
                        <div className="mt-4 flex flex-wrap gap-2 text-xs text-[#6B5A48]">
                          {selectedSalary.relocationSigningBonus && (
                            <span className="rounded-full border border-[#E5DCCE] bg-[#F7F3EC] px-2.5 py-1">
                              Signing / relocation: {selectedSalary.relocationSigningBonus}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Profile strip */}
                    <div className="mt-8 grid grid-cols-1 gap-4 border-t border-[#E5DCCE] pt-7 sm:grid-cols-2">
                      {[
                        {
                          icon: GraduationCap,
                          label: 'Education',
                          value: selectedSalary.education,
                        },
                        {
                          icon: Briefcase,
                          label: 'Years of experience',
                          value: selectedSalary.yearsOfExperience,
                        },
                        {
                          icon: Layers,
                          label: 'Prior experience',
                          value: selectedSalary.priorExperience,
                        },
                        {
                          icon: MapPin,
                          label: 'Location',
                          value: selectedSalary.location,
                        },
                      ].map((item) => (
                        <div key={item.label} className="flex gap-3">
                          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#E5DCCE] bg-[#F7F3EC] text-[#C4A574]">
                            <item.icon className="h-3.5 w-3.5" aria-hidden />
                          </span>
                          <div className="min-w-0">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#78716C]">
                              {item.label}
                            </p>
                            <p className="mt-0.5 text-sm font-medium text-[#2C241B]">
                              {item.value || 'Not shared'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Notes */}
                    <div className="mt-8 grid grid-cols-1 gap-6 border-t border-[#E5DCCE] pt-7 md:grid-cols-2">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#78716C]">
                          Benefits
                        </p>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[#2C241B]">
                          {selectedSalary.benefits || 'Not shared'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#78716C]">
                          Other details
                        </p>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[#2C241B]">
                          {selectedSalary.otherDetails || 'Not shared'}
                        </p>
                      </div>
                    </div>

                    {selectedSalary.linkedin && selectedSalary.linkedin !== 'Not Provided' && (
                      <a
                        href={
                          selectedSalary.linkedin.startsWith('http')
                            ? selectedSalary.linkedin
                            : `https://${selectedSalary.linkedin}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        className={`mt-6 inline-flex items-center gap-2 text-sm font-medium text-[#6B5A48] underline-offset-4 transition hover:text-[#2C241B] hover:underline ${focusRing}`}
                      >
                        <Linkedin className="h-4 w-4" aria-hidden />
                        View contributor on LinkedIn
                      </a>
                    )}
                  </div>

                  <div className="border-t border-[#E5DCCE] px-5 py-7 sm:px-8 sm:py-8">
                    <h3 className="font-display flex items-center gap-2 text-xl font-semibold text-[#1C1917]">
                      <MessageCircle className="h-5 w-5 text-[#C4A574]" aria-hidden />
                      Discussion
                    </h3>
                    <p className="mt-1 text-sm text-[#78716C]">
                      Ask about negotiation, bands, or similar offers you have seen.
                    </p>
                    <div className="mt-5">
                      <SalaryCommentSection salId={selectedSalary._id} />
                    </div>
                  </div>
                </motion.article>
              ) : (
                <div className="rounded-2xl border border-dashed border-[#E5DCCE] bg-[#FFFDF8] px-6 py-16 text-center">
                  <p className="font-display text-2xl text-[#1C1917]">Select an offer</p>
                  <p className="mt-2 text-sm text-[#78716C]">
                    Choose a salary from the ledger to open its compensation breakdown.
                  </p>
                </div>
              )}
            </section>
          </div>

          <div className="mt-14">
            <RelatedLinks type="salary" />
          </div>
        </div>
      </div>

      {/* Mobile ledger bottom sheet */}
      <AnimatePresence>
        {isLedgerOpen && (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLedgerOpen(false)}
              className="fixed inset-0 z-[2147483646] bg-[#2C241B]/40 lg:hidden"
              aria-label="Close salary ledger backdrop"
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
              {ledgerContent('mobile')}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Filters / Share sliding panel */}
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
                <div className="border-b border-[#E5DCCE] px-5 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-3xl text-[#1C1917]">
                      {sidePanel.type === 'filters' ? 'Filters' : 'Share salary'}
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
                      ? 'Refine by company, role, location, and experience.'
                      : 'Share anonymously-friendly compensation data to help others negotiate.'}
                  </p>
                </div>

                {sidePanel.type === 'filters' ? (
                  <>
                    <div className="r2h-scroll-thin flex-1 overflow-y-auto px-5 py-5 sm:px-6">
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
                            className={inputClass}
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
                            className={inputClass}
                          />
                        </label>
                        <label className="block">
                          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-[#78716C]">
                            Location
                          </span>
                          <input
                            value={panelFilters.locationSearch}
                            onChange={(e) =>
                              setPanelFilters((prev) => ({ ...prev, locationSearch: e.target.value }))
                            }
                            className={inputClass}
                          />
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <label className="block">
                            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-[#78716C]">
                              YOE
                            </span>
                            <input
                              value={panelFilters.experienceFilter}
                              onChange={(e) =>
                                setPanelFilters((prev) => ({
                                  ...prev,
                                  experienceFilter: e.target.value,
                                }))
                              }
                              placeholder="e.g. 3"
                              className={inputClass}
                            />
                          </label>
                          <label className="block">
                            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-[#78716C]">
                              Sort
                            </span>
                            <select
                              value={panelFilters.sortConfig}
                              onChange={(e) =>
                                setPanelFilters((prev) => ({ ...prev, sortConfig: e.target.value }))
                              }
                              className={inputClass}
                            >
                              <option value="ctc-desc">CTC: High to low</option>
                              <option value="ctc-asc">CTC: Low to high</option>
                              <option value="likes-desc">Likes: High to low</option>
                              <option value="likes-asc">Likes: Low to high</option>
                              <option value="dislikes-asc">Dislikes: Low to high</option>
                              <option value="dislikes-desc">Dislikes: High to low</option>
                            </select>
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-[#E5DCCE] px-5 py-4 sm:px-6">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const cleared = emptyFilters();
                            setPanelFilters(cleared);
                            setFilters(cleared);
                          }}
                          className={`flex-1 rounded-xl border border-[#E5DCCE] bg-[#FFFDF8] px-4 py-2.5 text-sm font-medium text-[#6B5A48] transition hover:bg-[#F7F3EC] ${focusRing}`}
                        >
                          Clear
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFilters(panelFilters);
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
                    <div className="r2h-scroll-thin flex-1 overflow-y-auto px-5 py-5 sm:px-6">
                      <form id="salary-share-form" className="space-y-4" onSubmit={handleShareSubmit}>
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
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#78716C]">
                            Role
                          </p>
                          <div className="h-px bg-[#E5DCCE]" />
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <input
                            required
                            value={shareForm.company}
                            onChange={(e) => handleShareChange('company', e.target.value)}
                            placeholder="Company*"
                            className={inputClass}
                          />
                          <input
                            required
                            value={shareForm.position}
                            onChange={(e) => handleShareChange('position', e.target.value)}
                            placeholder="Position*"
                            className={inputClass}
                          />
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <input
                            required
                            value={shareForm.location}
                            onChange={(e) => handleShareChange('location', e.target.value)}
                            placeholder="Location*"
                            className={inputClass}
                          />
                          <input
                            required
                            value={shareForm.yearsOfExperience}
                            onChange={(e) => handleShareChange('yearsOfExperience', e.target.value)}
                            placeholder="Years of experience*"
                            className={inputClass}
                          />
                        </div>

                        <div className="space-y-3 pt-1">
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#78716C]">
                            Background
                          </p>
                          <div className="h-px bg-[#E5DCCE]" />
                        </div>
                        <input
                          required
                          value={shareForm.education}
                          onChange={(e) => handleShareChange('education', e.target.value)}
                          placeholder="Education*"
                          className={inputClass}
                        />
                        <input
                          required
                          value={shareForm.priorExperience}
                          onChange={(e) => handleShareChange('priorExperience', e.target.value)}
                          placeholder="Prior experience*"
                          className={inputClass}
                        />
                        <input
                          value={shareForm.linkedin}
                          onChange={(e) => handleShareChange('linkedin', e.target.value)}
                          placeholder="LinkedIn URL (optional)"
                          className={inputClass}
                        />

                        <div className="space-y-3 pt-1">
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#78716C]">
                            Compensation
                          </p>
                          <div className="h-px bg-[#E5DCCE]" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            required
                            value={shareForm.ctc}
                            onChange={(e) => handleShareChange('ctc', e.target.value)}
                            placeholder="CTC (LPA)*"
                            className={inputClass}
                          />
                          <input
                            required
                            value={shareForm.salary}
                            onChange={(e) => handleShareChange('salary', e.target.value)}
                            placeholder="Base salary*"
                            className={inputClass}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <input
                            value={shareForm.bonus}
                            onChange={(e) => handleShareChange('bonus', e.target.value)}
                            placeholder="Bonus"
                            className={inputClass}
                          />
                          <input
                            value={shareForm.stockBonus}
                            onChange={(e) => handleShareChange('stockBonus', e.target.value)}
                            placeholder="Stock / RSU"
                            className={inputClass}
                          />
                        </div>
                        <input
                          value={shareForm.relocationSigningBonus}
                          onChange={(e) => handleShareChange('relocationSigningBonus', e.target.value)}
                          placeholder="Signing / relocation bonus"
                          className={inputClass}
                        />

                        <div className="space-y-3 pt-1">
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#78716C]">
                            Details
                          </p>
                          <div className="h-px bg-[#E5DCCE]" />
                        </div>
                        <textarea
                          required
                          rows={3}
                          value={shareForm.benefits}
                          onChange={(e) => handleShareChange('benefits', e.target.value)}
                          placeholder="Benefits*"
                          className={`${inputClass} resize-none`}
                        />
                        <textarea
                          rows={3}
                          value={shareForm.otherDetails}
                          onChange={(e) => handleShareChange('otherDetails', e.target.value)}
                          placeholder="Other details (optional)"
                          className={`${inputClass} resize-none`}
                        />
                      </form>
                    </div>
                    <div className="border-t border-[#E5DCCE] px-5 py-4 sm:px-6">
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
                          form="salary-share-form"
                          disabled={isSubmittingShare}
                          className={`flex-1 rounded-xl border border-[#2C241B] bg-[#2C241B] px-4 py-2.5 text-sm font-semibold text-[#FFFDF8] transition hover:bg-[#1A1510] disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`}
                        >
                          {isSubmittingShare ? 'Submitting…' : 'Share salary'}
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
