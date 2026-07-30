import { motion, useReducedMotion } from 'framer-motion';
import { PRINCIPLES } from '../data/content';
import { Reveal, easeOut } from '../../home/motion.jsx';

export default function AboutValues() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="overflow-hidden bg-[#EFE8DC] py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="mb-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6B5A48]">
            Principles
          </p>
          <h2 className="font-display mt-2 max-w-2xl text-3xl font-semibold tracking-tight text-[#1C1917] sm:text-4xl">
            Product principles behind every feature
          </h2>
        </Reveal>

        <div className="grid gap-4 md:grid-cols-3 md:gap-6">
          {PRINCIPLES.map((value, i) => (
            <motion.article
              key={value.id}
              initial={reduceMotion ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: easeOut }}
              className={`about-values__card relative overflow-hidden rounded-3xl border border-[#E5DCCE] bg-[#FFFDF8] p-8 ${
                i === 1 ? 'md:-translate-y-6' : ''
              }`}
            >
              <span
                className="font-display pointer-events-none absolute -right-2 -top-4 text-7xl font-semibold leading-none text-[#EFE8DC]"
                aria-hidden
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="font-display relative text-xl font-semibold tracking-tight text-[#1C1917]">
                {value.title}
              </h3>
              <p className="relative mt-3 text-sm leading-relaxed text-[#57534E]">
                {value.text}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
