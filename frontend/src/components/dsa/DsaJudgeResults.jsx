import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2, Circle, ChevronDown, Eye } from 'lucide-react';
import { focusRing } from '../../theme/tokens';

const STATUS_TONE = {
  Accepted: 'text-emerald-700',
  WrongAnswer: 'text-rose-700',
  TimeLimitExceeded: 'text-amber-700',
  RuntimeError: 'text-rose-700',
  CompilationError: 'text-rose-700',
  InternalError: 'text-rose-700',
};

function CaseRow({ item, pending, isFirstFail, onViewFail }) {
  if (pending) {
    return (
      <div className="flex items-center gap-2.5 rounded-xl border border-[#E5DCCE]/80 bg-[#F7F3EC]/50 px-3 py-2">
        <Circle size={14} className="text-[#D6CBB8]" />
        <span className="text-xs text-[#A89880]">Test #{item.index}</span>
        <span className="ml-auto text-[10px] uppercase tracking-wider text-[#C4A574]/70">Queued</span>
      </div>
    );
  }

  const passed = item.passed;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-2.5 rounded-xl border px-3 py-2 ${
        passed
          ? 'border-emerald-200/80 bg-emerald-50/70'
          : isFirstFail
            ? 'border-rose-300 bg-rose-50'
            : 'border-rose-200/80 bg-rose-50/60'
      }`}
    >
      {passed ? (
        <CheckCircle2 size={14} className="shrink-0 text-emerald-600" />
      ) : (
        <XCircle size={14} className="shrink-0 text-rose-600" />
      )}
      <span className="text-xs font-medium text-[#2C241B]">
        Test #{item.index}
        {item.isSample ? (
          <span className="ml-1.5 text-[10px] font-normal text-[#A89880]">sample</span>
        ) : null}
      </span>
      <span className={`ml-auto text-[11px] font-semibold ${STATUS_TONE[item.status] || 'text-[#6B5A48]'}`}>
        {passed ? 'Passed' : item.status}
      </span>
      {item.runtimeMs != null && item.runtimeMs > 0 && (
        <span className="text-[10px] tabular-nums text-[#78716C]">{item.runtimeMs}ms</span>
      )}
      {isFirstFail && onViewFail && (
        <button
          type="button"
          onClick={onViewFail}
          className={`inline-flex items-center gap-1 rounded-full border border-rose-200 bg-[#FFFDF8] px-2 py-0.5 text-[10px] font-semibold text-rose-700 ${focusRing}`}
        >
          <Eye size={11} /> View
        </button>
      )}
    </motion.div>
  );
}

function FailedCasePanel({ failed }) {
  if (!failed) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-rose-200 bg-[#FFFDF8] p-4"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-rose-700">
          First failed · Test #{failed.index}
          {failed.isSample ? ' (sample)' : ''}
        </p>
        <span className={`text-xs font-semibold ${STATUS_TONE[failed.status]}`}>{failed.status}</span>
      </div>
      {failed.message && (
        <p className="mt-2 text-xs text-[#6B5A48] whitespace-pre-wrap break-words">{failed.message}</p>
      )}
      <div className="mt-3 space-y-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6B5A48]">Input</p>
          <pre className="mt-1 max-h-40 overflow-auto rounded-xl bg-[#F7F3EC] p-3 text-[11px] text-[#2C241B] whitespace-pre-wrap break-words">
            {failed.stdin === '' || failed.stdin == null ? '(empty)' : failed.stdin}
          </pre>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6B5A48]">Expected</p>
          <pre className="mt-1 max-h-32 overflow-auto rounded-xl bg-[#F7F3EC] p-3 text-[11px] text-[#2C241B] whitespace-pre-wrap break-words">
            {failed.expectedStdout === '' || failed.expectedStdout == null
              ? '(empty)'
              : failed.expectedStdout}
          </pre>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6B5A48]">Your output</p>
          <pre className="mt-1 max-h-32 overflow-auto rounded-xl bg-rose-50/80 p-3 text-[11px] text-[#2C241B] whitespace-pre-wrap break-words">
            {failed.stdout === '' || failed.stdout == null ? '(empty)' : failed.stdout}
          </pre>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Live / final judge results for the left panel.
 */
export default function DsaJudgeResults({
  mode = 'submit',
  running = false,
  totalCount = 0,
  passedCount = 0,
  failedCount = 0,
  doneCount = 0,
  cases = [],
  result = null,
}) {
  const [showFail, setShowFail] = useState(true);
  const total = result?.totalCount ?? totalCount;
  const passed = result?.passedCount ?? passedCount;
  const failed =
    result?.failedCount ?? failedCount ?? Math.max(0, result ? total - passed : doneCount - passed);
  const done = result ? total : doneCount;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const finished = !!result && !running;
  const allPassed = finished && result?.status === 'Accepted';
  const firstFailed = result?.firstFailedCase || null;
  const firstFailIndex = firstFailed?.index;

  const known = cases || [];
  const pendingSlots =
    running && total > known.length
      ? Array.from({ length: Math.min(12, total - known.length) }, (_, i) => ({
          index: '…',
          key: `pending-${i}`,
        }))
      : [];

  return (
    <div className="space-y-5">
      <div
        className={`relative overflow-hidden rounded-2xl border px-5 py-5 ${
          finished
            ? allPassed
              ? 'border-emerald-200 bg-emerald-50/50'
              : 'border-[#E5DCCE] bg-[#FFFDF8]'
            : 'border-[#E5DCCE] bg-[#FFFDF8]'
        }`}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background: allPassed
              ? 'radial-gradient(ellipse 60% 80% at 100% 0%, rgba(16,185,129,0.12), transparent 55%)'
              : 'radial-gradient(ellipse 50% 70% at 100% 0%, rgba(196,165,116,0.16), transparent 55%)',
          }}
        />
        <div className="relative">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6B5A48]">
                {mode === 'run' ? 'Sample run' : 'Submission'}
              </p>
              <p className="font-display mt-1 text-xl font-semibold text-[#1C1917]">
                {running && 'Running tests…'}
                {finished && allPassed && 'Accepted'}
                {finished && !allPassed && (result?.status || 'Finished')}
              </p>
            </div>
            {running && <Loader2 size={20} className="animate-spin text-[#C4A574]" />}
            {finished && allPassed && <CheckCircle2 size={22} className="text-emerald-600" />}
            {finished && !allPassed && <XCircle size={22} className="text-rose-600" />}
          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#EFE8DC]">
            <motion.div
              className={`h-full rounded-full ${allPassed ? 'bg-emerald-500' : 'bg-[#C4A574]'}`}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-xl border border-[#E5DCCE] bg-[#F7F3EC]/80 px-3 py-2.5 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6B5A48]">Passed</p>
              <p className="font-display mt-0.5 text-lg font-semibold tabular-nums text-emerald-700">
                {passed}
              </p>
            </div>
            <div className="rounded-xl border border-[#E5DCCE] bg-[#F7F3EC]/80 px-3 py-2.5 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6B5A48]">Failed</p>
              <p className="font-display mt-0.5 text-lg font-semibold tabular-nums text-rose-700">
                {failed}
              </p>
            </div>
            <div className="rounded-xl border border-[#E5DCCE] bg-[#F7F3EC]/80 px-3 py-2.5 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6B5A48]">Total</p>
              <p className="font-display mt-0.5 text-lg font-semibold tabular-nums text-[#1C1917]">
                {total || '—'}
              </p>
            </div>
          </div>

          {running && (
            <p className="mt-3 text-xs text-[#78716C]">
              {done}/{total || '…'} evaluated
            </p>
          )}

          {finished && !allPassed && firstFailed && (
            <button
              type="button"
              onClick={() => setShowFail((v) => !v)}
              className={`mt-4 inline-flex w-full items-center justify-between rounded-xl border border-rose-200 bg-rose-50/70 px-3 py-2.5 text-left text-sm font-medium text-rose-800 ${focusRing}`}
            >
              <span className="inline-flex items-center gap-2">
                <Eye size={15} />
                View first failed test #{firstFailed.index}
              </span>
              <ChevronDown size={15} className={`transition ${showFail ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {finished && !allPassed && showFail && firstFailed && <FailedCasePanel failed={firstFailed} />}
      </AnimatePresence>

      <div>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6B5A48]">
          Test cases
        </p>
        <div className="space-y-1.5">
          <AnimatePresence initial={false}>
            {[...known]
              .sort((a, b) => (a.index || 0) - (b.index || 0))
              .map((c) => (
                <CaseRow
                  key={`case-${c.index}`}
                  item={c}
                  isFirstFail={!c.passed && c.index === firstFailIndex}
                  onViewFail={
                    !c.passed && c.index === firstFailIndex
                      ? () => setShowFail(true)
                      : undefined
                  }
                />
              ))}
          </AnimatePresence>
          {pendingSlots.map((p) => (
            <CaseRow key={p.key} item={p} pending />
          ))}
        </div>
      </div>
    </div>
  );
}
