import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Reveal, easeOut } from '../motion.jsx';
import { focusRing } from '../../../theme/tokens';

const AUTO_MS = 5200;

export default function HomeTestimonials() {
  const reduceMotion = useReducedMotion();
  const [testimonials, setTestimonials] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const directionRef = useRef(1);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch('/backend/testimonials/getTestimonials');
        const data = await response.json();
        if (!cancelled) setTestimonials(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching testimonials:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const total = testimonials.length;

  const go = (dir) => {
    if (!total) return;
    directionRef.current = dir;
    setIndex((i) => (i + dir + total) % total);
  };

  useEffect(() => {
    if (!total || reduceMotion) return undefined;
    const id = window.setInterval(() => {
      directionRef.current = 1;
      setIndex((i) => (i + 1) % total);
    }, AUTO_MS);
    return () => window.clearInterval(id);
  }, [total, reduceMotion]);

  if (loading || !total) return null;

  const current = testimonials[index];
  const dir = directionRef.current;

  return (
    <section className="home-voices relative overflow-hidden bg-[#F7F3EC] py-20 sm:py-28">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <Reveal>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6B5A48]">
            Voices
          </p>
          <h2 className="font-display mt-2 text-3xl font-semibold tracking-tight text-[#1C1917] sm:text-4xl">
            In their own words
          </h2>
        </Reveal>

        <div className="relative mt-12 min-h-[16rem] sm:min-h-[18rem]" aria-live="polite">
          <span
            className="font-display pointer-events-none absolute -left-2 -top-6 text-[6rem] leading-none text-[#EFE8DC] sm:-left-4 sm:text-[7.5rem]"
            aria-hidden
          >
            “
          </span>

          <AnimatePresence mode="wait" custom={dir}>
            <motion.blockquote
              key={current._id || current.name || index}
              custom={dir}
              initial={
                reduceMotion
                  ? false
                  : { opacity: 0, x: dir > 0 ? 28 : -28 }
              }
              animate={{ opacity: 1, x: 0 }}
              exit={
                reduceMotion
                  ? undefined
                  : { opacity: 0, x: dir > 0 ? -28 : 28 }
              }
              transition={{ duration: 0.5, ease: easeOut }}
              className="relative"
            >
              <p className="font-display text-xl font-medium leading-relaxed tracking-tight text-[#1C1917] sm:text-2xl md:text-[1.75rem] md:leading-relaxed">
                {current.testimonial}
              </p>
              <footer className="mt-8 flex items-center gap-4 border-t border-[#E5DCCE] pt-6">
                {current.profileImage ? (
                  <img
                    src={current.profileImage}
                    alt=""
                    width="48"
                    height="48"
                    loading="lazy"
                    className="h-12 w-12 rounded-full border border-[#E5DCCE] object-cover"
                  />
                ) : null}
                <div>
                  <cite className="not-italic text-sm font-semibold text-[#1C1917]">
                    {current.name}
                  </cite>
                  <p className="text-xs text-[#78716C]">
                    {current.role}
                    {current.organization ? ` · ${current.organization}` : ''}
                  </p>
                </div>
              </footer>
            </motion.blockquote>
          </AnimatePresence>
        </div>

        <Reveal delay={0.1} className="mt-8 flex items-center gap-3">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous testimonial"
            className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#E5DCCE] bg-[#FFFDF8] text-[#2C241B] hover:border-[#C4A574]/60 hover:bg-[#EFE8DC] ${focusRing}`}
          >
            <ChevronLeft size={18} aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next testimonial"
            className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#E5DCCE] bg-[#FFFDF8] text-[#2C241B] hover:border-[#C4A574]/60 hover:bg-[#EFE8DC] ${focusRing}`}
          >
            <ChevronRight size={18} aria-hidden />
          </button>
          <span className="ml-2 font-display text-sm tabular-nums text-[#78716C]">
            {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>
        </Reveal>
      </div>
    </section>
  );
}
