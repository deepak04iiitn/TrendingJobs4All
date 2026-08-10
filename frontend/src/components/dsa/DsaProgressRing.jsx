import { useEffect, useState } from 'react';
import { motion, useSpring, useTransform, animate } from 'framer-motion';

/**
 * Animated circular progress: solved / total.
 * Uses brand parchment / espresso / bronze palette.
 */
export default function DsaProgressRing({
  solved = 0,
  total = 0,
  size = 160,
  strokeWidth = 10,
  className = '',
}) {
  const pct = total > 0 ? Math.min(100, Math.round((solved / total) * 100)) : 0;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const [displayPct, setDisplayPct] = useState(0);
  const spring = useSpring(0, { stiffness: 60, damping: 18, mass: 0.8 });
  const offset = useTransform(spring, (v) => circumference * (1 - v / 100));

  useEffect(() => {
    spring.set(pct);
    const controls = animate(0, pct, {
      duration: 1.15,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplayPct(Math.round(v)),
    });
    return () => controls.stop();
  }, [pct, spring]);

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${solved} of ${total} problems solved, ${pct}%`}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#EFE8DC"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#C4A574"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          style={{ strokeDashoffset: offset }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <motion.span
          key={`${solved}-${total}`}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-3xl font-semibold tabular-nums leading-none text-[#1C1917] sm:text-4xl"
        >
          {solved}
          <span className="text-lg font-medium text-[#A89880] sm:text-xl">/{total || '—'}</span>
        </motion.span>
        <span className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6B5A48]">
          {displayPct}% solved
        </span>
      </div>
    </div>
  );
}
