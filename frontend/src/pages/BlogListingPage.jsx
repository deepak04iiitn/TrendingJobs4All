import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useSearchParams, useParams } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  Clock, Eye, ThumbsUp, Search, ChevronRight, TrendingUp, ArrowRight, Feather,
} from 'lucide-react';
import RelatedLinks from '../components/RelatedLinks';
import { focusRing } from '../theme/tokens';
import { fetchBlogList, fetchBlogCategories } from '../lib/blog-api';

function fmtDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function fmtDateLong(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

const SORT_OPTIONS = [
  { id: 'latest', label: 'Latest' },
  { id: 'popular', label: 'Popular' },
  { id: 'liked', label: 'Liked' },
  { id: 'trending', label: 'Trending' },
];

const EMPTY_PATHS = [
  { label: 'Interview experiences', path: '/interview-experiences', blurb: 'Real QA & SDET stories' },
  { label: 'Salary insights', path: '/salary-structures', blurb: 'Transparent compensation data' },
  { label: 'DSA practice sheet', path: '/qa-sdet-dsa-sheet', blurb: 'Problems for test engineers' },
];

function BlogEmptyState({ filtered, onClearFilters }) {
  const reduceMotion = useReducedMotion();

  const fade = (delay = 0) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] },
        };

  if (filtered) {
    return (
      <motion.div
        {...fade()}
        className="relative overflow-hidden rounded-2xl border border-[#E5DCCE] bg-[#FFFDF8] px-6 py-16 text-center sm:px-10"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, #C4A57422 0%, transparent 45%), radial-gradient(circle at 80% 80%, #EFE8DC 0%, transparent 40%)',
          }}
        />
        <p className="relative text-[10px] font-semibold uppercase tracking-[0.22em] text-[#6B5A48]">
          No matches
        </p>
        <h2 className="font-display relative mt-3 text-2xl font-semibold leading-[1.2] text-[#1C1917] sm:text-3xl">
          Nothing in this shelf yet
        </h2>
        <p className="relative mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-[#57534E]">
          No articles match your current filters. Clear them to browse everything, or try a broader search.
        </p>
        <button
          type="button"
          onClick={onClearFilters}
          className={`relative mt-7 inline-flex items-center gap-2 rounded-xl border border-[#2C241B] bg-[#2C241B] px-5 py-2.5 text-sm font-medium text-[#FFFDF8] transition hover:bg-[#1A1510] ${focusRing}`}
        >
          Clear filters
          <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
      </motion.div>
    );
  }

  return (
    <motion.section
      {...fade()}
      className="relative overflow-hidden rounded-[1.75rem] border border-[#E5DCCE] bg-[#FFFDF8]"
      aria-label="No articles yet"
    >
      {/* Atmosphere */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 55% at 15% 10%, rgba(196,165,116,0.18), transparent 55%), radial-gradient(ellipse 55% 45% at 90% 85%, rgba(239,232,220,0.9), transparent 50%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="relative grid gap-10 px-6 py-14 sm:px-10 sm:py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-14 lg:px-14 lg:py-20">
        {/* Copy */}
        <div>
          <motion.div
            {...fade(0.05)}
            className="inline-flex items-center gap-2 text-[#6B5A48]"
          >
            <Feather className="h-4 w-4 text-[#C4A574]" aria-hidden />
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em]">First issue</span>
          </motion.div>

          <motion.h2
            {...fade(0.12)}
            className="font-display mt-4 text-3xl font-semibold leading-[1.15] text-[#1C1917] sm:text-4xl lg:text-[2.75rem]"
          >
            The press room
            <span className="mt-1 block text-[#C4A574]">is warming up</span>
          </motion.h2>

          <motion.p
            {...fade(0.2)}
            className="mt-5 max-w-lg text-[15px] leading-relaxed text-[#57534E] sm:text-base"
          >
            We&apos;re preparing thoughtful guides for QA engineers and SDETs — interview prep,
            career growth, and the craft of quality. Check back soon for the opening issue.
          </motion.p>

          <motion.div {...fade(0.28)} className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/interview-experiences"
              className={`inline-flex items-center gap-2 rounded-xl border border-[#2C241B] bg-[#2C241B] px-5 py-2.5 text-sm font-medium text-[#FFFDF8] transition hover:bg-[#1A1510] ${focusRing}`}
            >
              Browse interviews
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              to="/qa-sdet-dsa-sheet"
              className={`inline-flex items-center gap-2 rounded-xl border border-[#E5DCCE] bg-[#F7F3EC] px-5 py-2.5 text-sm font-medium text-[#6B5A48] transition hover:bg-[#EFE8DC] ${focusRing}`}
            >
              Practice DSA
            </Link>
          </motion.div>

          <motion.ul
            {...fade(0.36)}
            className="mt-10 grid gap-3 sm:grid-cols-3"
          >
            {EMPTY_PATHS.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`group block rounded-xl border border-transparent px-1 py-2 transition hover:border-[#E5DCCE] hover:bg-[#F7F3EC]/80 ${focusRing}`}
                >
                  <span className="flex items-center gap-1.5 text-sm font-medium text-[#1C1917] group-hover:text-[#6B5A48]">
                    {item.label}
                    <ChevronRight className="h-3.5 w-3.5 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" aria-hidden />
                  </span>
                  <span className="mt-0.5 block text-[12px] text-[#78716C]">{item.blurb}</span>
                </Link>
              </li>
            ))}
          </motion.ul>
        </div>

        {/* Visual: stacked blank pages */}
        <motion.div
          {...fade(0.18)}
          className="relative mx-auto flex h-[280px] w-full max-w-[340px] items-center justify-center lg:h-[320px] lg:max-w-none"
          aria-hidden
        >
          {/* Soft glow */}
          <div className="absolute h-40 w-40 rounded-full bg-[#C4A574]/20 blur-3xl" />

          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute w-[78%] max-w-[260px] overflow-hidden rounded-xl border border-[#E5DCCE] bg-[#FFFDF8] shadow-[0_18px_40px_-24px_rgba(44,36,27,0.35)]"
              style={{
                height: 200,
                zIndex: 3 - i,
                transformOrigin: '50% 100%',
              }}
              initial={reduceMotion ? false : { opacity: 0, y: 24, rotate: (i - 1) * 4 }}
              animate={{
                opacity: 1,
                y: i * 10,
                rotate: (i - 1) * 5.5,
                x: (i - 1) * 8,
              }}
              transition={{ duration: 0.65, delay: 0.22 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="border-b border-[#E5DCCE] bg-[#F7F3EC]/80 px-5 py-3">
                <div className="h-2 w-16 rounded-full bg-[#C4A574]/45" />
              </div>
              <div className="space-y-3 px-5 py-5">
                <div className="h-2.5 w-[88%] rounded-full bg-[#EFE8DC]" />
                <div className="h-2.5 w-[72%] rounded-full bg-[#EFE8DC]" />
                <div className="h-2.5 w-[80%] rounded-full bg-[#EFE8DC]" />
                <div className="mt-4 h-2.5 w-[60%] rounded-full bg-[#E5DCCE]" />
                <div className="h-2.5 w-[68%] rounded-full bg-[#E5DCCE]" />
              </div>
              {/* Ink blot accent on top sheet only */}
              {i === 0 && (
                <div className="absolute bottom-5 right-5 h-8 w-8 rounded-full bg-[#C4A574]/25 blur-[2px]" />
              )}
            </motion.div>
          ))}

          {/* Floating issue number */}
          <motion.span
            className="font-display absolute -right-1 top-6 z-10 text-[64px] font-semibold leading-none text-[#C4A574]/25 sm:text-[80px]"
            initial={reduceMotion ? false : { opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            00
          </motion.span>
        </motion.div>
      </div>
    </motion.section>
  );
}

function HeroCard({ blog }) {
  return (
    <Link to={`/blogs/${blog.slug}`} className="group block">
      <div className="relative overflow-hidden rounded-2xl border border-[#E5DCCE] bg-[#FFFDF8] transition-all duration-300 hover:border-[#C4A574]/40 hover:shadow-lg">
        {blog.coverImage && (
          <div className="aspect-[21/9] overflow-hidden border-b border-[#E5DCCE]">
            <img src={blog.coverImage} alt={blog.coverImageAlt || blog.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" />
          </div>
        )}
        <div className="p-8 sm:p-10">
          <div className="mb-5 flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#C4A574]/15 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#6B5A48]">
              <TrendingUp className="h-3 w-3" /> Featured
            </span>
            <span className="rounded-full border border-[#E5DCCE] bg-[#F7F3EC] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#6B5A48]">
              {blog.category}
            </span>
          </div>
          <h2 className="font-display text-3xl font-semibold leading-tight text-[#1C1917] transition-colors group-hover:text-[#6B5A48] sm:text-4xl">
            {blog.title}
          </h2>
          {blog.subtitle && <p className="mt-2 text-lg text-[#78716C]">{blog.subtitle}</p>}
          <p className="mt-4 line-clamp-3 text-base leading-relaxed text-[#57534E]">{blog.excerpt}</p>
          <div className="mt-6 flex flex-wrap items-center gap-4 text-[12px] text-[#78716C]">
            <span>{blog.author?.name || 'Route2Hire Team'}</span>
            <span className="h-1 w-1 rounded-full bg-[#E5DCCE]" />
            <span>{fmtDateLong(blog.publishedAt)}</span>
            <span className="h-1 w-1 rounded-full bg-[#E5DCCE]" />
            <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {blog.readingTime} min</span>
            <span className="inline-flex items-center gap-1"><Eye className="h-3 w-3" /> {blog.views?.toLocaleString()}</span>
            <span className="inline-flex items-center gap-1"><ThumbsUp className="h-3 w-3" /> {blog.likes}</span>
          </div>
          <div className="mt-6 flex items-center gap-1.5 text-sm font-medium text-[#6B5A48]">
            Read article <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </Link>
  );
}

function RowCard({ blog, index }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
      <Link to={`/blogs/${blog.slug}`} className="group flex items-start gap-5 border-b border-[#E5DCCE] py-5 transition-colors hover:bg-[#F7F3EC]/60">
        <span className="mt-0.5 w-7 shrink-0 font-mono text-[11px] font-bold tabular-nums text-[#C4A574]/50">
          {String(index + 1).padStart(2, '0')}
        </span>
        <div className="mt-1.5 w-0.5 shrink-0 self-stretch rounded-full bg-[#C4A574] opacity-0 transition-opacity group-hover:opacity-100" />
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-[#E5DCCE] bg-[#F7F3EC] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-[#6B5A48]">
              {blog.category}
            </span>
            {blog.tags?.slice(0, 2).map((tag) => (
              <span key={tag} className="rounded bg-[#EFE8DC] px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-[#78716C]">
                {tag}
              </span>
            ))}
          </div>
          <h3 className="font-display line-clamp-2 text-lg font-medium leading-snug text-[#1C1917] transition-colors group-hover:text-[#6B5A48]">
            {blog.title}
          </h3>
          <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-[#57534E]">{blog.excerpt}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-[#78716C]">
            <span>{blog.author?.name || 'Route2Hire Team'}</span>
            <span>{fmtDate(blog.publishedAt)}</span>
            <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {blog.readingTime} min</span>
            <span className="inline-flex items-center gap-1"><Eye className="h-3 w-3" /> {blog.views?.toLocaleString()}</span>
          </div>
        </div>
        <ChevronRight className="mt-2 h-4 w-4 shrink-0 text-[#C4A574] opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5" />
      </Link>
    </motion.div>
  );
}

export default function BlogListingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { category: categoryParam } = useParams();

  const [blogs, setBlogs] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);

  const search = searchParams.get('q') || '';
  const tag = searchParams.get('tag') || '';
  const sort = searchParams.get('sort') || 'latest';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const category = categoryParam || searchParams.get('category') || '';

  const [searchInput, setSearchInput] = useState(search);

  const loadBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = { sort, page, limit: 12 };
      if (category) params.category = category;
      if (tag) params.tag = tag;
      if (search) params.q = search;

      const data = await fetchBlogList(params);
      setBlogs(data.blogs || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);

      if (!category && !tag && !search && page === 1) {
        const featData = await fetchBlogList({ featured: 'true', limit: 4, sort: 'latest' });
        setFeatured(featData.blogs || []);
      } else {
        setFeatured([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [category, tag, search, sort, page]);

  useEffect(() => {
    loadBlogs();
  }, [loadBlogs]);

  useEffect(() => {
    fetchBlogCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      if (searchInput !== search) {
        const next = new URLSearchParams(searchParams);
        if (searchInput) next.set('q', searchInput);
        else next.delete('q');
        next.delete('page');
        setSearchParams(next);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput, search, searchParams, setSearchParams]);

  const showFeatured = featured.length > 0 && !category && !tag && !search;

  const jsonLd = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Route2Hire QA & SDET Blogs',
    description: 'Career guides, interview preparation, and professional insights for QA engineers and SDETs.',
    url: `${window.location.origin}/blogs`,
  }), []);

  const setSort = (id) => {
    const next = new URLSearchParams(searchParams);
    next.set('sort', id);
    next.delete('page');
    setSearchParams(next);
  };

  const setPageParam = (p) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(p));
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const hasActiveFilters = Boolean(category || tag || search);
  const isTrulyEmpty = !loading && total === 0 && !hasActiveFilters;
  const isFilteredEmpty = !loading && blogs.length === 0 && hasActiveFilters;

  const clearFilters = () => {
    setSearchInput('');
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-[#F7F3EC]">
      <Helmet>
        <title>QA & SDET Blogs | Interview Prep, Automation & Testing Guides — Route2Hire</title>
        <meta
          name="description"
          content="Career guides, interview preparation, and professional insights for QA engineers, SDETs, and software testing professionals."
        />
        <meta
          name="keywords"
          content="QA blog, SDET blog, software testing articles, QA career guide, SDET career tips, QA interview prep, automation testing career"
        />
        <link rel="canonical" href={`${window.location.origin}/blogs`} />
        <meta property="og:title" content="QA & SDET Blogs | Route2Hire" />
        <meta
          property="og:description"
          content="Career guides and interview preparation for QA engineers, SDETs, and software testing professionals."
        />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <div className="mx-auto max-w-6xl px-4 pb-16 pt-28 sm:px-6 sm:pb-20 sm:pt-32">
        <header className="mb-10 overflow-visible border-b border-[#E5DCCE] pb-8">
          <h1 className="font-display text-3xl font-semibold leading-[1.2] text-[#1C1917] sm:text-4xl">
            QA &amp; SDET guides for your next role
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-[#57534E]">
            Practical articles on interview preparation, career growth, and the skills QA engineers
            and SDETs need to land their next opportunity.
          </p>
        </header>

        {loading ? (
          <div className="py-20 text-center text-[#78716C]">Loading articles...</div>
        ) : isTrulyEmpty ? (
          <BlogEmptyState filtered={false} />
        ) : (
          <>
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2">
                <Link
                  to="/blogs"
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${!category ? 'border-[#2C241B] bg-[#2C241B] text-[#FFFDF8]' : 'border-[#E5DCCE] bg-[#FFFDF8] text-[#6B5A48] hover:bg-[#EFE8DC]'} ${focusRing}`}
                >
                  All
                </Link>
                {categories.map((c) => (
                  <Link
                    key={c.category}
                    to={`/blogs/category/${encodeURIComponent(c.category)}`}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${category === c.category ? 'border-[#2C241B] bg-[#2C241B] text-[#FFFDF8]' : 'border-[#E5DCCE] bg-[#FFFDF8] text-[#6B5A48] hover:bg-[#EFE8DC]'} ${focusRing}`}
                  >
                    {c.category} ({c.count})
                  </Link>
                ))}
              </div>

              <label className="relative block sm:w-64">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#78716C]" />
                <input
                  type="search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search articles..."
                  className={`w-full rounded-xl border border-[#E5DCCE] bg-[#FFFDF8] py-2 pl-9 pr-3 text-sm text-[#2C241B] outline-none placeholder:text-[#78716C] focus:border-[#C4A574] focus:ring-2 focus:ring-[#C4A574]/30 ${focusRing}`}
                />
              </label>
            </div>

            <div className="mb-6 flex flex-wrap gap-2">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSort(opt.id)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${sort === opt.id ? 'bg-[#2C241B] text-[#FFFDF8]' : 'bg-[#FFFDF8] text-[#6B5A48] border border-[#E5DCCE] hover:bg-[#EFE8DC]'} ${focusRing}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {isFilteredEmpty ? (
              <BlogEmptyState filtered onClearFilters={clearFilters} />
            ) : (
              <>
                {showFeatured && (
                  <section className="mb-12">
                    <HeroCard blog={featured[0]} />
                    {featured.length > 1 && (
                      <div className="mt-4 grid gap-4 sm:grid-cols-3">
                        {featured.slice(1).map((b) => (
                          <Link key={b.slug} to={`/blogs/${b.slug}`} className="group rounded-xl border border-[#E5DCCE] bg-[#FFFDF8] p-5 transition hover:border-[#C4A574]/40 hover:shadow-md">
                            <span className="text-[10px] font-semibold uppercase tracking-wide text-[#6B5A48]">{b.category}</span>
                            <h3 className="font-display mt-2 line-clamp-2 text-base font-medium text-[#1C1917] group-hover:text-[#6B5A48]">{b.title}</h3>
                            <p className="mt-2 line-clamp-2 text-[13px] text-[#57534E]">{b.excerpt}</p>
                          </Link>
                        ))}
                      </div>
                    )}
                  </section>
                )}

                <section>
                  <p className="mb-4 text-sm text-[#78716C]">{total} article{total === 1 ? '' : 's'} found</p>
                  {blogs.map((blog, i) => (
                    <RowCard key={blog.slug} blog={blog} index={i} />
                  ))}
                </section>

                {pages > 1 && (
                  <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Pagination">
                    {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPageParam(p)}
                        className={`h-9 min-w-9 rounded-lg px-3 text-sm font-medium transition ${p === page ? 'bg-[#2C241B] text-[#FFFDF8]' : 'border border-[#E5DCCE] bg-[#FFFDF8] text-[#6B5A48] hover:bg-[#EFE8DC]'} ${focusRing}`}
                      >
                        {p}
                      </button>
                    ))}
                  </nav>
                )}
              </>
            )}
          </>
        )}

        <div className="mt-16">
          <RelatedLinks type="blog" />
        </div>
      </div>
    </div>
  );
}
