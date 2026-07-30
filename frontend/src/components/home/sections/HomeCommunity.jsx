import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Send, MessageCircle } from 'lucide-react';
import { COMMUNITY } from '../data/content';
import { Reveal, easeOut } from '../motion.jsx';
import { focusRing } from '../../../theme/tokens';

const ICONS = {
  Telegram: Send,
  WhatsApp: MessageCircle,
};

export default function HomeCommunity() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-[#EFE8DC] py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -right-24 top-0 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(196,165,116,0.18)_0%,transparent_70%)]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-end lg:gap-16">
          <Reveal>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6B5A48]">
              Community
            </p>
            <h2 className="font-display mt-2 text-3xl font-semibold tracking-tight text-[#1C1917] sm:text-4xl md:text-5xl">
              {COMMUNITY.title}
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-[#57534E]">
              {COMMUNITY.support}
            </p>
          </Reveal>

          <div className="border-t border-[#E5DCCE]">
            {COMMUNITY.links.map((link, i) => {
              const Icon = ICONS[link.name] ?? Send;
              return (
                <motion.a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.08 + i * 0.1, duration: 0.55, ease: easeOut }}
                  className={`home-channel-row group flex items-start gap-5 border-b border-[#E5DCCE] py-7 sm:gap-8 sm:py-8 ${focusRing}`}
                >
                  <span className="font-display mt-1 w-8 shrink-0 text-sm tabular-nums text-[#C4A574]">
                    {String(i + 1).padStart(2, '0')}
                  </span>

                  <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FFFDF8] text-[#2C241B] shadow-[0_8px_20px_-12px_rgba(44,36,27,0.25)] transition-colors duration-300 group-hover:bg-[#2C241B] group-hover:text-[#FFFDF8]">
                    <Icon size={18} aria-hidden />
                  </span>

                  <div className="min-w-0 flex-1 text-left">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <span className="font-display text-2xl font-semibold tracking-tight text-[#1C1917] transition-colors duration-300 group-hover:text-[#6B5A48] sm:text-3xl">
                        {link.name}
                      </span>
                      <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#78716C]">
                        {link.members}
                      </span>
                    </div>
                    <p className="mt-2 max-w-sm text-sm leading-relaxed text-[#57534E]">
                      {link.blurb}
                    </p>
                    <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#2C241B] transition-[gap] duration-300 group-hover:gap-2.5">
                      Join channel
                      <ArrowUpRight size={15} aria-hidden />
                    </span>
                  </div>
                </motion.a>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
