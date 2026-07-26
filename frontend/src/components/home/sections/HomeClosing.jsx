import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { CLOSING } from '../data/content';
import { easeOut } from '../motion.jsx';
import { focusRing } from '../../../theme/tokens';

export default function HomeClosing() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="home-colophon relative overflow-hidden bg-[#F7F3EC] py-24 sm:py-32">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute right-[-10%] top-[-20%] h-[45vmin] w-[45vmin] rounded-full bg-[radial-gradient(circle,rgba(196,165,116,0.22)_0%,transparent_70%)]" />
        <div className="absolute left-[-12%] bottom-[-15%] h-[38vmin] w-[38vmin] rounded-full bg-[radial-gradient(circle,rgba(107,90,72,0.08)_0%,transparent_72%)]" />
      </div>

      <div className="relative mx-auto max-w-2xl px-4 text-center sm:px-6">
        <motion.p
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: easeOut }}
          className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6B5A48]"
        >
          Colophon
        </motion.p>

        <motion.h2
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.08, duration: 0.6, ease: easeOut }}
          className="font-display mt-5 text-3xl font-semibold tracking-tight text-[#1C1917] sm:text-4xl md:text-5xl"
        >
          {CLOSING.title}
        </motion.h2>
        <motion.p
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.14, duration: 0.55, ease: easeOut }}
          className="mx-auto mt-4 max-w-md text-[#57534E]"
        >
          {CLOSING.support}
        </motion.p>
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.22, duration: 0.55, ease: easeOut }}
        >
          <Link
            to={CLOSING.cta.path}
            className={`home-cta-primary mt-10 inline-flex items-center gap-2 rounded-full bg-[#2C241B] px-7 py-3.5 text-sm font-semibold text-[#FFFDF8] shadow-[0_18px_36px_-14px_rgba(44,36,27,0.4)] hover:bg-[#1A1510] ${focusRing}`}
          >
            {CLOSING.cta.label}
            <ArrowRight size={16} aria-hidden />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
