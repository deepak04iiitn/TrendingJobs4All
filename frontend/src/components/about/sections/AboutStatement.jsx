import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { SNAPSHOT, STATS } from '../data/content';
import { Reveal, easeOut } from '../../home/motion.jsx';

function formatCount(count) {
  return count >= 1000 ? `${(count / 1000).toFixed(1)}K+` : `${count}+`;
}

export default function AboutStatement() {
  const reduceMotion = useReducedMotion();
  const [jobsCount, setJobsCount] = useState('2500+');
  const [usersCount, setUsersCount] = useState('1000+');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [llmsRes, usersRes] = await Promise.all([
          fetch('/llms-stats'),
          fetch('/llms/users-count'),
        ]);
        if (!cancelled && llmsRes.ok) {
          const data = await llmsRes.json();
          if (data?.stats?.dynamicItems?.jobs) {
            setJobsCount(formatCount(data.stats.dynamicItems.jobs));
          }
        }
        if (!cancelled && usersRes.ok) {
          const data = await usersRes.json();
          if (data?.usersCount !== undefined) {
            setUsersCount(formatCount(data.usersCount));
          }
        }
      } catch {
        /* keep fallbacks */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const resolved = STATS.map((s) => {
    if (s.key === 'jobs') return { ...s, value: jobsCount };
    if (s.key === 'users') return { ...s, value: usersCount };
    return { ...s, value: s.value ?? s.fallback };
  });

  return (
    <section className="relative bg-[#EFE8DC] py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-8 rounded-[2rem] border border-[#E5DCCE] bg-[#FFFDF8] p-8 sm:p-10 lg:grid-cols-[1fr_1.05fr] lg:gap-10">
          <Reveal>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6B5A48]">
              Snapshot
            </p>
            <h2 className="font-display mt-3 text-3xl font-semibold tracking-tight text-[#1C1917] sm:text-4xl">
              {SNAPSHOT.title}
            </h2>
            <ul className="mt-6 space-y-3">
              {SNAPSHOT.points.map((point, i) => (
                <motion.li
                  key={point}
                  initial={reduceMotion ? false : { opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-20px' }}
                  transition={{ delay: i * 0.07, duration: 0.45, ease: easeOut }}
                  className="flex gap-3 text-sm leading-relaxed text-[#57534E] sm:text-base"
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#C4A574]" aria-hidden />
                  <span>{point}</span>
                </motion.li>
              ))}
            </ul>
          </Reveal>

          <dl className="grid grid-cols-2 gap-5 self-end">
            {resolved.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-20px' }}
                transition={{ delay: 0.1 + i * 0.08, duration: 0.5, ease: easeOut }}
                className="about-stat rounded-2xl border border-[#E5DCCE] bg-[#F7F3EC] px-4 py-5 sm:px-5"
              >
                <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#78716C]">
                  {stat.label}
                </dt>
                <dd className="font-display mt-2 text-3xl font-semibold tabular-nums text-[#1C1917] sm:text-4xl">
                  {stat.value}
                </dd>
              </motion.div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
