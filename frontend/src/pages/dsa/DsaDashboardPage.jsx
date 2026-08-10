import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import {
  Trophy,
  Search,
  Star,
  CheckCircle2,
  ArrowUpRight,
  LayoutDashboard,
} from 'lucide-react';
import RelatedLinks from '../../components/RelatedLinks';
import DsaProgressRing from '../../components/dsa/DsaProgressRing';
import { focusRing } from '../../theme/tokens';
import { fetchDsaDashboard, fetchDsaProblems } from '../../lib/dsa-api';

const DIFF_TONE = {
  Easy: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  Medium: 'text-amber-700 bg-amber-50 border-amber-200',
  Hard: 'text-rose-700 bg-rose-50 border-rose-200',
};

export default function DsaDashboardPage() {
  const { currentUser } = useSelector((state) => state.user);
  const [dash, setDash] = useState(null);
  const [list, setList] = useState(null);
  const [q, setQ] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [category, setCategory] = useState('');
  const [company, setCompany] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const p = await fetchDsaProblems({
        q,
        difficulty: difficulty || undefined,
        category: category || undefined,
        company: company || undefined,
        status: status || undefined,
        limit: 300,
      });
      setList(p);

      if (currentUser) {
        try {
          const d = await fetchDsaDashboard();
          setDash(d);
        } catch {
          setDash(null);
        }
      } else {
        setDash(null);
      }
    } catch (e) {
      console.error(e);
      setList({ problems: [], total: 0, facets: { categories: [], companies: [] }, stats: {} });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty, category, company, status, currentUser]);

  const solved = dash?.stats?.totalSolved || list?.stats?.solved || 0;
  const total = dash?.totalProblems || list?.total || 0;
  const pageUrl = 'https://route2hire.com/qa-sdet-dsa-sheet';
  const pageTitle = 'QA/SDET DSA Sheet — Practice Coding Problems Online | Route2Hire';
  const pageDescription =
    'Free QA/SDET DSA sheet with curated coding problems for testing interviews. Run tests, submit solutions, track progress, streaks, and climb the live leaderboard on Route2Hire.';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'QA/SDET DSA Sheet',
    description: pageDescription,
    url: pageUrl,
    isPartOf: {
      '@type': 'WebSite',
      name: 'Route2Hire',
      url: 'https://route2hire.com',
    },
    about: [
      { '@type': 'Thing', name: 'QA' },
      { '@type': 'Thing', name: 'SDET' },
      { '@type': 'Thing', name: 'Data Structures and Algorithms' },
    ],
    mainEntity: {
      '@type': 'ItemList',
      name: 'QA/SDET DSA problems',
      numberOfItems: total || undefined,
      itemListOrder: 'https://schema.org/ItemListOrderAscending',
    },
  };

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta
          name="keywords"
          content="QA SDET DSA sheet, QA coding problems, SDET interview preparation, DSA for testers, test automation DSA, Route2Hire"
        />
        <link rel="canonical" href={pageUrl} />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Route2Hire" />
        <meta property="og:title" content="QA/SDET DSA Sheet | Route2Hire" />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={pageUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="QA/SDET DSA Sheet | Route2Hire" />
        <meta name="twitter:description" content={pageDescription} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <div
        className="min-h-screen bg-[#F7F3EC] pb-20"
        style={{ paddingTop: 'calc(var(--r2h-announcement-height, 0px) + 8rem)' }}
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6B5A48]">
              QA / SDET preparation
            </p>
            <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight text-[#1C1917] sm:text-4xl md:text-5xl">
              QA/SDET DSA Sheet
            </h1>
            <p className="mt-3 max-w-2xl text-[#57534E]">
              Curated data structures and algorithms problems for QA and SDET interviews — run tests,
              submit solutions in-app, track progress, and climb the live leaderboard.
            </p>
          </motion.div>

          {/* Compact progress + My Corner link */}
          <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="relative mb-8 overflow-hidden rounded-3xl border border-[#E5DCCE] bg-[#FFFDF8]"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse 45% 80% at 0% 50%, rgba(196,165,116,0.14), transparent 60%)',
              }}
            />
            <div className="relative flex flex-col items-center gap-6 px-6 py-7 sm:flex-row sm:justify-between sm:px-8">
              <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-8">
                {loading && !list ? (
                  <div className="flex h-[140px] w-[140px] items-center justify-center text-xs text-[#6B5A48]">
                    …
                  </div>
                ) : (
                  <DsaProgressRing
                    solved={currentUser ? solved : 0}
                    total={total}
                    size={140}
                    strokeWidth={10}
                  />
                )}
                <div className="text-center sm:text-left">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6B5A48]">
                    Your progress
                  </p>
                  <p className="font-display mt-1 text-xl font-semibold text-[#1C1917] sm:text-2xl">
                    {currentUser
                      ? `${solved} solved of ${total}`
                      : `${total} problems ready`}
                  </p>
                  <p className="mt-1.5 max-w-sm text-sm text-[#78716C]">
                    {currentUser
                      ? 'Full streaks, XP, heatmap & recommendations live in My Corner.'
                      : 'Sign in to track solved progress across the sheet.'}
                  </p>
                </div>
              </div>

              <div className="flex w-full flex-col gap-2.5 sm:w-auto sm:min-w-[220px]">
                <Link
                  to={
                    currentUser
                      ? '/myCorner?panel=dsa'
                      : `/sign-in?redirect=${encodeURIComponent('/myCorner?panel=dsa')}`
                  }
                  className={`group inline-flex items-center justify-between gap-3 rounded-2xl border border-[#E5DCCE] bg-[#F7F3EC]/80 px-4 py-3.5 transition hover:border-[#C4A574] hover:bg-[#EFE8DC] ${focusRing}`}
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2C241B] text-[#C4A574]">
                      <LayoutDashboard size={16} />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-[#1C1917]">
                        DSA dashboard
                      </span>
                      <span className="block text-[11px] text-[#78716C]">
                        Metrics in My Corner
                      </span>
                    </span>
                  </span>
                  <ArrowUpRight
                    size={16}
                    className="text-[#C4A574] transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </Link>
                <Link
                  to="/qa-sdet-dsa-sheet/leaderboard"
                  className={`inline-flex items-center justify-center gap-2 rounded-2xl border border-[#E5DCCE] bg-[#FFFDF8] px-4 py-2.5 text-sm font-semibold text-[#2C241B] transition hover:bg-[#F7F3EC] ${focusRing}`}
                >
                  <Trophy size={15} className="text-[#C4A574]" /> Leaderboard
                </Link>
              </div>
            </div>
          </motion.section>

          <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-[#E5DCCE] bg-[#FFFDF8]/90 p-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#C4A574]" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && load()}
                placeholder="Search problems, topics, companies…"
                className={`w-full rounded-xl border border-[#E5DCCE] bg-[#F7F3EC] py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[#C4A574] ${focusRing}`}
              />
            </div>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="rounded-xl border border-[#E5DCCE] bg-[#F7F3EC] px-3 py-2.5 text-sm"
            >
              <option value="">All difficulty</option>
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-xl border border-[#E5DCCE] bg-[#F7F3EC] px-3 py-2.5 text-sm"
            >
              <option value="">All topics</option>
              {(list?.facets?.categories || []).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="rounded-xl border border-[#E5DCCE] bg-[#F7F3EC] px-3 py-2.5 text-sm"
            >
              <option value="">All companies</option>
              {(list?.facets?.companies || []).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-xl border border-[#E5DCCE] bg-[#F7F3EC] px-3 py-2.5 text-sm"
            >
              <option value="">All status</option>
              <option value="solved">Solved</option>
              <option value="unsolved">Unsolved</option>
              <option value="attempted">Attempted</option>
              <option value="favorite">Favorites</option>
            </select>
            <button
              type="button"
              onClick={load}
              className={`rounded-full bg-[#2C241B] px-4 py-2.5 text-sm font-semibold text-[#FFFDF8] ${focusRing}`}
            >
              Apply
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#E5DCCE] bg-[#FFFDF8]">
            <div className="border-b border-[#E5DCCE] px-4 py-3">
              <h2 className="font-display text-base font-semibold text-[#1C1917]">
                Problem list
              </h2>
              <p className="mt-0.5 text-sm text-[#6B5A48]">
                {loading && !list
                  ? 'Loading problems…'
                  : `${list?.total ?? 0} QA/SDET DSA problems${
                      list?.stats
                        ? ` · ${list.stats.solved} solved · ${list.stats.favorites} favorites`
                        : ''
                    }`}
              </p>
            </div>
            <ul className="divide-y divide-[#E5DCCE]">
              {(list?.problems || []).map((p) => (
                <li key={p.slug}>
                  <Link
                    to={`/qa-sdet-dsa-sheet/problems/${p.slug}`}
                    className="flex flex-col gap-2 px-4 py-3 transition hover:bg-[#EFE8DC]/60 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[#1C1917]">{p.title}</span>
                        {p.isFavorite && <Star size={14} className="fill-amber-400 text-amber-500" />}
                        {p.status === 'solved' && (
                          <CheckCircle2 size={14} className="text-emerald-600" />
                        )}
                      </div>
                      <p className="mt-1 text-xs text-[#78716C]">
                        {p.category}
                        {p.companyTags?.length ? ` · ${p.companyTags.slice(0, 3).join(', ')}` : ''}
                      </p>
                    </div>
                    <span
                      className={`inline-flex w-fit rounded-full border px-2.5 py-0.5 text-xs font-semibold ${DIFF_TONE[p.difficulty]}`}
                    >
                      {p.difficulty}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-12">
            <RelatedLinks type="dsa" />
          </div>
        </div>
      </div>
    </>
  );
}
