import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { TOOLKIT_PHASES } from '../data/content';
import { Reveal, easeOut } from '../../home/motion.jsx';
import { focusRing } from '../../../theme/tokens';

export default function AboutBento() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="bg-[#F7F3EC] py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="mb-14 max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6B5A48]">
            Platform toolkit
          </p>
          <h2 className="font-display mt-2 text-3xl font-semibold tracking-tight text-[#1C1917] sm:text-4xl">
            Every surface, organized by career stage
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[#57534E] sm:text-base">
            Route2Hire groups QA and SDET tools into three clear phases - discover opportunities,
            prepare for interviews and grow your long-term profile.
          </p>
        </Reveal>

        <div className="grid gap-5 lg:grid-cols-3 lg:gap-6">
          {TOOLKIT_PHASES.map((group, groupIndex) => (
            <motion.article
              key={group.id}
              initial={reduceMotion ? false : { opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: groupIndex * 0.1, duration: 0.55, ease: easeOut }}
              className={`about-toolkit__phase relative flex flex-col overflow-hidden rounded-[1.75rem] border border-[#E5DCCE] bg-[#FFFDF8] ${
                groupIndex === 1 ? 'lg:-translate-y-4' : ''
              }`}
            >
              <div className="about-toolkit__phase-head border-b border-[#E5DCCE] px-6 py-7 sm:px-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C4A574]">
                      Phase {group.phase}
                    </p>
                    <h3 className="font-display mt-1 text-2xl font-semibold tracking-tight text-[#1C1917]">
                      {group.title}
                    </h3>
                  </div>
                  <span
                    className="font-display text-5xl font-semibold leading-none text-[#EFE8DC]"
                    aria-hidden
                  >
                    {group.phase}
                  </span>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-[#57534E]">{group.lede}</p>
              </div>

              <ul className="flex flex-1 flex-col">
                {group.items.map((item, itemIndex) => (
                  <li key={item.id} className="border-b border-[#E5DCCE] last:border-b-0">
                    <Link
                      to={item.path}
                      className={`about-toolkit__link group flex items-start justify-between gap-4 px-6 py-5 sm:px-7 ${focusRing}`}
                    >
                      <div className="min-w-0">
                        <p className="font-display text-lg font-semibold tracking-tight text-[#1C1917] transition-colors duration-300 group-hover:text-[#6B5A48]">
                          {item.title}
                        </p>
                        <p className="mt-1 text-sm text-[#78716C]">{item.subtitle}</p>
                      </div>
                      <span className="mt-1 flex shrink-0 items-center gap-1 text-[#C4A574]">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                          Open
                        </span>
                        <ArrowUpRight
                          size={18}
                          className="text-[#E5DCCE] transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#C4A574]"
                          aria-hidden
                        />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
