import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { PAPER_STACK } from '../data/content';
import { Reveal, easeOut } from '../motion.jsx';
import { focusRing } from '../../../theme/tokens';

const AUTO_MS = 3000;

export default function PaperStack() {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = PAPER_STACK.length;
  const sheet = PAPER_STACK[active];

  useEffect(() => {
    if (!total || reduceMotion || paused) return undefined;
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % total);
    }, AUTO_MS);
    return () => window.clearInterval(id);
  }, [total, reduceMotion, paused]);

  return (
    <section
      className="home-paper relative overflow-hidden bg-[#F7F3EC] py-20 sm:py-28"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false);
      }}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="mb-12 max-w-xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6B5A48]">
            The desk
          </p>
          <h2 className="font-display mt-2 text-3xl font-semibold tracking-tight text-[#1C1917] sm:text-4xl md:text-5xl">
            Four chapters. One career.
          </h2>
          <p className="mt-3 text-[#57534E]">
            Flip the sheets - find roles, study interviews, practice DSA, walk in prepared.
          </p>
        </Reveal>

        <div className="grid min-w-0 items-start gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
          <Reveal delay={0.08} className="min-w-0">
            <nav
              aria-label="Platform chapters"
              className="flex flex-row gap-2 overflow-x-auto pb-2 lg:flex-col lg:gap-0 lg:overflow-visible lg:pb-0"
            >
              {PAPER_STACK.map((item, i) => {
                const selected = i === active;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActive(i)}
                    aria-current={selected ? 'true' : undefined}
                    className={`home-paper__tab group relative flex min-w-[9.5rem] shrink-0 flex-col border-l-2 px-4 py-3 text-left lg:min-w-0 ${
                      selected
                        ? 'border-[#C4A574] bg-[#EFE8DC]/80'
                        : 'border-[#E5DCCE] hover:border-[#C4A574]/50 hover:bg-[#FFFDF8]/60'
                    } ${focusRing}`}
                  >
                    <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#78716C]">
                      {item.label}
                    </span>
                    <span
                      className={`font-display mt-1 text-base font-semibold tracking-tight transition-colors duration-300 sm:text-lg lg:text-xl ${
                        selected ? 'text-[#1C1917]' : 'text-[#6B5A48]'
                      }`}
                    >
                      {item.title}
                    </span>
                  </button>
                );
              })}
            </nav>
          </Reveal>

          <Reveal delay={0.14} className="home-paper__stage relative mx-auto w-full min-w-0 max-w-full overflow-hidden lg:mx-0">
            <div
              className="pointer-events-none absolute inset-x-3 top-3 bottom-0 hidden rounded-sm border border-[#E5DCCE] bg-[#EFE8DC] shadow-sm sm:block"
              style={{ transform: 'rotate(2.5deg)' }}
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-x-1.5 top-1.5 bottom-0 hidden rounded-sm border border-[#E5DCCE] bg-[#FFFDF8] sm:block"
              style={{ transform: 'rotate(-1.5deg)' }}
              aria-hidden
            />

            <AnimatePresence mode="wait">
              <motion.article
                key={sheet.id}
                initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
                transition={{ duration: 0.42, ease: easeOut }}
                className="relative min-w-0 max-w-full overflow-hidden rounded-sm border border-[#E5DCCE] bg-[#FFFDF8] p-5 shadow-[0_28px_50px_-28px_rgba(44,36,27,0.28)] sm:p-8 md:p-10"
                aria-live="polite"
              >
                <div className="home-paper__ruled pointer-events-none absolute inset-0" aria-hidden />
                <p className="relative text-[11px] font-semibold uppercase tracking-[0.2em] text-[#C4A574]">
                  {sheet.label}
                </p>
                <h3 className="font-display relative mt-3 break-words text-2xl font-semibold tracking-tight text-[#1C1917] sm:text-3xl md:text-4xl">
                  {sheet.title}
                </h3>
                <p className="relative mt-4 break-words text-sm leading-relaxed text-[#57534E] sm:text-base">
                  {sheet.body}
                </p>

                <ul className="relative mt-6 flex min-w-0 flex-wrap gap-2 sm:mt-8">
                  {sheet.marks.map((mark) => (
                    <li
                      key={mark}
                      className="font-display max-w-full min-w-0 break-words border border-dashed border-[#C4A574]/55 px-2.5 py-1.5 text-xs italic leading-snug text-[#6B5A48] sm:px-3 sm:text-sm"
                    >
                      {mark}
                    </li>
                  ))}
                </ul>

                <Link
                  to={sheet.cta.path}
                  className={`home-cta-primary relative mt-8 inline-flex max-w-full items-center gap-2 rounded-full bg-[#2C241B] px-4 py-2.5 text-sm font-semibold text-[#FFFDF8] hover:bg-[#1A1510] sm:mt-10 sm:px-5 ${focusRing}`}
                >
                  <span className="min-w-0 break-words">{sheet.cta.label}</span>
                  <ArrowRight size={15} className="shrink-0" aria-hidden />
                </Link>
              </motion.article>
            </AnimatePresence>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
