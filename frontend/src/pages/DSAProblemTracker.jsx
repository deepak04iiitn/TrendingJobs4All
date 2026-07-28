import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  ChevronDown,
  ChevronRight,
  Check,
  Star,
  Pencil,
  Search,
  Filter,
  X,
  Grid3X3,
  BarChart3,
  CheckCircle,
  Target,
  Bookmark,
  NotebookPen,
  Trophy,
  Award,
  Users,
} from 'lucide-react';
import axios from '../utils/axios';
import toast from 'react-hot-toast';
import RelatedLinks from '../components/RelatedLinks';
import { focusRing } from '../theme/tokens';

const difficulties = ['Easy', 'Medium', 'Hard'];

const difficultyTone = {
  Easy: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  Medium: 'border-amber-200 bg-amber-50 text-amber-700',
  Hard: 'border-rose-200 bg-rose-50 text-rose-700',
};

const difficultyDot = {
  Easy: 'bg-emerald-500',
  Medium: 'bg-amber-500',
  Hard: 'bg-rose-500',
};

const rankTone = (rank) => {
  if (rank === 1) return 'bg-[#2C241B] text-[#FFFDF8]';
  if (rank === 2) return 'bg-[#6B5A48] text-[#FFFDF8]';
  if (rank === 3) return 'bg-[#C4A574] text-[#2C241B]';
  return 'bg-[#F7F3EC] text-[#6B5A48]';
};

const categoryOrder = [
  'Array',
  'String',
  'Math',
  'Hash Table',
  'Two Pointers',
  'Sorting',
  'Stack',
  'Queue',
  'Matrix',
  'Sliding Window',
  'Linked List',
  'Binary Search',
  'Bit Manipulation',
  'Greedy',
  'Recursion',
  'Divide and Conquer',
  'Heap',
  'Backtracking',
  'Tree',
  'Graph',
  'Dynamic Programming',
  'Design',
  'Trie',
];

const getSortedCategories = (problemsObj) => {
  const categories = Object.keys(problemsObj || {});
  return categories.sort((a, b) => {
    const indexA = categoryOrder.indexOf(a);
    const indexB = categoryOrder.indexOf(b);
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return a.localeCompare(b);
  });
};

export default function DSAProblemTracker() {
  const reduceMotion = useReducedMotion();
  const [problems, setProblems] = useState({});
  const [stats, setStats] = useState({ total: 0, completed: 0, favorites: 0, completionPercentage: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [expandedCategories, setExpandedCategories] = useState({});
  const [expandedDifficulties, setExpandedDifficulties] = useState({});
  const [notesModal, setNotesModal] = useState({ isOpen: false, problem: null, notes: '' });
  const [showNotesPanel, setShowNotesPanel] = useState(false);
  const [showLeaderboardPanel, setShowLeaderboardPanel] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [weeklyWinners, setWeeklyWinners] = useState([]);
  const [leaderboardPeriod, setLeaderboardPeriod] = useState('all');
  const [leaderboardTab, setLeaderboardTab] = useState('leaderboard');
  const [lbLimit, setLbLimit] = useState(10);
  const [lbSearch, setLbSearch] = useState('');

  const hydrateExpansion = (problemsObj, expandAll = false) => {
    const categories = getSortedCategories(problemsObj);
    if (categories.length === 0) return;

    const categoryState = {};
    const difficultyState = {};
    categories.forEach((cat, idx) => {
      categoryState[cat] = expandAll ? true : idx === 0;
      difficulties.forEach((d) => {
        difficultyState[`${cat}-${d}`] = expandAll ? true : idx === 0;
      });
    });
    setExpandedCategories(categoryState);
    setExpandedDifficulties(difficultyState);
  };

  const recalculateStats = (nextProblems) => {
    let completed = 0;
    let favorites = 0;
    let total = 0;
    Object.keys(nextProblems).forEach((category) => {
      difficulties.forEach((difficulty) => {
        (nextProblems[category][difficulty] || []).forEach((problem) => {
          total += 1;
          if (problem.isCompleted) completed += 1;
          if (problem.isFavorite) favorites += 1;
        });
      });
    });
    const completionPercentage = total === 0 ? 0 : Math.round((completed / total) * 100);
    setStats({ total, completed, favorites, completionPercentage });
  };

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/backend/dsa-problems');
      if (response.data?.success) {
        const incomingProblems = response.data.data?.problems || {};
        setProblems(incomingProblems);
        setStats(response.data.data?.stats || { total: 0, completed: 0, favorites: 0, completionPercentage: 0 });
        hydrateExpansion(incomingProblems);
      }
    } catch (error) {
      console.error('Error fetching problems:', error);
      toast.error('Failed to load problems');
    } finally {
      setLoading(false);
    }
  };

  const refetchLeaderboard = async () => {
    try {
      const [lbRes, winnersRes] = await Promise.all([
        axios.get(`/backend/dsa-problems/leaderboard?limit=${lbLimit}&period=${leaderboardPeriod}`),
        axios.get('/backend/dsa-problems/weekly-winners'),
      ]);
      if (lbRes.data?.success) setLeaderboard(lbRes.data.items || []);
      if (winnersRes.data?.success) setWeeklyWinners(winnersRes.data.items || []);
    } catch {
      // Non-blocking panel
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  useEffect(() => {
    if (!showLeaderboardPanel) return;
    refetchLeaderboard();

    let es;
    try {
      es = new EventSource(
        `/backend/dsa-problems/leaderboard/stream?limit=${lbLimit}&period=${leaderboardPeriod}`,
        { withCredentials: true }
      );
      es.addEventListener('leaderboard', (ev) => {
        try {
          const payload = JSON.parse(ev.data);
          if (Array.isArray(payload.items)) setLeaderboard(payload.items);
        } catch {
          // ignore
        }
      });
    } catch {
      // ignore
    }

    return () => {
      if (es && typeof es.close === 'function') es.close();
    };
  }, [showLeaderboardPanel, lbLimit, leaderboardPeriod]);

  const updateProblemStatus = async (problemName, updates) => {
    try {
      const response = await axios.put('/backend/dsa-problems/status', { problemName, ...updates });
      if (!response.data?.success) return;

      setProblems((prevProblems) => {
        const nextProblems = { ...prevProblems };
        Object.keys(nextProblems).forEach((category) => {
          difficulties.forEach((difficulty) => {
            nextProblems[category][difficulty] = nextProblems[category][difficulty].map((problem) => {
              if (problem.problemName !== problemName) return problem;
              return {
                ...problem,
                ...updates,
                completedAt:
                  updates.isCompleted === true
                    ? new Date()
                    : updates.isCompleted === false
                      ? null
                      : problem.completedAt,
              };
            });
          });
        });
        recalculateStats(nextProblems);
        return nextProblems;
      });

      if (showLeaderboardPanel && updates.isCompleted !== undefined) {
        refetchLeaderboard();
      }
    } catch (error) {
      console.error('Error updating problem status:', error);
      toast.error('Failed to update status');
    }
  };

  const updateProblemNotes = async (problemName, notes) => {
    try {
      const response = await axios.put('/backend/dsa-problems/notes', { problemName, notes });
      if (!response.data?.success) return;

      setProblems((prevProblems) => {
        const nextProblems = { ...prevProblems };
        Object.keys(nextProblems).forEach((category) => {
          difficulties.forEach((difficulty) => {
            nextProblems[category][difficulty] = nextProblems[category][difficulty].map((problem) =>
              problem.problemName === problemName ? { ...problem, notes } : problem
            );
          });
        });
        return nextProblems;
      });
      setNotesModal({ isOpen: false, problem: null, notes: '' });
      toast.success('Notes saved');
    } catch (error) {
      console.error('Error updating notes:', error);
      toast.error('Failed to update notes');
    }
  };

  const deleteNotes = async (problemName) => {
    try {
      const response = await axios.put('/backend/dsa-problems/notes', { problemName, notes: '' });
      if (!response.data?.success) return;

      setProblems((prevProblems) => {
        const nextProblems = { ...prevProblems };
        Object.keys(nextProblems).forEach((category) => {
          difficulties.forEach((difficulty) => {
            nextProblems[category][difficulty] = nextProblems[category][difficulty].map((problem) =>
              problem.problemName === problemName ? { ...problem, notes: '' } : problem
            );
          });
        });
        return nextProblems;
      });
      toast.success('Note deleted');
    } catch (error) {
      console.error('Error deleting notes:', error);
      toast.error('Failed to delete notes');
    }
  };

  const toggleCategory = (category) => {
    setExpandedCategories((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  const toggleDifficulty = (category, difficulty) => {
    const key = `${category}-${difficulty}`;
    setExpandedDifficulties((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setFilter('all');
    hydrateExpansion(problems, true);
  };

  const filteredProblems = useMemo(() => {
    const cloned = JSON.parse(JSON.stringify(problems || {}));
    const q = searchTerm.trim().toLowerCase();

    Object.keys(cloned).forEach((category) => {
      difficulties.forEach((difficulty) => {
        let items = cloned[category][difficulty] || [];
        if (q) {
          items = items.filter((problem) => problem.problemName.toLowerCase().includes(q));
        }
        if (filter === 'completed') items = items.filter((problem) => problem.isCompleted);
        if (filter === 'incomplete') items = items.filter((problem) => !problem.isCompleted);
        if (filter === 'favorites') items = items.filter((problem) => problem.isFavorite);
        cloned[category][difficulty] = items;
      });

      const hasAny = difficulties.some((difficulty) => (cloned[category][difficulty] || []).length > 0);
      if (!hasAny) delete cloned[category];
    });
    return cloned;
  }, [problems, searchTerm, filter]);

  const problemsWithNotes = useMemo(() => {
    const list = [];
    Object.keys(problems || {}).forEach((category) => {
      difficulties.forEach((difficulty) => {
        (problems[category][difficulty] || []).forEach((problem) => {
          if (problem.notes && problem.notes.trim()) {
            list.push({ ...problem, category, difficulty });
          }
        });
      });
    });
    return list;
  }, [problems]);

  const leaderboardFiltered = useMemo(
    () =>
      leaderboard.filter(
        (row) =>
          !lbSearch ||
          row.username?.toLowerCase().includes(lbSearch.toLowerCase()) ||
          row.email?.toLowerCase().includes(lbSearch.toLowerCase())
      ),
    [leaderboard, lbSearch]
  );

  const hasActiveFilters = Boolean(searchTerm || filter !== 'all');

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F3EC] px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-[#E5DCCE] border-t-[#C4A574]" />
          <p className="text-sm font-medium text-[#6B5A48]">Loading your DSA practice studio…</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>DSA Problem Tracker for QA &amp; SDET Interviews | Route2Hire</title>
        <meta
          name="description"
          content="Track your Data Structures & Algorithms practice for QA, SDET and test automation interviews. Solve curated coding problems, bookmark favorites, write approach notes, and compare progress on the community leaderboard."
        />
        <meta
          name="keywords"
          content="DSA problem tracker, QA interview coding questions, SDET DSA practice, data structures and algorithms for testers, test automation interview prep, coding practice tracker"
        />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="DSA Problem Tracker for QA & SDET Interviews | Route2Hire" />
        <meta
          property="og:description"
          content="Practice curated DSA problems built for QA and SDET interviews. Track completion, bookmark favorites, keep approach notes and climb the leaderboard."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://route2hire.com/dsa-tracker" />
        <meta property="og:image" content="https://route2hire.com/assets/Route2Hire.png" />
        <link rel="canonical" href="https://route2hire.com/dsa-tracker" />
      </Helmet>

      <div className="relative min-h-screen overflow-hidden bg-[#F7F3EC] pb-16 pt-28 sm:pb-24 sm:pt-32">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[380px] bg-gradient-to-b from-[#FFFDF8] to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 top-6 hidden select-none font-display text-[220px] font-semibold leading-none text-[#2C241B]/[0.04] lg:block"
        >
          {'{ }'}
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <motion.header
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="border-b border-[#E5DCCE] pb-8 sm:pb-10"
          >
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div className="max-w-3xl">
                <h1 className="font-display mt-4 text-[clamp(2rem,4.4vw,3.4rem)] font-semibold leading-[1.05] tracking-tight text-[#1C1917]">
                  QA &amp; SDET DSA problem tracker
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#57534E] sm:text-base">
                  Practice curated Data Structures &amp; Algorithms questions built for QA, SDET and
                  test automation interviews. Mark problems complete, bookmark the ones worth
                  revisiting, jot quick approach notes, and see how your progress compares on the
                  community leaderboard.
                </p>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: 'Total problems', value: stats.total, Icon: Grid3X3, tone: 'text-[#2C241B]' },
                { label: 'Completed', value: stats.completed, Icon: CheckCircle, tone: 'text-emerald-700' },
                { label: 'Favorites', value: stats.favorites, Icon: Bookmark, tone: 'text-amber-700' },
                { label: 'Progress', value: `${stats.completionPercentage}%`, Icon: Target, tone: 'text-[#2C241B]' },
              ].map(({ label, value, Icon, tone }) => (
                <div
                  key={label}
                  className="rounded-2xl border border-[#E5DCCE] bg-[#FFFDF8] p-4 shadow-[0_2px_10px_-4px_rgba(44,36,27,0.08)]"
                >
                  <div className="flex items-center gap-2 text-[#78716C]">
                    <Icon className="h-4 w-4" aria-hidden />
                    <span className="text-[11px] font-semibold uppercase tracking-[0.1em]">{label}</span>
                  </div>
                  <p className={`font-display mt-2 text-2xl font-semibold sm:text-3xl ${tone}`}>{value}</p>
                </div>
              ))}
            </div>

            <div
              className="mt-5 h-2 w-full overflow-hidden rounded-full bg-[#EFE8DC]"
              role="progressbar"
              aria-valuenow={stats.completionPercentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Overall DSA completion progress"
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#C4A574] to-[#2C241B] transition-all duration-500"
                style={{ width: `${stats.completionPercentage}%` }}
              />
            </div>
          </motion.header>

          <section className="sticky top-[84px] z-20 mt-6 rounded-2xl border border-[#E5DCCE] bg-[#FFFDF8]/95 p-3 shadow-[0_2px_16px_-8px_rgba(44,36,27,0.1)] backdrop-blur-sm sm:p-4">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_auto_auto]">
              <label className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#78716C]" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search DSA problems by name..."
                  aria-label="Search DSA problems by name"
                  className={`w-full rounded-xl border border-[#E5DCCE] bg-[#F7F3EC] py-2.5 pl-10 pr-3 text-sm text-[#2C241B] outline-none transition placeholder:text-[#78716C] focus:border-[#C4A574] focus:ring-2 focus:ring-[#C4A574]/30 ${focusRing}`}
                />
              </label>
              <label className="relative">
                <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#78716C]" />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  aria-label="Filter problems by status"
                  className={`w-full appearance-none rounded-xl border border-[#E5DCCE] bg-[#F7F3EC] py-2.5 pl-10 pr-3 text-sm text-[#2C241B] outline-none transition focus:border-[#C4A574] focus:ring-2 focus:ring-[#C4A574]/30 ${focusRing}`}
                >
                  <option value="all">All problems</option>
                  <option value="completed">Completed only</option>
                  <option value="incomplete">Incomplete only</option>
                  <option value="favorites">Favorites only</option>
                </select>
              </label>
              <button
                type="button"
                onClick={() => setShowNotesPanel(true)}
                className={`inline-flex items-center justify-center gap-2 rounded-xl border border-[#E5DCCE] bg-[#FFFDF8] px-4 py-2.5 text-sm font-medium text-[#6B5A48] transition hover:bg-[#EFE8DC] ${focusRing}`}
              >
                <NotebookPen className="h-4 w-4" aria-hidden />
                Notes
              </button>
              <button
                type="button"
                onClick={() => setShowLeaderboardPanel(true)}
                className={`inline-flex items-center justify-center gap-2 rounded-xl border border-[#E5DCCE] bg-[#FFFDF8] px-4 py-2.5 text-sm font-medium text-[#6B5A48] transition hover:bg-[#EFE8DC] ${focusRing}`}
              >
                <BarChart3 className="h-4 w-4" aria-hidden />
                Leaderboard
              </button>
            </div>
          </section>

          <section className="mt-6 space-y-4">
            {Object.keys(filteredProblems).length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#E5DCCE] bg-[#FFFDF8] px-6 py-14 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F7F3EC] text-[#C4A574]">
                  <Search className="h-5 w-5" aria-hidden />
                </div>
                <h3 className="font-display mt-4 text-3xl text-[#1C1917]">No matching problems</h3>
                <p className="mx-auto mt-2 max-w-md text-sm text-[#78716C]">
                  Try a different keyword, or reset your filters to get back to the full DSA
                  question set and keep your practice streak going.
                </p>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className={`mt-5 rounded-xl border border-[#E5DCCE] bg-[#F7F3EC] px-4 py-2 text-sm font-medium text-[#6B5A48] transition hover:bg-[#EFE8DC] ${focusRing}`}
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              getSortedCategories(filteredProblems).map((category) => {
                const categoryTotal = difficulties.reduce(
                  (sum, diff) => sum + (filteredProblems[category][diff]?.length || 0),
                  0
                );
                const categoryCompleted = difficulties.reduce(
                  (sum, diff) =>
                    sum + (filteredProblems[category][diff] || []).filter((p) => p.isCompleted).length,
                  0
                );
                const categoryProgress = categoryTotal === 0 ? 0 : Math.round((categoryCompleted / categoryTotal) * 100);

                return (
                  <motion.div
                    key={category}
                    initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="overflow-hidden rounded-2xl border border-[#E5DCCE] bg-[#FFFDF8] shadow-[0_2px_12px_-6px_rgba(44,36,27,0.08)]"
                  >
                    <button
                      type="button"
                      onClick={() => toggleCategory(category)}
                      className={`flex w-full items-center justify-between gap-4 bg-[#F7F3EC] px-5 py-4 text-left transition hover:bg-[#EFE8DC] ${focusRing}`}
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        {expandedCategories[category] ? (
                          <ChevronDown className="h-5 w-5 shrink-0 text-[#6B5A48]" />
                        ) : (
                          <ChevronRight className="h-5 w-5 shrink-0 text-[#6B5A48]" />
                        )}
                        <div className="min-w-0">
                          <h2 className="font-display truncate text-xl font-semibold text-[#1C1917] sm:text-2xl">
                            {category}
                          </h2>
                          <p className="text-xs text-[#78716C]">
                            {categoryCompleted} of {categoryTotal} solved
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <div className="hidden h-1.5 w-20 overflow-hidden rounded-full bg-[#E5DCCE] sm:block">
                          <div
                            className="h-full rounded-full bg-[#C4A574]"
                            style={{ width: `${categoryProgress}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6B5A48]">
                          {categoryTotal} problems
                        </span>
                      </div>
                    </button>

                    <AnimatePresence>
                      {expandedCategories[category] && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden px-4 py-3 sm:px-5"
                        >
                          {difficulties.map((difficulty) => {
                            const problemsList = filteredProblems[category][difficulty] || [];
                            if (problemsList.length === 0) return null;
                            const key = `${category}-${difficulty}`;
                            const solvedCount = problemsList.filter((p) => p.isCompleted).length;

                            return (
                              <div key={difficulty} className="mb-4 border-b border-[#E5DCCE] pb-3 last:mb-0 last:border-b-0">
                                <button
                                  type="button"
                                  onClick={() => toggleDifficulty(category, difficulty)}
                                  className={`flex w-full items-center justify-between rounded-xl border px-4 py-2.5 text-sm font-semibold ${difficultyTone[difficulty]} ${focusRing}`}
                                >
                                  <span className="inline-flex items-center gap-2">
                                    {expandedDifficulties[key] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                    <span className={`h-1.5 w-1.5 rounded-full ${difficultyDot[difficulty]}`} aria-hidden />
                                    {difficulty}
                                  </span>
                                  <span>{solvedCount}/{problemsList.length} solved</span>
                                </button>

                                <AnimatePresence>
                                  {expandedDifficulties[key] && (
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: 'auto' }}
                                      exit={{ opacity: 0, height: 0 }}
                                      className="space-y-2 pt-3"
                                    >
                                      {problemsList.map((problem) => (
                                        <article
                                          key={problem.problemName}
                                          className={`rounded-xl border p-3.5 transition sm:p-4 ${
                                            problem.isCompleted
                                              ? 'border-emerald-200 bg-emerald-50/70'
                                              : 'border-[#E5DCCE] bg-[#F7F3EC] hover:border-[#C4A574]/60'
                                          }`}
                                        >
                                          <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-3">
                                              <button
                                                type="button"
                                                onClick={() => updateProblemStatus(problem.problemName, { isCompleted: !problem.isCompleted })}
                                                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition ${focusRing} ${
                                                  problem.isCompleted
                                                    ? 'border-emerald-300 bg-emerald-500 text-white hover:bg-emerald-600'
                                                    : 'border-[#E5DCCE] bg-[#FFFDF8] text-transparent hover:border-[#C4A574]'
                                                }`}
                                                title={problem.isCompleted ? 'Mark incomplete' : 'Mark completed'}
                                                aria-label={problem.isCompleted ? `Mark ${problem.problemName} incomplete` : `Mark ${problem.problemName} completed`}
                                              >
                                                <Check className="h-3.5 w-3.5" />
                                              </button>

                                              <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                                                <a
                                                  href={problem.problemLink}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className={`truncate rounded-sm font-medium leading-none text-[#2C241B] hover:underline ${focusRing}`}
                                                >
                                                  {problem.problemName}
                                                </a>
                                                {problem.isCompleted && (
                                                  <span className="rounded-full border border-emerald-200 bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                                                    Completed
                                                  </span>
                                                )}
                                                {problem.isFavorite && (
                                                  <span className="rounded-full border border-amber-200 bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                                                    Favorite
                                                  </span>
                                                )}
                                              </div>

                                              <div className="flex shrink-0 items-center gap-1.5">
                                              <button
                                                type="button"
                                                onClick={() => updateProblemStatus(problem.problemName, { isFavorite: !problem.isFavorite })}
                                                className={`rounded-lg border p-2 transition ${focusRing} ${
                                                  problem.isFavorite
                                                    ? 'border-amber-200 bg-amber-100 text-amber-700 hover:bg-amber-200'
                                                    : 'border-[#E5DCCE] bg-[#FFFDF8] text-[#6B5A48] hover:bg-[#EFE8DC]'
                                                }`}
                                                title={problem.isFavorite ? 'Remove favorite' : 'Add favorite'}
                                                aria-label={problem.isFavorite ? `Remove ${problem.problemName} from favorites` : `Add ${problem.problemName} to favorites`}
                                              >
                                                <Star className={`h-4 w-4 ${problem.isFavorite ? 'fill-current' : ''}`} />
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() => setNotesModal({ isOpen: true, problem, notes: problem.notes || '' })}
                                                className={`rounded-lg border p-2 transition ${focusRing} ${
                                                  problem.notes?.trim()
                                                    ? 'border-[#C4A574] bg-[#EFE8DC] text-[#6B5A48] hover:bg-[#E5DCCE]'
                                                    : 'border-[#E5DCCE] bg-[#FFFDF8] text-[#6B5A48] hover:bg-[#EFE8DC]'
                                                }`}
                                                title={problem.notes?.trim() ? 'Edit notes' : 'Add notes'}
                                                aria-label={problem.notes?.trim() ? `Edit notes for ${problem.problemName}` : `Add notes for ${problem.problemName}`}
                                              >
                                                <Pencil className="h-4 w-4" />
                                              </button>
                                            </div>
                                            </div>

                                            {problem.notes && (
                                              <p
                                                className="line-clamp-2 pl-10 text-sm text-[#6B5A48]"
                                              >
                                                {problem.notes}
                                              </p>
                                            )}
                                          </div>
                                        </article>
                                      ))}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })
            )}
          </section>

          <div className="mt-12">
            <RelatedLinks type="general" />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showNotesPanel && (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNotesPanel(false)}
              className="fixed inset-0 z-[2147483646] bg-[#2C241B]/30"
              aria-label="Close notes panel backdrop"
            />
            <motion.aside
              initial={reduceMotion ? false : { x: 420, opacity: 0.9 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 420, opacity: 0.9 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="fixed right-0 top-0 z-[2147483647] h-full w-full max-w-[420px] border-l border-[#E5DCCE] bg-[#FFFDF8] shadow-[0_0_0_1px_rgba(229,220,206,0.5),_-10px_0_30px_rgba(44,36,27,0.12)]"
            >
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b border-[#E5DCCE] px-5 py-4">
                  <div className="flex items-center gap-2">
                    <NotebookPen className="h-5 w-5 text-[#C4A574]" aria-hidden />
                    <p className="font-display text-2xl text-[#1C1917]">Notes</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowNotesPanel(false)}
                    className={`rounded-lg border border-[#E5DCCE] bg-[#F7F3EC] p-2 text-[#6B5A48] transition hover:bg-[#EFE8DC] ${focusRing}`}
                    aria-label="Close notes panel"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto px-5 py-5">
                  <div className="space-y-3">
                    {problemsWithNotes.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-[#E5DCCE] bg-[#F7F3EC] px-4 py-8 text-center">
                        <NotebookPen className="mx-auto h-6 w-6 text-[#C4A574]" aria-hidden />
                        <p className="mt-3 text-sm text-[#78716C]">
                          No notes yet. Add approach notes on any problem to see them here.
                        </p>
                      </div>
                    ) : (
                      problemsWithNotes.map((problem) => (
                        <article key={problem.problemName} className="rounded-xl border border-[#E5DCCE] bg-[#F7F3EC] p-3.5">
                          <a
                            href={problem.problemLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`font-medium text-[#2C241B] hover:underline ${focusRing}`}
                          >
                            {problem.problemName}
                          </a>
                          <p className="mt-1 text-xs text-[#78716C]">
                            {problem.category} • {problem.difficulty}
                          </p>
                          <p className="mt-2 text-sm leading-relaxed text-[#57534E]">{problem.notes}</p>
                          <div className="mt-2 flex gap-2">
                            <button
                              type="button"
                              onClick={() => setNotesModal({ isOpen: true, problem, notes: problem.notes || '' })}
                              className={`rounded-lg border border-[#E5DCCE] bg-[#FFFDF8] px-2.5 py-1 text-xs text-[#6B5A48] transition hover:bg-[#EFE8DC] ${focusRing}`}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteNotes(problem.problemName)}
                              className={`rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs text-rose-700 transition hover:bg-rose-100 ${focusRing}`}
                            >
                              Delete
                            </button>
                          </div>
                        </article>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLeaderboardPanel && (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLeaderboardPanel(false)}
              className="fixed inset-0 z-[2147483646] bg-[#2C241B]/30"
              aria-label="Close leaderboard panel backdrop"
            />
            <motion.aside
              initial={reduceMotion ? false : { x: 420, opacity: 0.9 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 420, opacity: 0.9 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="fixed right-0 top-0 z-[2147483647] h-full w-full max-w-[420px] border-l border-[#E5DCCE] bg-[#FFFDF8] shadow-[0_0_0_1px_rgba(229,220,206,0.5),_-10px_0_30px_rgba(44,36,27,0.12)]"
            >
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b border-[#E5DCCE] px-5 py-4">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-[#C4A574]" aria-hidden />
                    <p className="font-display text-2xl text-[#1C1917]">Leaderboard</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowLeaderboardPanel(false)}
                    className={`rounded-lg border border-[#E5DCCE] bg-[#F7F3EC] p-2 text-[#6B5A48] transition hover:bg-[#EFE8DC] ${focusRing}`}
                    aria-label="Close leaderboard panel"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto px-5 py-5">
                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5 text-[#6B5A48]">
                      <Users className="h-3.5 w-3.5" aria-hidden />
                      <p className="text-xs font-semibold uppercase tracking-[0.12em]">Community ranking</p>
                    </div>
                    <div className="inline-flex rounded-xl border border-[#E5DCCE] bg-[#F7F3EC] p-1">
                      <button
                        type="button"
                        onClick={() => setLeaderboardTab('leaderboard')}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] ${focusRing} ${
                          leaderboardTab === 'leaderboard' ? 'bg-[#2C241B] text-[#FFFDF8]' : 'text-[#6B5A48]'
                        }`}
                      >
                        <Trophy className="h-3.5 w-3.5" aria-hidden />
                        Ranking
                      </button>
                      <button
                        type="button"
                        onClick={() => setLeaderboardTab('winners')}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] ${focusRing} ${
                          leaderboardTab === 'winners' ? 'bg-[#2C241B] text-[#FFFDF8]' : 'text-[#6B5A48]'
                        }`}
                      >
                        <Award className="h-3.5 w-3.5" aria-hidden />
                        Winners
                      </button>
                    </div>

                    {leaderboardTab === 'leaderboard' ? (
                      <>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setLeaderboardPeriod('all')}
                            className={`flex-1 rounded-xl border px-2.5 py-2 text-xs font-semibold uppercase tracking-[0.08em] ${focusRing} ${
                              leaderboardPeriod === 'all'
                                ? 'border-[#2C241B] bg-[#2C241B] text-[#FFFDF8]'
                                : 'border-[#E5DCCE] bg-[#F7F3EC] text-[#6B5A48]'
                            }`}
                          >
                            All-time
                          </button>
                          <button
                            type="button"
                            onClick={() => setLeaderboardPeriod('weekly')}
                            className={`flex-1 rounded-xl border px-2.5 py-2 text-xs font-semibold uppercase tracking-[0.08em] ${focusRing} ${
                              leaderboardPeriod === 'weekly'
                                ? 'border-[#2C241B] bg-[#2C241B] text-[#FFFDF8]'
                                : 'border-[#E5DCCE] bg-[#F7F3EC] text-[#6B5A48]'
                            }`}
                          >
                            This week
                          </button>
                        </div>
                        <input
                          type="text"
                          value={lbSearch}
                          onChange={(e) => setLbSearch(e.target.value)}
                          placeholder="Search user"
                          className={`w-full rounded-xl border border-[#E5DCCE] bg-[#F7F3EC] px-3 py-2 text-sm text-[#2C241B] outline-none transition focus:border-[#C4A574] focus:ring-2 focus:ring-[#C4A574]/30 ${focusRing}`}
                        />
                        <div className="space-y-2">
                          {leaderboardFiltered.map((row) => (
                            <div
                              key={`${row.userId}-${row.rank}`}
                              className="flex items-center justify-between gap-3 rounded-xl border border-[#E5DCCE] bg-[#F7F3EC] px-3 py-2.5"
                            >
                              <div className="flex min-w-0 items-center gap-3">
                                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${rankTone(row.rank)}`}>
                                  {row.rank}
                                </span>
                                <p className="truncate text-sm font-semibold text-[#2C241B]">{row.username}</p>
                              </div>
                              <p className="shrink-0 text-sm font-semibold text-[#6B5A48]">{row.totalPoints} pts</p>
                            </div>
                          ))}
                          {leaderboardFiltered.length === 0 && (
                            <p className="text-sm text-[#78716C]">No entries.</p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => setLbLimit(lbLimit + 10)}
                          className={`w-full rounded-xl border border-[#E5DCCE] bg-[#FFFDF8] px-3 py-2 text-sm text-[#6B5A48] transition hover:bg-[#F7F3EC] ${focusRing}`}
                        >
                          Show more
                        </button>
                      </>
                    ) : (
                      <div className="space-y-2">
                        {weeklyWinners.length === 0 ? (
                          <p className="text-sm text-[#78716C]">No weekly winners yet.</p>
                        ) : (
                          weeklyWinners.map((w, index) => (
                            <div
                              key={w.userId}
                              className="flex items-center justify-between gap-3 rounded-xl border border-[#E5DCCE] bg-[#F7F3EC] px-3 py-2.5"
                            >
                              <div className="flex min-w-0 items-center gap-3">
                                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${rankTone(index + 1)}`}>
                                  {String(index + 1).padStart(2, '0')}
                                </span>
                                <p className="truncate text-sm font-semibold text-[#2C241B]">{w.username}</p>
                              </div>
                              <p className="shrink-0 text-sm font-semibold text-[#6B5A48]">{w.totalPoints} pts</p>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {notesModal.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#2C241B]/45 p-4 backdrop-blur-[2px]"
            onClick={() => setNotesModal({ isOpen: false, problem: null, notes: '' })}
          >
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl rounded-2xl border border-[#E5DCCE] bg-[#FFFDF8] p-6 shadow-[0_20px_45px_rgba(44,36,27,0.2)] sm:p-7"
            >
              <div className="mb-4 flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#E5DCCE] bg-[#F7F3EC] text-[#C4A574]">
                    <NotebookPen className="h-4 w-4" aria-hidden />
                  </span>
                  <h3 className="font-display truncate text-2xl text-[#1C1917]">{notesModal.problem?.problemName}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setNotesModal({ isOpen: false, problem: null, notes: '' })}
                  className={`shrink-0 rounded-lg border border-[#E5DCCE] p-2 text-[#6B5A48] transition hover:bg-[#F7F3EC] ${focusRing}`}
                  aria-label="Close notes editor"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <textarea
                value={notesModal.notes}
                onChange={(e) => setNotesModal((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Write your approach, edge-cases, or reminder notes..."
                rows={9}
                className={`w-full resize-none rounded-xl border border-[#E5DCCE] bg-[#F7F3EC] px-4 py-3 text-sm text-[#2C241B] outline-none transition focus:border-[#C4A574] focus:ring-2 focus:ring-[#C4A574]/40 ${focusRing}`}
              />

              <div className="mt-4 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => notesModal.problem && updateProblemNotes(notesModal.problem.problemName, notesModal.notes)}
                  className={`rounded-xl border border-[#2C241B] bg-[#2C241B] px-5 py-2.5 text-sm font-medium text-[#FFFDF8] transition hover:bg-[#1A1510] ${focusRing}`}
                >
                  Save note
                </button>
                <button
                  type="button"
                  onClick={() => setNotesModal({ isOpen: false, problem: null, notes: '' })}
                  className={`rounded-xl border border-[#E5DCCE] bg-[#FFFDF8] px-5 py-2.5 text-sm font-medium text-[#6B5A48] transition hover:bg-[#F7F3EC] ${focusRing}`}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
