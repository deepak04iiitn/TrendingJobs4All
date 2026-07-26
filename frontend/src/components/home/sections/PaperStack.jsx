import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { PAPER_STACK } from '../data/content';
import { Reveal, easeOut } from '../motion.jsx';
import { focusRing } from '../../../theme/tokens';

export default function PaperStack() {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const sheet = PAPER_STACK[active];

  return (
    <section className="home-paper relative overflow-hidden bg-[#F7F3EC] py-20 sm:py-28">
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

        <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
          <Reveal delay={0.08}>
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
                      className={`font-display mt-1 text-lg font-semibold tracking-tight transition-colors duration-300 sm:text-xl ${
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

          <Reveal delay={0.14} className="home-paper__stage relative mx-auto w-full max-w-lg lg:mx-0 lg:max-w-none">
            <div
              className="pointer-events-none absolute inset-x-4 top-4 bottom-0 rounded-sm border border-[#E5DCCE] bg-[#EFE8DC] shadow-sm"
              style={{ transform: 'rotate(2.5deg)' }}
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-x-2 top-2 bottom-0 rounded-sm border border-[#E5DCCE] bg-[#FFFDF8]"
              style={{ transform: 'rotate(-1.5deg)' }}
              aria-hidden
            />

            <AnimatePresence mode="wait">
              <motion.article
                key={sheet.id}
                initial={reduceMotion ? false : { opacity: 0, y: 16, rotate: -0.8 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -10, rotate: 0.6 }}
                transition={{ duration: 0.42, ease: easeOut }}
                className="relative rounded-sm border border-[#E5DCCE] bg-[#FFFDF8] p-8 shadow-[0_28px_50px_-28px_rgba(44,36,27,0.28)] sm:p-10"
              >
                <div className="home-paper__ruled pointer-events-none absolute inset-0" aria-hidden />
                <p className="relative text-[11px] font-semibold uppercase tracking-[0.2em] text-[#C4A574]">
                  {sheet.label}
                </p>
                <h3 className="font-display relative mt-3 text-3xl font-semibold tracking-tight text-[#1C1917] sm:text-4xl">
                  {sheet.title}
                </h3>
                <p className="relative mt-4 text-base leading-relaxed text-[#57534E]">{sheet.body}</p>

                <ul className="relative mt-8 flex flex-wrap gap-2">
                  {sheet.marks.map((mark) => (
                    <li
                      key={mark}
                      className="font-display border border-dashed border-[#C4A574]/55 px-3 py-1.5 text-sm italic text-[#6B5A48]"
                    >
                      {mark}
                    </li>
                  ))}
                </ul>

                <Link
                  to={sheet.cta.path}
                  className={`home-cta-primary relative mt-10 inline-flex items-center gap-2 rounded-full bg-[#2C241B] px-5 py-2.5 text-sm font-semibold text-[#FFFDF8] hover:bg-[#1A1510] ${focusRing}`}
                >
                  {sheet.cta.label}
                  <ArrowRight size={15} aria-hidden />
                </Link>
              </motion.article>
            </AnimatePresence>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
