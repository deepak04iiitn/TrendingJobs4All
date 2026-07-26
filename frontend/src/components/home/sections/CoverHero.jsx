import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowDown, ArrowRight } from 'lucide-react';
import { COVER } from '../data/content';
import { easeOut } from '../motion.jsx';
import { focusRing } from '../../../theme/tokens';

export default function CoverHero() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="home-cover relative flex min-h-[100svh] flex-col overflow-hidden bg-[#F7F3EC]">
      <div className="home-cover__grain pointer-events-none absolute inset-0" aria-hidden />
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="home-cover__wash absolute -left-[20%] top-[-10%] h-[70vmin] w-[70vmin] rounded-full bg-[radial-gradient(circle,rgba(196,165,116,0.28)_0%,transparent_70%)]" />
        <div className="absolute bottom-[-15%] right-[-10%] h-[55vmin] w-[55vmin] rounded-full bg-[radial-gradient(circle,rgba(107,90,72,0.1)_0%,transparent_72%)]" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col justify-between px-4 pb-10 pt-28 sm:px-6 sm:pb-14 sm:pt-32 lg:pt-36">
        <motion.h1
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: easeOut }}
          className="font-display select-none text-center text-[clamp(2.75rem,8.5vw,6.5rem)] font-semibold leading-[0.95] tracking-[-0.03em] text-[#1C1917]"
        >
          Route
          <span className="text-[#C4A574]">2</span>
          Hire
        </motion.h1>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, scaleX: 0.55 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.18, ease: easeOut }}
          className="mx-auto mt-8 flex w-full max-w-md items-center gap-3 sm:mt-10 sm:max-w-lg"
          aria-hidden
        >
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[#E5DCCE] to-[#C4A574]/70" />
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#C4A574]" />
          <span className="h-px flex-1 bg-gradient-to-l from-transparent via-[#E5DCCE] to-[#C4A574]/70" />
        </motion.div>

        <div className="mt-auto max-w-xl pt-14 sm:pt-16">
          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.22, ease: easeOut }}
            className="font-display text-2xl font-semibold tracking-tight text-[#1C1917] sm:text-3xl md:text-4xl"
          >
            {COVER.headline}
          </motion.p>
          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.32, ease: easeOut }}
            className="mt-3 max-w-md text-base leading-relaxed text-[#57534E] sm:text-lg"
          >
            {COVER.support}
          </motion.p>
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.42, ease: easeOut }}
            className="mt-7 flex flex-wrap items-center gap-3"
          >
            <Link
              to={COVER.primaryCta.path}
              className={`home-cta-primary inline-flex items-center gap-2 rounded-full bg-[#2C241B] px-6 py-3 text-sm font-semibold text-[#FFFDF8] shadow-[0_14px_32px_-12px_rgba(44,36,27,0.45)] hover:bg-[#1A1510] ${focusRing}`}
            >
              {COVER.primaryCta.label}
              <ArrowRight size={16} aria-hidden />
            </Link>
            <Link
              to={COVER.secondaryCta.path}
              className={`inline-flex items-center gap-2 text-sm font-semibold text-[#6B5A48] underline decoration-[#C4A574]/50 underline-offset-4 hover:text-[#2C241B] hover:decoration-[#C4A574] ${focusRing}`}
            >
              {COVER.secondaryCta.label}
            </Link>
          </motion.div>

          <motion.a
            href="#word-field"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.75, duration: 0.5, ease: easeOut }}
            className={`mt-12 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#78716C] hover:text-[#2C241B] ${focusRing}`}
          >
            Turn the page
            <ArrowDown size={14} className="home-cover__arrow" aria-hidden />
          </motion.a>
        </div>
      </div>
    </section>
  );
}
