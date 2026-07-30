import { motion, useReducedMotion } from 'framer-motion';
import { FAQS } from '../data/content';
import { Reveal, easeOut } from '../motion.jsx';

export default function HomeFaq() {
  const reduceMotion = useReducedMotion();

  return (
    <section id="faq" className="bg-[#EFE8DC] py-20 sm:py-28">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <Reveal className="mb-12 max-w-lg">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6B5A48]">
            Ledger
          </p>
          <h2 className="font-display mt-2 text-3xl font-semibold tracking-tight text-[#1C1917] sm:text-4xl">
            Questions, answered in plain ink
          </h2>
        </Reveal>

        <div className="divide-y divide-[#E5DCCE] border-y border-[#E5DCCE]">
          {FAQS.map((item, index) => (
            <motion.details
              key={item.q}
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ delay: index * 0.05, duration: 0.5, ease: easeOut }}
              className="group"
            >
              <summary className="flex cursor-pointer list-none items-start gap-5 py-6 text-left sm:gap-8">
                <span className="font-display mt-0.5 w-8 shrink-0 text-sm tabular-nums text-[#C4A574]">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="font-display flex-1 text-lg font-semibold tracking-tight text-[#1C1917] sm:text-xl">
                  {item.q}
                </span>
                <span
                  aria-hidden
                  className="mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center text-lg font-light text-[#6B5A48] transition-transform duration-300 ease-out group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <div className="pb-6 pl-[3.25rem] pr-8 text-sm leading-relaxed text-[#57534E] sm:pl-[4.5rem]">
                {item.a}
              </div>
            </motion.details>
          ))}
        </div>
      </div>
    </section>
  );
}
