import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { FEATURES } from '../data/content';
import { Reveal, easeOut } from '../motion.jsx';
import { focusRing } from '../../../theme/tokens';

export default function AlmanacIndex() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="home-almanac bg-[#EFE8DC] py-20 sm:py-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <Reveal className="mb-12 flex flex-col gap-3 border-b border-[#E5DCCE] pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6B5A48]">
              Almanac
            </p>
            <h2 className="font-display mt-2 text-3xl font-semibold tracking-tight text-[#1C1917] sm:text-4xl md:text-5xl">
              The full index
            </h2>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-[#57534E]">
            Every tool a QA or SDET engineer needs, from first application to signed offer.
          </p>
        </Reveal>

        <ol className="home-almanac__list">
          {FEATURES.map((feature, i) => {
            const num = String(i + 1).padStart(2, '0');
            return (
              <motion.li
                key={feature.id}
                initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px', amount: 0.3 }}
                transition={{ delay: Math.min(i * 0.045, 0.28), duration: 0.5, ease: easeOut }}
              >
                <Link
                  to={feature.path}
                  className={`home-almanac__row group grid grid-cols-[auto_1fr_auto] items-baseline gap-x-4 gap-y-2 border-b border-[#E5DCCE] py-6 sm:gap-x-8 sm:py-7 ${focusRing}`}
                >
                  <span className="font-display text-sm font-medium tabular-nums text-[#C4A574] sm:text-base">
                    {num}
                  </span>
                  <div className="min-w-0">
                    <span className="font-display text-xl font-semibold tracking-tight text-[#1C1917] transition-colors duration-300 group-hover:text-[#6B5A48] sm:text-2xl md:text-3xl">
                      {feature.title}
                    </span>
                    <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-[#78716C] opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 max-sm:opacity-100">
                      {feature.description}
                    </p>
                  </div>
                  <ArrowUpRight
                    size={20}
                    className="mt-1 shrink-0 text-[#E5DCCE] transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#C4A574]"
                    aria-hidden
                  />
                </Link>
              </motion.li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
