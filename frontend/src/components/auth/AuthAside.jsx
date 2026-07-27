import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { easeOut } from '../home/motion.jsx';
import { focusRing } from '../../theme/tokens';

export default function AuthAside({ content }) {
  const reduceMotion = useReducedMotion();

  return (
    <aside className="auth-aside relative flex flex-col justify-between overflow-hidden border-b border-[#E5DCCE] bg-[#EFE8DC] p-8 sm:p-10 lg:border-b-0 lg:border-r lg:p-12">
      <div className="relative">
        <motion.p
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easeOut }}
          className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6B5A48]"
        >
          {content.eyebrow}
        </motion.p>

        <motion.h1
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.06, ease: easeOut }}
          className="font-display mt-4 max-w-sm text-3xl font-semibold leading-tight tracking-tight text-[#1C1917] sm:text-4xl"
        >
          {content.title}
        </motion.h1>

        <motion.p
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.14, ease: easeOut }}
          className="mt-5 max-w-sm text-sm leading-relaxed text-[#57534E] sm:text-base"
        >
          {content.lede}
        </motion.p>

        <ul className="mt-8 space-y-3">
          {content.benefits.map((item, i) => (
            <motion.li
              key={item.id}
              initial={reduceMotion ? false : { opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.22 + i * 0.07, duration: 0.45, ease: easeOut }}
              className="auth-benefit flex items-start gap-3 rounded-2xl border border-[#E5DCCE] bg-[#FFFDF8] px-4 py-3.5 text-sm text-[#57534E]"
            >
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#C4A574]" aria-hidden />
              <span>{item.text}</span>
            </motion.li>
          ))}
        </ul>
      </div>

      <motion.div
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5, ease: easeOut }}
        className="relative mt-10 hidden lg:block"
      >
        <Link to="/" className={`inline-flex items-center gap-3 ${focusRing}`}>
          <img
            src="/assets/Route2Hire.png"
            alt="Route2Hire - QA and SDET career platform"
            className="auth-logo h-12 w-12 object-contain"
          />
          <span className="font-display text-lg font-semibold tracking-tight text-[#1C1917]">
            Route<span className="text-[#C4A574]">2</span>Hire
          </span>
        </Link>
      </motion.div>
    </aside>
  );
}
