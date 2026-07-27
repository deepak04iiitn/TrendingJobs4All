import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { FEATURE_MATRIX } from '../data/content';
import { Reveal, easeOut } from '../../home/motion.jsx';
import { focusRing } from '../../../theme/tokens';

export default function AboutTimeline() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="bg-[#F7F3EC] py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="mb-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6B5A48]">
            Core features
          </p>
          <h2 className="font-display mt-2 max-w-3xl text-3xl font-semibold tracking-tight text-[#1C1917] sm:text-4xl md:text-5xl">
            Built for every stage of your QA and SDET career
          </h2>
          <p className="mt-3 max-w-2xl text-[#57534E]">
            Each tool targets a real testing career challenge - from finding roles to landing the offer.
          </p>
        </Reveal>

        <Reveal delay={0.05}>
          <div className="overflow-hidden rounded-3xl border border-[#E5DCCE] bg-[#FFFDF8]">
          <div className="hidden grid-cols-[1.1fr_1fr_1.7fr_auto] border-b border-[#E5DCCE] bg-[#EFE8DC] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6B5A48] md:grid">
            <span>Feature</span>
            <span>Best for</span>
            <span>Value delivered</span>
            <span className="text-right">Open</span>
          </div>

          <ol>
            {FEATURE_MATRIX.map((item, i) => (
              <motion.li
                key={item.id}
                initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: i * 0.07, duration: 0.45, ease: easeOut }}
                className="border-b border-[#E5DCCE] last:border-b-0"
              >
                <Link
                  to={item.path}
                  className={`about-matrix__row group grid gap-3 px-5 py-5 hover:bg-[#F7F3EC] md:grid-cols-[1.1fr_1fr_1.7fr_auto] md:items-center md:gap-4 md:px-6 ${focusRing}`}
                >
                  <span className="font-display text-lg font-semibold tracking-tight text-[#1C1917] transition-colors duration-300 group-hover:text-[#6B5A48] md:text-xl">
                    {item.title}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#78716C]">
                    {item.focus}
                  </span>
                  <span className="text-sm leading-relaxed text-[#57534E]">
                    {item.description}
                  </span>
                  <span className="justify-self-start text-[#C4A574] transition-all duration-300 md:justify-self-end md:group-hover:translate-x-0.5 md:group-hover:-translate-y-0.5">
                    <ArrowUpRight size={18} aria-hidden />
                  </span>
                </Link>
              </motion.li>
            ))}
          </ol>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
