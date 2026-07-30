import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { INVITE } from '../data/content';
import { easeOut } from '../../home/motion.jsx';
import { focusRing } from '../../../theme/tokens';

export default function AboutInvite() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="about-invite relative overflow-hidden py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: easeOut }}
          className="about-invite__card group relative grid overflow-hidden rounded-[2rem] border border-[#E5DCCE] bg-[#FFFDF8] lg:grid-cols-2"
        >
          <div className="relative p-8 sm:p-10 lg:p-12">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6B5A48]">
              Your move
            </p>
            <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight text-[#1C1917] sm:text-4xl">
              {INVITE.title}
            </h2>
            <p className="mt-4 max-w-md text-[#57534E]">{INVITE.text}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to={INVITE.cta.path}
                className={`about-cta-primary inline-flex items-center gap-2 rounded-full bg-[#2C241B] px-6 py-3 text-sm font-semibold text-[#FFFDF8] hover:bg-[#1A1510] ${focusRing}`}
              >
                {INVITE.cta.label}
                <ArrowRight size={16} aria-hidden />
              </Link>
              <Link
                to={INVITE.link.path}
                className={`inline-flex items-center gap-2 rounded-full border border-[#E5DCCE] px-6 py-3 text-sm font-semibold text-[#2C241B] transition hover:bg-[#EFE8DC] ${focusRing}`}
              >
                {INVITE.link.label}
              </Link>
            </div>
          </div>

          <div
            className="relative hidden min-h-[16rem] bg-[#EFE8DC] lg:block"
            aria-hidden
          >
            <p className="font-display absolute bottom-8 right-8 max-w-[14rem] text-right text-4xl font-semibold leading-tight tracking-tight text-[#1C1917]/20 transition-opacity duration-500 group-hover:opacity-30">
              Built for testers
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
