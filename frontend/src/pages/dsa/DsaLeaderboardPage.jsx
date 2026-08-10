import { useEffect, useState, useRef, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  ArrowLeft,
  Crown,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Medal,
} from 'lucide-react';
import RelatedLinks from '../../components/RelatedLinks';
import { focusRing } from '../../theme/tokens';
import { fetchDsaLeaderboard, fetchWeeklyWinners } from '../../lib/dsa-api';

const PERIODS = [
  { id: 'all', label: 'All-time' },
  { id: 'monthly', label: 'This month' },
  { id: 'weekly', label: 'This week' },
];

const PAGE_SIZE = 20;
const EASE = [0.22, 1, 0.36, 1];

function useDebouncedValue(value, delayMs = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

function Avatar({ src, size = 'md', className = '' }) {
  const dim = size === 'xl' ? 'h-[4.5rem] w-[4.5rem]' : size === 'lg' ? 'h-14 w-14' : 'h-11 w-11';
  return (
    <img
      src={src || '/assets/Profile.jpg'}
      alt=""
      className={`${dim} shrink-0 rounded-full object-cover ring-2 ring-[#E5DCCE] ${className}`}
    />
  );
}

function RankMark({ rank }) {
  if (rank === 1) {
    return (
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#C4A574] font-display text-sm font-bold text-[#FFFDF8]">
        1
      </span>
    );
  }
  if (rank === 2) {
    return (
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#6B5A48] font-display text-sm font-bold text-[#FFFDF8]">
        2
      </span>
    );
  }
  if (rank === 3) {
    return (
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#E5DCCE] font-display text-sm font-bold text-[#2C241B]">
        3
      </span>
    );
  }
  return (
    <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EFE8DC] font-display text-sm font-semibold tabular-nums text-[#6B5A48]">
      {rank}
    </span>
  );
}

function ScoreBar({ value, max }) {
  const pct = max > 0 ? Math.max(6, Math.round((value / max) * 100)) : 0;
  return (
    <div className="mt-2 h-1.5 w-full max-w-[12rem] overflow-hidden rounded-full bg-[#EFE8DC]">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.55, ease: EASE }}
        className="h-full rounded-full bg-[#C4A574]"
      />
    </div>
  );
}

function PodiumCard({ place, user, delay = 0 }) {
  const Icon = place === 1 ? Crown : Medal;
  const placeTone = {
    1: 'border-[#C4A574]/50 bg-[#FFFDF8]',
    2: 'border-[#E5DCCE] bg-[#FFFDF8]',
    3: 'border-[#E5DCCE] bg-[#FFFDF8]',
  };
  const badgeTone = {
    1: 'bg-[#C4A574] text-[#FFFDF8]',
    2: 'bg-[#6B5A48] text-[#FFFDF8]',
    3: 'bg-[#E5DCCE] text-[#2C241B]',
  };
  const order = { 1: 'sm:order-2 sm:-mt-4', 2: 'sm:order-1', 3: 'sm:order-3' };

  if (!user) {
    return (
      <div
        className={`flex flex-col items-center rounded-3xl border border-dashed border-[#E5DCCE] bg-[#FFFDF8]/60 px-4 py-8 ${order[place]}`}
      >
        <div className="h-14 w-14 rounded-full bg-[#EFE8DC]" />
        <p className="mt-3 text-xs text-[#A89B8A]">Open seat</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: EASE }}
      className={`relative flex flex-col items-center rounded-3xl border px-4 py-6 text-center shadow-[0_12px_40px_-28px_rgba(44,36,27,0.35)] ${placeTone[place]} ${order[place]}`}
    >
      <span
        className={`absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badgeTone[place]}`}
      >
        <Icon size={11} aria-hidden /> #{place}
      </span>
      <Avatar src={user.profilePicture} size={place === 1 ? 'xl' : 'lg'} className="mt-2" />
      <p className="font-display mt-3 max-w-full truncate text-base font-semibold text-[#1C1917]">
        @{user.username}
      </p>
      <p className="mt-1 text-xs text-[#78716C]">
        <span className="font-semibold tabular-nums text-[#2C241B]">{user.totalPoints}</span> pts ·{' '}
        {user.completedCount} solved
      </p>
    </motion.div>
  );
}

export default function DsaLeaderboardPage() {
  const { currentUser } = useSelector((state) => state.user);
  const [period, setPeriod] = useState('all');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const requestSeq = useRef(0);

  const q = useDebouncedValue(searchInput.trim(), 350);

  useEffect(() => {
    setPage(1);
  }, [period, q]);

  useEffect(() => {
    let cancelled = false;
    fetchWeeklyWinners()
      .then((d) => {
        if (!cancelled) setWinners(d.leaderboard || []);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const seq = ++requestSeq.current;
    setLoading(true);

    const params = { period, page, limit: PAGE_SIZE };
    if (q) params.q = q;

    fetchDsaLeaderboard(params)
      .then((d) => {
        if (cancelled || seq !== requestSeq.current) return;
        setRows(d.leaderboard || []);
        setMeta({
          total: d.total || 0,
          totalPages: d.totalPages || 1,
          page: d.page || page,
        });
      })
      .catch(() => {
        if (cancelled || seq !== requestSeq.current) return;
        setRows([]);
        setMeta({ total: 0, totalPages: 1, page: 1 });
      })
      .finally(() => {
        if (!cancelled && seq === requestSeq.current) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [period, q, page]);

  const myId = currentUser?._id || currentUser?.id;
  const from = meta.total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, meta.total);
  const hasFilters = Boolean(q || period !== 'all');
  const maxPts = useMemo(
    () => rows.reduce((m, r) => Math.max(m, r.totalPoints || 0), 0),
    [rows],
  );

  const clearFilters = () => {
    setSearchInput('');
    setPeriod('all');
  };

  return (
    <>
      <Helmet>
        <title>DSA Leaderboard | Route2Hire</title>
        <meta
          name="description"
          content="Live QA/SDET DSA leaderboard — climb the ranks with difficulty-weighted points."
        />
        <link rel="canonical" href="https://route2hire.com/qa-sdet-dsa-sheet/leaderboard" />
      </Helmet>

      <div
        className="relative min-h-screen overflow-x-clip bg-[#F7F3EC] pb-20"
        style={{ paddingTop: 'calc(var(--r2h-announcement-height, 0px) + 8rem)' }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-72"
          style={{
            background:
              'radial-gradient(ellipse 55% 70% at 15% 0%, rgba(196,165,116,0.18), transparent 55%), radial-gradient(ellipse 45% 55% at 90% 10%, rgba(44,36,27,0.06), transparent 50%)',
          }}
        />

        <div className="relative mx-auto max-w-4xl px-4 sm:px-6">
          <Link
            to="/qa-sdet-dsa-sheet"
            className={`inline-flex items-center gap-1.5 text-sm font-medium text-[#6B5A48] transition hover:text-[#2C241B] ${focusRing}`}
          >
            <ArrowLeft size={16} /> Back to DSA sheet
          </Link>

          <motion.header
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="mt-6"
          >
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#6B5A48]">
                Community
              </p>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E5DCCE] bg-[#FFFDF8] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6B5A48]">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#C4A574] opacity-60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#C4A574]" />
                </span>
                Live
              </span>
            </div>
            <h1 className="font-display mt-2 flex flex-wrap items-center gap-3 text-3xl font-semibold tracking-tight text-[#1C1917] sm:text-4xl md:text-5xl">
              <Trophy className="shrink-0 text-[#C4A574]" size={34} aria-hidden />
              Live Leaderboard
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#57534E] sm:text-base">
              Difficulty-weighted points — Easy 10 · Medium 20 · Hard 30. Search solvers and browse
              ranks page by page.
            </p>
          </motion.header>

          {/* Weekly podium */}
          <section className="mt-10">
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6B5A48]">
                  This week
                </p>
                <h2 className="font-display mt-1 text-xl font-semibold text-[#1C1917]">Podium</h2>
              </div>
              <p className="text-xs text-[#78716C]">Resets every Monday</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 sm:items-end">
              <PodiumCard place={2} user={winners[1]} delay={0.08} />
              <PodiumCard place={1} user={winners[0]} delay={0.04} />
              <PodiumCard place={3} user={winners[2]} delay={0.12} />
            </div>
          </section>

          {/* Filters + rankings */}
          <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1, ease: EASE }}
            className="mt-10 overflow-hidden rounded-3xl border border-[#E5DCCE] bg-[#FFFDF8]"
          >
            <div className="space-y-3 border-b border-[#E5DCCE] px-4 py-4 sm:px-5">
              <div className="relative">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A89B8A]"
                  aria-hidden
                />
                <input
                  type="search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search by username…"
                  className={`w-full rounded-xl border border-[#E5DCCE] bg-[#F7F3EC]/70 py-2.5 pl-10 pr-10 text-sm text-[#1C1917] placeholder:text-[#A89B8A] ${focusRing}`}
                  aria-label="Search leaderboard by username"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => setSearchInput('')}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[#6B5A48] hover:bg-[#EFE8DC] ${focusRing}`}
                    aria-label="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div
                  className="inline-flex rounded-xl border border-[#E5DCCE] bg-[#F7F3EC]/50 p-0.5"
                  role="tablist"
                  aria-label="Period"
                >
                  {PERIODS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      role="tab"
                      aria-selected={period === p.id}
                      onClick={() => setPeriod(p.id)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${focusRing} ${
                        period === p.id
                          ? 'bg-[#2C241B] text-[#FFFDF8]'
                          : 'text-[#6B5A48] hover:text-[#2C241B]'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                {hasFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className={`inline-flex items-center gap-1 text-xs font-semibold text-[#6B5A48] hover:text-[#2C241B] ${focusRing}`}
                  >
                    <X size={12} /> Reset
                  </button>
                )}
                <p className="ml-auto text-xs tabular-nums text-[#78716C]">
                  {loading ? (
                    'Loading…'
                  ) : (
                    <>
                      <span className="font-semibold text-[#2C241B]">{from}–{to}</span> of{' '}
                      <span className="font-semibold text-[#2C241B]">{meta.total}</span>
                    </>
                  )}
                </p>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {loading ? (
                <motion.p
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-6 py-14 text-center text-sm text-[#6B5A48]"
                >
                  Loading rankings…
                </motion.p>
              ) : rows.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-6 py-14 text-center"
                >
                  <Trophy className="mx-auto text-[#C4A574]" size={32} aria-hidden />
                  <p className="font-display mt-4 text-lg font-semibold text-[#1C1917]">
                    {hasFilters ? 'No matches' : 'No rankings yet'}
                  </p>
                  <p className="mx-auto mt-2 max-w-sm text-sm text-[#78716C]">
                    {hasFilters
                      ? 'Try clearing search or switching period.'
                      : 'Be the first — open the DSA sheet and submit a solution.'}
                  </p>
                  {hasFilters ? (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className={`mt-5 inline-flex rounded-full border border-[#E5DCCE] px-5 py-2.5 text-sm font-semibold text-[#2C241B] ${focusRing}`}
                    >
                      Clear filters
                    </button>
                  ) : (
                    <Link
                      to="/qa-sdet-dsa-sheet"
                      className={`mt-5 inline-flex rounded-full bg-[#2C241B] px-5 py-2.5 text-sm font-semibold text-[#FFFDF8] transition hover:bg-[#3D3228] ${focusRing}`}
                    >
                      Open DSA Sheet
                    </Link>
                  )}
                </motion.div>
              ) : (
                <motion.ul
                  key={`${period}-${page}-${q}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="divide-y divide-[#E5DCCE]"
                >
                  {rows.map((r, idx) => {
                    const isMe = myId && String(r.userId) === String(myId);
                    return (
                      <motion.li
                        key={r.userId}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.3,
                          delay: Math.min(idx * 0.03, 0.3),
                          ease: EASE,
                        }}
                        className={`flex items-center gap-3 px-4 py-3.5 sm:gap-4 sm:px-5 ${
                          isMe ? 'bg-[#C4A574]/10' : 'hover:bg-[#F7F3EC]/80'
                        }`}
                      >
                        <RankMark rank={r.rank} />
                        <Avatar src={r.profilePicture} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-[#1C1917]">
                            @{r.username}
                            {isMe && (
                              <span className="ml-2 text-[10px] font-semibold uppercase tracking-wider text-[#C4A574]">
                                you
                              </span>
                            )}
                          </p>
                          <p className="mt-0.5 text-[11px] text-[#A89B8A]">
                            {r.completedCount} solved
                            {r.lastCompletedAt
                              ? ` · ${new Date(r.lastCompletedAt).toLocaleDateString()}`
                              : ''}
                          </p>
                          <ScoreBar value={r.totalPoints || 0} max={maxPts} />
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="font-display text-lg font-semibold tabular-nums text-[#1C1917]">
                            {r.totalPoints}
                          </p>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6B5A48]">
                            pts
                          </p>
                        </div>
                      </motion.li>
                    );
                  })}
                </motion.ul>
              )}
            </AnimatePresence>

            {meta.totalPages > 1 && !loading && rows.length > 0 && (
              <div className="flex items-center justify-between gap-3 border-t border-[#E5DCCE] px-4 py-3 sm:px-5">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className={`inline-flex items-center gap-1 rounded-xl border border-[#E5DCCE] bg-[#FFFDF8] px-3 py-2 text-xs font-semibold text-[#2C241B] transition hover:bg-[#EFE8DC] disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`}
                >
                  <ChevronLeft size={14} /> Prev
                </button>
                <p className="text-xs font-medium tabular-nums text-[#6B5A48]">
                  Page{' '}
                  <span className="text-[#2C241B]">
                    {page} / {meta.totalPages}
                  </span>
                </p>
                <button
                  type="button"
                  disabled={page >= meta.totalPages}
                  onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                  className={`inline-flex items-center gap-1 rounded-xl border border-[#E5DCCE] bg-[#FFFDF8] px-3 py-2 text-xs font-semibold text-[#2C241B] transition hover:bg-[#EFE8DC] disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`}
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            )}
          </motion.section>

          <div className="mt-12">
            <RelatedLinks type="dsa" />
          </div>
        </div>
      </div>
    </>
  );
}
