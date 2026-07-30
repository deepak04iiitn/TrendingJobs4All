import { useEffect, useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { focusRing } from '../../theme/tokens';
import RelatedLinks from '../RelatedLinks';

const SIBLINGS = [
  { href: '/privacy-policy', label: 'Privacy' },
  { href: '/terms-of-service', label: 'Terms' },
  { href: '/cookie-policy', label: 'Cookies' },
];

/**
 * Shared editorial shell for legal documents.
 * Sticky TOC + open prose — not accordion cards.
 */
export default function LegalShell({
  eyebrow,
  title,
  lede,
  updated,
  sections,
  seo,
  currentPath,
  contactNote = 'Questions about this policy? We’re happy to help.',
}) {
  const rootId = useId();
  const [activeId, setActiveId] = useState(sections[0]?.id ?? null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPath]);

  useEffect(() => {
    const nodes = sections
      .map((s) => document.getElementById(s.id))
      .filter(Boolean);

    if (!nodes.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target?.id) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-20% 0px -55% 0px', threshold: [0.1, 0.4, 0.7] },
    );

    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, [sections]);

  return (
    <>
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        {seo.keywords && <meta name="keywords" content={seo.keywords} />}
        <meta property="og:title" content={seo.title} />
        <meta property="og:description" content={seo.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://route2hire.com${currentPath}`} />
        <meta property="og:image" content="https://route2hire.com/assets/Route2Hire.png" />
        <link rel="canonical" href={`https://route2hire.com${currentPath}`} />
      </Helmet>

      <div className="relative min-h-screen overflow-hidden bg-[#F7F3EC]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 55% 40% at 100% 0%, rgba(196,165,116,0.2), transparent 55%), radial-gradient(ellipse 40% 30% at 0% 20%, rgba(239,232,220,0.9), transparent 50%)',
          }}
        />

        <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-28 sm:px-6 sm:pt-32">
          {/* Sibling switcher */}
          <nav aria-label="Legal documents" className="mb-10 flex flex-wrap gap-2">
            {SIBLINGS.map((item) => {
              const active = item.href === currentPath;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`rounded-full px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] transition ${
                    active
                      ? 'bg-[#2C241B] text-[#FFFDF8]'
                      : `border border-[#E5DCCE] bg-[#FFFDF8]/70 text-[#6B5A48] hover:border-[#C4A574]/50 hover:bg-[#FFFDF8] ${focusRing}`
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <motion.header
            className="max-w-3xl border-b border-[#E5DCCE] pb-10"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#6B5A48]">
              {eyebrow}
            </p>
            <h1 className="font-display mt-3 text-[clamp(2.1rem,5vw,3.35rem)] font-semibold leading-[1.1] tracking-tight text-[#1C1917]">
              {title}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#57534E] sm:text-lg">
              {lede}
            </p>
            {updated && (
              <p className="mt-5 text-[12px] font-medium uppercase tracking-[0.12em] text-[#78716C]">
                Last updated · {updated}
              </p>
            )}
          </motion.header>

          <div className="mt-12 grid gap-12 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-16">
            {/* TOC */}
            <aside className="hidden lg:block">
              <div className="sticky top-28">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#6B5A48]">
                  On this page
                </p>
                <ol className="mt-4 space-y-1 border-l border-[#E5DCCE]">
                  {sections.map((section, i) => {
                    const isActive = activeId === section.id;
                    return (
                      <li key={section.id}>
                        <a
                          href={`#${section.id}`}
                          className={`-ml-px block border-l-2 py-1.5 pl-4 text-[13px] leading-snug transition ${
                            isActive
                              ? 'border-[#C4A574] font-medium text-[#1C1917]'
                              : `border-transparent text-[#78716C] hover:border-[#E5DCCE] hover:text-[#6B5A48] ${focusRing}`
                          }`}
                        >
                          <span className="mr-2 tabular-nums text-[#C4A574]">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          {section.title}
                        </a>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </aside>

            {/* Body */}
            <motion.article
              className="min-w-0"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="space-y-12">
                {sections.map((section, i) => (
                  <section
                    key={section.id}
                    id={section.id}
                    aria-labelledby={`${rootId}-${section.id}`}
                    className="scroll-mt-28"
                  >
                    <div className="flex items-baseline gap-3 border-b border-[#E5DCCE]/80 pb-3">
                      <span className="font-display text-sm tabular-nums text-[#C4A574]">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <h2
                        id={`${rootId}-${section.id}`}
                        className="font-display text-xl font-semibold text-[#1C1917] sm:text-2xl"
                      >
                        {section.title}
                      </h2>
                    </div>
                    <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-[#57534E] sm:text-base">
                      {Array.isArray(section.content)
                        ? section.content.map((para) => <p key={para.slice(0, 40)}>{para}</p>)
                        : <p>{section.content}</p>}
                      {section.bullets?.length > 0 && (
                        <ul className="space-y-2 pl-1">
                          {section.bullets.map((item) => (
                            <li key={item} className="flex gap-3">
                              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#C4A574]" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </section>
                ))}
              </div>

              <footer className="mt-16 border-t border-[#E5DCCE] pt-10">
                <p className="font-display text-xl font-semibold text-[#1C1917]">Need clarification?</p>
                <p className="mt-2 max-w-lg text-sm leading-relaxed text-[#57534E]">{contactNote}</p>
                <Link
                  to="/contact-us"
                  className={`mt-5 inline-flex items-center gap-2 rounded-xl bg-[#2C241B] px-5 py-3 text-sm font-medium text-[#FFFDF8] transition hover:bg-[#1A1510] ${focusRing}`}
                >
                  Contact us
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                <div className="mt-10">
                  <RelatedLinks type="legal" />
                </div>
              </footer>
            </motion.article>
          </div>
        </div>
      </div>
    </>
  );
}
