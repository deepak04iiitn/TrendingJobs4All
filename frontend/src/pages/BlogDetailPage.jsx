import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  Clock, Eye, ChevronLeft, Share2, Link2, MessageCircle, ArrowUp, ChevronDown, ChevronRight,
} from 'lucide-react';
import { toast } from 'react-toastify';
import BlogBlocks from '../components/blog/BlogBlocks';
import BlogComments from '../components/blog/BlogComments';
import BlogReactions from '../components/blog/BlogReactions';
import RelatedLinks from '../components/RelatedLinks';
import { fetchBlogBySlug } from '../lib/blog-api';
import { focusRing } from '../theme/tokens';

function fmtDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function useReaderScroll() {
  const [pct, setPct] = useState(0);
  const [pastHero, setPastHero] = useState(false);

  useEffect(() => {
    const fn = () => {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      setPct(max > 0 ? Math.min(100, (el.scrollTop / max) * 100) : 0);
      setPastHero(window.scrollY > 480);
    };
    fn();
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return { pct, pastHero };
}

function ChaptersRail({ items, activeId }) {
  if (!items?.length) return null;

  const jump = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <nav className="relative pl-5">
      <div className="absolute bottom-1 left-[7px] top-1 w-px bg-[#E5DCCE]" />
      <div className="space-y-4">
        {items.map((item) => {
          const active = activeId === item.id;
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => { e.preventDefault(); jump(item.id); }}
              className="group relative block"
            >
              <span
                className={`absolute -left-5 top-1 h-3 w-3 rounded-full border-2 transition-all duration-200 ${active ? 'scale-110 border-[#C4A574] bg-[#C4A574]' : 'border-[#E5DCCE] bg-[#FFFDF8] group-hover:border-[#C4A574]/50'}`}
              />
              <span
                className={`block truncate text-[12.5px] leading-snug transition-colors ${item.level === 3 ? 'pl-3 text-[11.5px]' : ''} ${active ? 'font-semibold text-[#6B5A48]' : 'text-[#78716C] group-hover:text-[#2C241B]'}`}
              >
                {item.text}
              </span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}

function FaqAccordion({ faq }) {
  const [open, setOpen] = useState(null);
  if (!faq?.length) return null;

  return (
    <section className="mt-14">
      <h2 className="font-display mb-6 text-xl font-semibold text-[#1C1917]">Frequently asked questions</h2>
      <div className="space-y-2">
        {faq.map((item, i) => (
          <div key={i} className="overflow-hidden rounded-xl border border-[#E5DCCE] bg-[#FFFDF8]">
            <button
              type="button"
              onClick={() => setOpen(open === i ? null : i)}
              className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-[#2C241B] hover:bg-[#F7F3EC] ${focusRing}`}
            >
              {item.q}
              <ChevronDown className={`h-4 w-4 shrink-0 text-[#78716C] transition-transform ${open === i ? 'rotate-180' : ''}`} />
            </button>
            {open === i && (
              <div className="border-t border-[#E5DCCE] px-4 py-3 text-sm leading-relaxed text-[#57534E]">
                {item.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function ReaderDock({ visible, pct, likes, dislikes, slug, onShare, onCopy, onJumpComments }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2"
        >
          <div className="flex items-center gap-1 rounded-full border border-[#E5DCCE] bg-[#FFFDF8]/95 p-1.5 shadow-lg backdrop-blur-md">
            <BlogReactions slug={slug} likes={likes} dislikes={dislikes} compact />
            <span className="mx-0.5 h-5 w-px bg-[#E5DCCE]" />
            <button type="button" onClick={onJumpComments} aria-label="Jump to discussion" className={`rounded-full p-2.5 text-[#6B5A48] hover:bg-[#F7F3EC] ${focusRing}`}>
              <MessageCircle className="h-4 w-4" />
            </button>
            <button type="button" onClick={onShare} aria-label="Share" className={`rounded-full p-2.5 text-[#6B5A48] hover:bg-[#F7F3EC] ${focusRing}`}>
              <Share2 className="h-4 w-4" />
            </button>
            <button type="button" onClick={onCopy} aria-label="Copy link" className={`rounded-full p-2.5 text-[#6B5A48] hover:bg-[#F7F3EC] ${focusRing}`}>
              <Link2 className="h-4 w-4" />
            </button>
            <span className="mx-0.5 h-5 w-px bg-[#E5DCCE]" />
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              aria-label="Back to top"
              className="relative flex h-9 w-9 items-center justify-center rounded-full"
              style={{ background: `conic-gradient(#C4A574 ${pct}%, #E5DCCE ${pct}%)` }}
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FFFDF8]">
                <ArrowUp className="h-3.5 w-3.5 text-[#6B5A48]" />
              </span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function BlogDetailPage() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeTocId, setActiveTocId] = useState('');
  const [tocOpen, setTocOpen] = useState(false);
  const { pct, pastHero } = useReaderScroll();

  const loadBlog = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchBlogBySlug(slug);
      setBlog(data.blog);
      setRelated(data.related || []);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    loadBlog();
  }, [loadBlog]);

  useEffect(() => {
    if (!blog?.toc?.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target?.id) setActiveTocId(visible[0].target.id);
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: [0, 0.25, 0.5] },
    );

    blog.toc.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [blog]);

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: blog.title, url });
      } catch {
        /* cancelled */
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied');
    }
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied');
  };

  const jumpComments = () => document.getElementById('comments')?.scrollIntoView({ behavior: 'smooth' });

  const jsonLd = useMemo(() => {
    if (!blog) return null;
    const base = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: blog.seo?.metaTitle || blog.title,
      description: blog.seo?.metaDescription || blog.excerpt,
      image: blog.coverImage || blog.seo?.ogImage,
      datePublished: blog.publishedAt,
      dateModified: blog.updatedAt,
      author: { '@type': 'Person', name: blog.author?.name || 'Route2Hire Team' },
      publisher: { '@type': 'Organization', name: 'Route2Hire' },
      mainEntityOfPage: `${window.location.origin}/blogs/${blog.slug}`,
    };

    const breadcrumb = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: window.location.origin },
        { '@type': 'ListItem', position: 2, name: 'Blogs', item: `${window.location.origin}/blogs` },
        { '@type': 'ListItem', position: 3, name: blog.title, item: `${window.location.origin}/blogs/${blog.slug}` },
      ],
    };

    const faqLd = blog.faq?.length
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: blog.faq.map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
          })),
        }
      : null;

    return { article: base, breadcrumb, faq: faqLd };
  }, [blog]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-[#F7F3EC] text-[#78716C]">Loading article...</div>;
  }

  if (error || !blog) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F7F3EC] px-4">
        <p className="text-[#57534E]">Article not found.</p>
        <Link to="/blogs" className="mt-4 text-[#C4A574] hover:underline">Back to blogs</Link>
      </div>
    );
  }

  const metaTitle = blog.seo?.metaTitle || blog.title;
  const metaDesc = blog.seo?.metaDescription || blog.excerpt;

  return (
    <div className="min-h-screen bg-[#F7F3EC]">
      <Helmet>
        <title>{metaTitle} | Route2Hire</title>
        <meta name="description" content={metaDesc} />
        <link rel="canonical" href={`${window.location.origin}/blogs/${blog.slug}`} />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDesc} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`${window.location.origin}/blogs/${blog.slug}`} />
        {(blog.coverImage || blog.seo?.ogImage) && (
          <meta property="og:image" content={blog.coverImage || blog.seo?.ogImage} />
        )}
        {jsonLd?.article && <script type="application/ld+json">{JSON.stringify(jsonLd.article)}</script>}
        {jsonLd?.breadcrumb && <script type="application/ld+json">{JSON.stringify(jsonLd.breadcrumb)}</script>}
        {jsonLd?.faq && <script type="application/ld+json">{JSON.stringify(jsonLd.faq)}</script>}
      </Helmet>

      <div className="fixed left-0 right-0 top-0 z-[60] h-[3px] bg-[#E5DCCE]/60">
        <div className="h-full bg-[#C4A574] transition-[width] duration-150" style={{ width: `${pct}%` }} />
      </div>

      <ReaderDock
        visible={pastHero}
        pct={pct}
        likes={blog.likes}
        dislikes={blog.dislikes}
        slug={blog.slug}
        onShare={share}
        onCopy={copyLink}
        onJumpComments={jumpComments}
      />

      <div className="mx-auto max-w-6xl px-4 pb-16 pt-28 sm:px-6 sm:pb-20 sm:pt-32">
        <Link to="/blogs" className={`mb-8 inline-flex items-center gap-1.5 text-sm text-[#6B5A48] hover:text-[#2C241B] ${focusRing}`}>
          <ChevronLeft className="h-4 w-4" /> All articles
        </Link>

        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_240px] lg:gap-12">
          <article>
            <header className="mb-10">
              <span className="inline-block rounded-full border border-[#E5DCCE] bg-[#FFFDF8] px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[#6B5A48]">
                {blog.category}
              </span>
              <h1 className="font-display mt-4 text-3xl font-semibold leading-tight text-[#1C1917] sm:text-4xl lg:text-[2.75rem]">
                {blog.title}
              </h1>
              {blog.subtitle && <p className="mt-3 text-lg text-[#78716C]">{blog.subtitle}</p>}
              <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-[#78716C]">
                <span>{blog.author?.name || 'Route2Hire Team'}</span>
                <span className="h-1 w-1 rounded-full bg-[#E5DCCE]" />
                <span>{fmtDate(blog.publishedAt)}</span>
                <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {blog.readingTime} min read</span>
                <span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {blog.views?.toLocaleString()} views</span>
              </div>
              {blog.coverImage && (
                <figure className="mt-8 overflow-hidden rounded-2xl border border-[#E5DCCE]">
                  <img src={blog.coverImage} alt={blog.coverImageAlt || blog.title} className="w-full object-cover" />
                </figure>
              )}
              <div className="mt-6">
                <BlogReactions slug={blog.slug} likes={blog.likes} dislikes={blog.dislikes} />
              </div>
            </header>

            {blog.toc?.length > 0 && (
              <div className="mb-8 lg:hidden">
                <button
                  type="button"
                  onClick={() => setTocOpen(!tocOpen)}
                  className={`flex w-full items-center justify-between rounded-xl border border-[#E5DCCE] bg-[#FFFDF8] px-4 py-3 text-sm font-medium text-[#2C241B] ${focusRing}`}
                >
                  Table of contents
                  <ChevronDown className={`h-4 w-4 transition-transform ${tocOpen ? 'rotate-180' : ''}`} />
                </button>
                {tocOpen && (
                  <div className="mt-2 rounded-xl border border-[#E5DCCE] bg-[#FFFDF8] p-4">
                    <ChaptersRail items={blog.toc} activeId={activeTocId} />
                  </div>
                )}
              </div>
            )}

            <BlogBlocks blocks={blog.content} />

            {blog.tags?.length > 0 && (
              <div className="mt-10 flex flex-wrap gap-2">
                {blog.tags.map((tag) => (
                  <Link
                    key={tag}
                    to={`/blogs?tag=${encodeURIComponent(tag)}`}
                    className="rounded-full bg-[#EFE8DC] px-3 py-1 text-xs text-[#6B5A48] hover:bg-[#E5DCCE]"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            <FaqAccordion faq={blog.faq} />

            {related.length > 0 && (
              <section className="mt-14 border-t border-[#E5DCCE] pt-10">
                <h2 className="font-display mb-6 text-xl font-semibold text-[#1C1917]">Related reading</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {related.map((r) => (
                    <Link
                      key={r.slug}
                      to={`/blogs/${r.slug}`}
                      className="group rounded-xl border border-[#E5DCCE] bg-[#FFFDF8] p-4 transition hover:border-[#C4A574]/40 hover:shadow-md"
                    >
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-[#6B5A48]">{r.category}</span>
                      <h3 className="font-display mt-1 line-clamp-2 text-base font-medium text-[#1C1917] group-hover:text-[#6B5A48]">{r.title}</h3>
                      <p className="mt-1 line-clamp-2 text-[13px] text-[#57534E]">{r.excerpt}</p>
                      <span className="mt-2 inline-flex items-center gap-1 text-xs text-[#C4A574]">
                        Read <ChevronRight className="h-3 w-3" />
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            <div className="mt-14 border-t border-[#E5DCCE] pt-10">
              <BlogComments slug={blog.slug} />
            </div>
          </article>

          {blog.toc?.length > 0 && (
            <aside className="hidden lg:block">
              <div className="sticky top-28 rounded-2xl border border-[#E5DCCE] bg-[#FFFDF8] p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#6B5A48]">On this page</p>
                <div className="mt-4 max-h-[calc(100vh-12rem)] overflow-y-auto">
                  <ChaptersRail items={blog.toc} activeId={activeTocId} />
                </div>
              </div>
            </aside>
          )}
        </div>

        <div className="mt-16">
          <RelatedLinks type="blog" />
        </div>
      </div>
    </div>
  );
}
