import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { INTRO } from '../data/content';
import { easeOut } from '../../home/motion.jsx';
import { focusRing } from '../../../theme/tokens';

export default function AboutIntro() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="about-intro bg-[#F7F3EC] pb-20 pt-28 sm:pb-24 sm:pt-32 lg:pt-36">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
          <motion.p
            initial={reduceMotion ? false : { opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: easeOut }}
            className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6B5A48]"
          >
            {INTRO.eyebrow}
          </motion.p>

          <motion.h1
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08, ease: easeOut }}
            className="font-display mt-4 max-w-3xl text-[clamp(2.25rem,5.5vw,4.25rem)] font-semibold leading-[1.08] tracking-tight text-[#1C1917]"
          >
            {INTRO.headline}
          </motion.h1>

          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.18, ease: easeOut }}
            className="mt-8 max-w-xl text-base leading-relaxed text-[#57534E] sm:text-lg"
          >
            {INTRO.lede}
          </motion.p>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.28, ease: easeOut }}
            className="mt-10 flex flex-wrap gap-4"
          >
            <Link
              to={INTRO.primaryCta.path}
              className={`about-cta-primary inline-flex items-center gap-2 rounded-full bg-[#2C241B] px-6 py-3 text-sm font-semibold text-[#FFFDF8] shadow-[0_14px_32px_-12px_rgba(44,36,27,0.4)] hover:bg-[#1A1510] ${focusRing}`}
            >
              {INTRO.primaryCta.label}
              <ArrowRight size={16} aria-hidden />
            </Link>
          </motion.div>
          </div>

          <motion.aside
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18, ease: easeOut }}
            className="about-intro__panel rounded-3xl border border-[#E5DCCE] bg-[#FFFDF8] p-7 sm:p-8"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6B5A48]">
              Core features
            </p>
            <ul className="mt-5 space-y-3">
              {[
                'Curated QA/SDET Jobs',
                'Interview Experiences',
                'Interview Question Bank',
                'QA/SDET DSA Sheet',
                'Salary + Resume builder',
              ].map((item, i) => (
                <motion.li
                  key={item}
                  initial={reduceMotion ? false : { opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.32 + i * 0.06, duration: 0.45, ease: easeOut }}
                  className="about-intro__feature flex items-center gap-3 border-b border-[#E5DCCE] pb-3 text-sm font-medium text-[#57534E] last:border-b-0 last:pb-0"
                >
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#C4A574]" aria-hidden />
                  <span>{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.aside>
        </div>
      </div>
    </section>
  );
}
