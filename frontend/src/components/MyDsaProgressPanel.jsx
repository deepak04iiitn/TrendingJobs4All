import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Flame,
  Target,
  Trophy,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Zap,
  CalendarDays,
  Award,
  Gauge,
  Rabbit,
} from 'lucide-react';
import { focusRing } from '../theme/tokens';
import { fetchDsaDashboard } from '../lib/dsa-api';
import { formatElapsed } from '../hooks/useDsaTimer';
import DsaProgressRing from './dsa/DsaProgressRing';

const SPEED_LINE = '#C4A574';

const DIFF_TONE = {
  Easy: 'text-emerald-700',
  Medium: 'text-amber-700',
  Hard: 'text-rose-700',
};

function SpeedTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-xl border border-[#E5DCCE] bg-[#FFFDF8] px-3 py-2 text-xs shadow-sm">
      <p className="font-semibold text-[#1C1917]">{p.title}</p>
      <p className="mt-0.5 text-[#78716C]">
        {new Date(p.date).toLocaleDateString()} · <span className={DIFF_TONE[p.difficulty] || ''}>{p.difficulty}</span>
      </p>
      <p className="mt-1 font-semibold text-[#C4A574]">{formatElapsed(p.elapsedMs)}</p>
    </div>
  );
}

function SolveSpeedTrend({ trend }) {
  if (!trend?.length) {
    return (
      <div className="flex h-[180px] items-center justify-center rounded-xl bg-[#F7F3EC]/70 text-sm text-[#78716C]">
        Solve a problem with the timer running to start tracking your speed.
      </div>
    );
  }
  const data = trend.map((t, i) => ({ ...t, i }));
  return (
    <div className="w-full min-w-0" role="img" aria-label="Line chart of solve time in minutes and seconds across your recent accepted submissions">
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="dsaSpeedFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={SPEED_LINE} stopOpacity={0.28} />
              <stop offset="100%" stopColor={SPEED_LINE} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="#E5DCCE" strokeDasharray="3 3" />
          <XAxis dataKey="i" tick={false} axisLine={{ stroke: '#E5DCCE' }} tickLine={false} />
          <YAxis
            tickFormatter={(v) => formatElapsed(v)}
            tick={{ fill: '#78716C', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={48}
          />
          <Tooltip content={<SpeedTooltip />} cursor={{ stroke: '#C4A574', strokeWidth: 1, strokeDasharray: '3 3' }} />
          <Area
            type="monotone"
            dataKey="elapsedMs"
            stroke={SPEED_LINE}
            strokeWidth={2}
            fill="url(#dsaSpeedFill)"
            dot={{ r: 3, fill: SPEED_LINE, strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const GAP_PX = 3;

function toDateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function levelClass(c) {
  if (c <= 0) return 'bg-[#EFE8DC]';
  if (c === 1) return 'bg-[#C4A574]/35';
  if (c === 2) return 'bg-[#C4A574]/60';
  if (c <= 4) return 'bg-[#C4A574]';
  return 'bg-[#2C241B]';
}

function Heatmap({ days }) {
  const today = useMemo(() => new Date(), []);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  // null = rolling / full year; 0-11 = that month only
  const [viewMonth, setViewMonth] = useState(null);
  const wrapRef = useRef(null);
  const [cellPx, setCellPx] = useState(12);

  const map = useMemo(() => {
    const m = new Map();
    (days || []).forEach((d) => m.set(d.date, d.count || 0));
    return m;
  }, [days]);

  const yearOptions = useMemo(() => {
    const years = new Set([today.getFullYear()]);
    (days || []).forEach((d) => {
      if (d?.date?.length >= 4) years.add(Number(d.date.slice(0, 4)));
    });
    for (let y = today.getFullYear(); y >= today.getFullYear() - 2; y -= 1) years.add(y);
    return [...years].filter((y) => Number.isFinite(y)).sort((a, b) => b - a);
  }, [days, today]);

  const { cells, weekCount, rangeLabel, monthLabels } = useMemo(() => {
    let start;
    let end;

    if (viewMonth != null) {
      start = new Date(viewYear, viewMonth, 1);
      const last = new Date(viewYear, viewMonth + 1, 0);
      end =
        viewYear === today.getFullYear() && viewMonth === today.getMonth()
          ? new Date(today.getFullYear(), today.getMonth(), today.getDate())
          : last;
    } else if (viewYear === today.getFullYear()) {
      // Rolling ~52 weeks ending today — previous-year months fill the left
      end = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      start = new Date(end);
      start.setDate(start.getDate() - 52 * 7 + 1);
    } else {
      start = new Date(viewYear, 0, 1);
      end = new Date(viewYear, 11, 31);
    }

    // Align start to Sunday so columns are full weeks (GitHub-style)
    const aligned = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    aligned.setDate(aligned.getDate() - aligned.getDay());

    const out = [];
    const cursor = new Date(aligned);
    const startMs = start.getTime();
    const endMs = end.getTime();
    while (true) {
      const key = toDateKey(cursor);
      const t = cursor.getTime();
      const inRange = t >= startMs && t <= endMs;
      out.push({
        date: key,
        count: inRange ? map.get(key) || 0 : -1,
        inRange,
        month: cursor.getMonth(),
      });
      cursor.setDate(cursor.getDate() + 1);
      if (cursor.getTime() > endMs && out.length % 7 === 0) break;
      if (out.length >= 7 * 54) break;
    }

    const weeks = Math.max(1, Math.ceil(out.length / 7));
    const labels = [];
    let lastMonth = -1;
    let lastWeek = -99;
    for (let w = 0; w < weeks; w += 1) {
      let monthIdx = -1;
      for (let d = 0; d < 7; d += 1) {
        const cell = out[w * 7 + d];
        if (!cell?.inRange) continue;
        monthIdx = cell.month;
        break;
      }
      if (monthIdx < 0 || monthIdx === lastMonth) continue;
      if (w - lastWeek < 3 && labels.length > 0) {
        lastMonth = monthIdx;
        continue;
      }
      labels.push({ weekIndex: w, label: MONTH_SHORT[monthIdx] });
      lastMonth = monthIdx;
      lastWeek = w;
    }

    const label =
      viewMonth != null
        ? `${MONTH_NAMES[viewMonth]} ${viewYear}`
        : viewYear === today.getFullYear()
          ? 'past 12 months'
          : `${viewYear}`;

    return {
      cells: out,
      weekCount: weeks,
      rangeLabel: label,
      monthLabels: labels,
    };
  }, [viewYear, viewMonth, map, today]);

  // Explicit px size so squares don't collapse (aspect-square + column-flow = 0 height)
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return undefined;
    const measure = () => {
      const w = el.clientWidth;
      if (!w || weekCount < 1) return;
      const next = Math.floor((w - (weekCount - 1) * GAP_PX) / weekCount);
      setCellPx(Math.max(8, next));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [weekCount]);

  const total = useMemo(
    () => cells.reduce((sum, c) => sum + (c.inRange ? c.count : 0), 0),
    [cells],
  );

  return (
    <div className="min-w-0">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor="dsa-heatmap-month">
            Month
          </label>
          <select
            id="dsa-heatmap-month"
            value={viewMonth == null ? 'all' : String(viewMonth)}
            onChange={(e) => {
              const v = e.target.value;
              setViewMonth(v === 'all' ? null : Number(v));
            }}
            className={`rounded-lg border border-[#E5DCCE] bg-[#FFFDF8] px-2.5 py-1.5 text-xs font-medium text-[#2C241B] ${focusRing}`}
          >
            <option value="all">All months</option>
            {MONTH_NAMES.map((name, idx) => {
              const disabled =
                viewYear > today.getFullYear() ||
                (viewYear === today.getFullYear() && idx > today.getMonth());
              return (
                <option key={name} value={idx} disabled={disabled}>
                  {name}
                </option>
              );
            })}
          </select>
          <label className="sr-only" htmlFor="dsa-heatmap-year">
            Year
          </label>
          <select
            id="dsa-heatmap-year"
            value={viewYear}
            onChange={(e) => {
              const y = Number(e.target.value);
              setViewYear(y);
              if (y === today.getFullYear() && viewMonth != null && viewMonth > today.getMonth()) {
                setViewMonth(today.getMonth());
              }
            }}
            className={`rounded-lg border border-[#E5DCCE] bg-[#FFFDF8] px-2.5 py-1.5 text-xs font-medium text-[#2C241B] ${focusRing}`}
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <p className="text-xs text-[#6B5A48]">
          <span className="font-semibold tabular-nums text-[#2C241B]">{total}</span>
          {total === 1 ? ' activity' : ' activities'} in {rangeLabel}
        </p>
      </div>

      <div ref={wrapRef} className="w-full min-w-0">
        <div className="relative mb-1 h-4 w-full" aria-hidden>
          {monthLabels.map((m) => (
            <span
              key={`${m.label}-${m.weekIndex}`}
              className="absolute top-0 text-[10px] leading-none text-[#78716C]"
              style={{ left: `${(m.weekIndex / weekCount) * 100}%` }}
            >
              {m.label}
            </span>
          ))}
        </div>
        <div
          className="grid w-full"
          style={{
            gridTemplateColumns: `repeat(${weekCount}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(7, ${cellPx}px)`,
            gridAutoFlow: 'column',
            gap: GAP_PX,
          }}
        >
          {cells.map((c) => (
            <div
              key={c.date}
              title={
                c.inRange
                  ? `${c.date}: ${c.count} activit${c.count === 1 ? 'y' : 'ies'}`
                  : undefined
              }
              className={`h-full w-full rounded-[2px] ${
                c.inRange ? levelClass(c.count) : 'bg-transparent'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-end gap-1.5 text-[10px] text-[#78716C]">
        <span>Less</span>
        {[0, 1, 2, 4, 5].map((n) => (
          <span key={n} className={`h-2.5 w-2.5 rounded-[2px] ${levelClass(n)}`} aria-hidden />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}

function StatTile({ label, value, icon: Icon, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      className="relative min-w-0 overflow-hidden rounded-2xl border border-[#E5DCCE] bg-[#FFFDF8] p-3 sm:p-4"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-[#C4A574]/12"
      />
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6B5A48]">
          {label}
        </p>
        <Icon size={16} className="shrink-0 text-[#C4A574]" aria-hidden />
      </div>
      <p className="font-display mt-2 truncate text-xl font-semibold tabular-nums text-[#1C1917] sm:mt-3 sm:text-2xl">
        {value}
      </p>
    </motion.div>
  );
}

export default function MyDsaProgressPanel() {
  const [dash, setDash] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const d = await fetchDsaDashboard();
        if (!cancelled) setDash(d);
      } catch (e) {
        if (!cancelled) setError(e?.response?.data?.message || 'Could not load DSA progress');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = dash?.stats || {};
  const solved = stats.totalSolved || 0;
  const total = dash?.totalProblems || 0;
  const remaining = dash?.remaining ?? Math.max(0, total - solved);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-[#6B5A48]">
        Loading your DSA metrics…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50/60 px-5 py-8 text-center">
        <p className="text-sm text-rose-800">{error}</p>
        <Link
          to="/qa-sdet-dsa-sheet"
          className={`mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#2C241B] ${focusRing}`}
        >
          Open DSA Sheet <ArrowRight size={14} />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-8">
      {/* Hero progress */}
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative min-w-0 overflow-hidden rounded-3xl border border-[#E5DCCE] bg-[#FFFDF8] px-5 py-7 sm:px-8 sm:py-8"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 50% 70% at 85% 20%, rgba(196,165,116,0.18), transparent 55%), radial-gradient(ellipse 40% 50% at 0% 100%, rgba(44,36,27,0.05), transparent 50%)',
          }}
        />
        <div className="relative flex min-w-0 flex-col items-center gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
          <div className="min-w-0 w-full max-w-md text-center lg:text-left">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#6B5A48]">
              QA / SDET progress
            </p>
            <h3 className="font-display mt-2 text-2xl font-semibold text-[#1C1917] sm:text-3xl">
              Your DSA journey
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[#57534E]">
              Track solved problems, streaks, XP, and accuracy — then jump back into the sheet to keep
              climbing.
            </p>
            <Link
              to="/qa-sdet-dsa-sheet"
              className={`mt-5 inline-flex items-center gap-2 rounded-full bg-[#2C241B] px-5 py-2.5 text-sm font-semibold text-[#FFFDF8] transition hover:bg-[#3D3228] ${focusRing}`}
            >
              Open DSA Sheet <ArrowRight size={15} />
            </Link>
          </div>
          <DsaProgressRing
            solved={solved}
            total={total}
            size={140}
            strokeWidth={10}
            className="shrink-0"
          />
        </div>
      </motion.section>

      {/* Key metrics — 2 cols by default; 4 only on wide screens after sidebar space */}
      <div className="grid min-w-0 grid-cols-2 gap-3 2xl:grid-cols-4">
        <StatTile label="Solved" value={solved} icon={CheckCircle2} delay={0.05} />
        <StatTile label="Remaining" value={remaining} icon={BookOpen} delay={0.1} />
        <StatTile label="Streak" value={stats.currentStreak || 0} icon={Flame} delay={0.15} />
        <StatTile label="Accuracy" value={`${stats.accuracy || 0}%`} icon={Target} delay={0.2} />
      </div>

      <div className="grid min-w-0 grid-cols-2 gap-3 2xl:grid-cols-4">
        <StatTile label="XP" value={stats.xp || 0} icon={Zap} delay={0.08} />
        <StatTile label="Level" value={stats.level || 1} icon={Award} delay={0.12} />
        <StatTile
          label="Longest streak"
          value={stats.longestStreak || 0}
          icon={CalendarDays}
          delay={0.16}
        />
        <StatTile
          label="Today"
          value={`${stats.solvedToday || 0}/${stats.dailyGoal || 1}`}
          icon={Trophy}
          delay={0.2}
        />
      </div>

      {/* Activity — full width so the month heatmap stays readable */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="min-w-0 overflow-hidden rounded-2xl border border-[#E5DCCE] bg-[#FFFDF8] p-5 sm:p-6"
      >
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h4 className="font-display text-lg font-semibold text-[#1C1917]">Activity</h4>
            <p className="mt-0.5 text-xs text-[#78716C]">Filter by month or year</p>
          </div>
          <p className="text-xs text-[#6B5A48]">
            Longest {stats.longestStreak || 0} · Today {stats.solvedToday || 0}/
            {stats.dailyGoal || 1}
          </p>
        </div>
        <Heatmap days={dash?.heatmap || []} />
        <div className="mt-5 grid grid-cols-3 gap-3">
          {[
            { label: 'Easy', value: stats.easySolved || 0, tone: 'text-emerald-700' },
            { label: 'Medium', value: stats.mediumSolved || 0, tone: 'text-amber-700' },
            { label: 'Hard', value: stats.hardSolved || 0, tone: 'text-rose-700' },
          ].map((row) => (
            <div
              key={row.label}
              className="rounded-xl border border-[#E5DCCE] bg-[#F7F3EC]/70 px-3 py-3 text-center"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6B5A48]">
                {row.label}
              </p>
              <p className={`font-display mt-1 text-xl font-semibold tabular-nums ${row.tone}`}>
                {row.value}
              </p>
            </div>
          ))}
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="min-w-0 overflow-hidden rounded-2xl border border-[#E5DCCE] bg-[#FFFDF8] p-5 sm:p-6"
      >
        <h4 className="font-display text-lg font-semibold text-[#1C1917]">Recommended</h4>
        <p className="mt-0.5 text-xs text-[#78716C]">Next easy wins to keep momentum</p>
        <ul className="mt-4 grid gap-1.5 sm:grid-cols-2">
          {(dash?.recommended || []).map((p) => (
            <li key={p.slug}>
              <Link
                to={`/qa-sdet-dsa-sheet/problems/${p.slug}`}
                className={`flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-sm text-[#2C241B] transition hover:bg-[#EFE8DC] ${focusRing}`}
              >
                <span className="min-w-0 truncate font-medium">{p.title}</span>
                <ArrowRight size={14} className="shrink-0 text-[#C4A574]" />
              </Link>
            </li>
          ))}
          {!dash?.recommended?.length && (
            <li className="rounded-xl bg-[#F7F3EC]/80 px-3 py-4 text-sm text-[#78716C] sm:col-span-2">
              You’re caught up — pick any unsolved problem on the sheet.
            </li>
          )}
        </ul>
        <Link
          to="/qa-sdet-dsa-sheet/leaderboard"
          className={`mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#2C241B] ${focusRing}`}
        >
          <Trophy size={15} className="text-[#C4A574]" /> View leaderboard
        </Link>
      </motion.section>

      {/* Solving speed */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.22, duration: 0.4 }}
        className="min-w-0 overflow-hidden rounded-2xl border border-[#E5DCCE] bg-[#FFFDF8] p-5 sm:p-6"
      >
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <div className="min-w-0">
            <h4 className="font-display text-lg font-semibold text-[#1C1917]">Solving speed</h4>
            <p className="mt-0.5 text-xs text-[#78716C]">Time-to-solve on your last {dash?.speed?.trend?.length || 0} accepted submissions</p>
          </div>
        </div>

        <div className="grid min-w-0 gap-6 lg:grid-cols-2">
          <div className="min-w-0">
            <SolveSpeedTrend trend={dash?.speed?.trend} />
            <div className="mt-5 grid grid-cols-3 gap-3">
              {['Easy', 'Medium', 'Hard'].map((diff) => (
                <div key={diff} className="rounded-xl border border-[#E5DCCE] bg-[#F7F3EC]/70 px-3 py-3 text-center">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6B5A48]">Avg {diff}</p>
                  <p className={`font-display mt-1 text-xl font-semibold tabular-nums ${DIFF_TONE[diff]}`}>
                    {dash?.speed?.avgByDifficulty?.[diff] != null ? formatElapsed(dash.speed.avgByDifficulty[diff]) : '—'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="min-w-0">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#6B5A48]">
              <Rabbit size={14} className="text-[#C4A574]" /> Fastest solves
            </p>
            <ul className="space-y-1.5">
              {(dash?.speed?.fastest || []).map((p, i) => (
                <li key={`${p.slug}-${i}`}>
                  <Link
                    to={`/qa-sdet-dsa-sheet/problems/${p.slug}`}
                    className={`flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-sm transition hover:bg-[#EFE8DC] ${focusRing}`}
                  >
                    <span className="min-w-0 truncate font-medium text-[#2C241B]">{p.title}</span>
                    <span className="shrink-0 font-mono text-xs tabular-nums text-[#C4A574]">{formatElapsed(p.elapsedMs)}</span>
                  </Link>
                </li>
              ))}
              {!dash?.speed?.fastest?.length && (
                <li className="flex items-center gap-2 rounded-xl bg-[#F7F3EC]/80 px-3 py-4 text-sm text-[#78716C]">
                  <Gauge size={15} className="shrink-0 text-[#C4A574]" /> Solve with the timer running to see your fastest times here.
                </li>
              )}
            </ul>
          </div>
        </div>
      </motion.section>

      {/* Recently solved */}
      {(dash?.recentlySolved || []).length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="rounded-2xl border border-[#E5DCCE] bg-[#FFFDF8] p-5 sm:p-6"
        >
          <h4 className="font-display text-lg font-semibold text-[#1C1917]">Recently solved</h4>
          <ul className="mt-4 divide-y divide-[#E5DCCE]">
            {dash.recentlySolved.map((row) => {
              const p = row.problemId;
              if (!p?.slug) return null;
              return (
                <li key={p.slug}>
                  <Link
                    to={`/qa-sdet-dsa-sheet/problems/${p.slug}`}
                    className={`flex items-center justify-between gap-3 py-3 text-sm transition hover:text-[#C4A574] ${focusRing}`}
                  >
                    <span className="font-medium text-[#1C1917]">{p.title}</span>
                    <span className="shrink-0 text-xs text-[#78716C]">{p.difficulty}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </motion.section>
      )}
    </div>
  );
}
