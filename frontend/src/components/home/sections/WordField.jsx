import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { WORD_FIELD } from '../data/content';
import useHomeStats from '../hooks/useHomeStats';
import { Reveal, easeOut } from '../motion.jsx';
import { focusRing } from '../../../theme/tokens';

const WEIGHT = {
  xl: 'text-4xl sm:text-5xl md:text-6xl lg:text-7xl',
  lg: 'text-3xl sm:text-4xl md:text-5xl',
  md: 'text-2xl sm:text-3xl md:text-4xl',
  sm: 'text-xl sm:text-2xl md:text-3xl',
};

export default function WordField() {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(null);
  const { jobsCount, usersCount } = useHomeStats();

  return (
    <section id="word-field" className="home-wordfield relative overflow-hidden bg-[#EFE8DC] py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-10 flex flex-col gap-4 sm:mb-14 sm:flex-row sm:items-end sm:justify-between">
          <Reveal>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6B5A48]">
              The field
            </p>
            <h2 className="font-display mt-2 max-w-lg text-3xl font-semibold tracking-tight text-[#1C1917] sm:text-4xl md:text-5xl">
              Everything a QA or SDET engineer needs, in one place.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="max-w-xs text-sm leading-relaxed text-[#57534E]">
              Hover a word. Follow the one that matters today.
            </p>
          </Reveal>
        </div>

        <div className="home-wordfield__canvas relative hidden min-h-[28rem] md:block lg:min-h-[32rem]">
          {WORD_FIELD.map((word, i) => {
            const isActive = active === word.label;
            return (
              <motion.div
                key={word.label}
                initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: 0.08 + i * 0.05, duration: 0.55, ease: easeOut }}
                className="absolute"
                style={{ left: `${word.x}%`, top: `${word.y}%` }}
                onMouseEnter={() => setActive(word.label)}
                onMouseLeave={() => setActive(null)}
              >
                <Link
                  to={word.path}
                  style={{ transform: `rotate(${word.rotate}deg)` }}
                  className={`home-wordfield__word group relative block origin-left ${WEIGHT[word.weight]} ${focusRing}`}
                >
                  <span
                    className={`font-display font-semibold tracking-tight transition-colors duration-500 ease-out ${
                      isActive || !active ? 'text-[#1C1917]' : 'text-[#1C1917]/22'
                    }`}
                  >
                    {word.label}
                  </span>
                  <span
                    className={`absolute -bottom-1 left-0 h-[3px] origin-left bg-[#C4A574] transition-transform duration-500 ease-out ${
                      isActive ? 'w-full scale-x-100' : 'w-full scale-x-0'
                    }`}
                    aria-hidden
                  />
                  <span
                    className={`pointer-events-none absolute left-0 top-full mt-3 max-w-[14rem] text-left text-xs font-normal leading-snug tracking-normal text-[#57534E] transition-all duration-300 ease-out ${
                      isActive ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'
                    }`}
                  >
                    {word.blurb}
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <ul className="space-y-1 md:hidden">
          {WORD_FIELD.map((word, i) => (
            <motion.li
              key={word.label}
              initial={reduceMotion ? false : { opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04, duration: 0.45, ease: easeOut }}
            >
              <Link
                to={word.path}
                className={`group flex items-baseline justify-between gap-4 border-b border-[#E5DCCE] py-4 ${focusRing}`}
              >
                <span className="font-display text-2xl font-semibold tracking-tight text-[#1C1917] transition-colors duration-300 group-hover:text-[#6B5A48]">
                  {word.label}
                </span>
                <span className="text-xs text-[#78716C]">{word.blurb}</span>
              </Link>
            </motion.li>
          ))}
        </ul>

        <Reveal delay={0.05} className="home-wordfield__stat mt-14 flex flex-wrap gap-x-10 gap-y-4 border-t border-[#E5DCCE] pt-8 text-[#57534E]" as="dl">
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#78716C]">
              Live roles
            </dt>
            <dd className="font-display mt-1 text-2xl font-semibold text-[#1C1917]">{jobsCount}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#78716C]">
              Testers
            </dt>
            <dd className="font-display mt-1 text-2xl font-semibold text-[#1C1917]">{usersCount}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#78716C]">
              Community
            </dt>
            <dd className="font-display mt-1 text-2xl font-semibold text-[#1C1917]">3.5K+</dd>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
