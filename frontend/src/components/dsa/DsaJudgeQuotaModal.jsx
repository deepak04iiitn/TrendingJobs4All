import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { Coffee, HeartHandshake, Mail, X } from 'lucide-react';
import { focusRing } from '../../theme/tokens';

/**
 * Friendly downtime modal when the code runner hits provider quota / rate limits.
 * Not a user-code failure — keep the tone warm and blame-free.
 */
export default function DsaJudgeQuotaModal({ open, onClose }) {
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[95] flex items-end justify-center bg-[#2C241B]/45 p-3 backdrop-blur-[2px] sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dsa-quota-title"
        className="relative z-10 w-full max-w-md overflow-hidden rounded-[1.75rem] border border-[#E5DCCE] bg-[#FFFDF8] shadow-[0_28px_80px_-24px_rgba(44,36,27,0.5)]"
      >
        <div className="relative overflow-hidden border-b border-[#E5DCCE] bg-[#F7F3EC] px-6 pb-6 pt-7">
          <div
            className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full bg-[radial-gradient(circle,rgba(196,165,116,0.35)_0%,transparent_70%)]"
            aria-hidden
          />
          <button
            type="button"
            onClick={onClose}
            className={`absolute right-3 top-3 rounded-xl p-2 text-[#6B5A48] hover:bg-[#EFE8DC] ${focusRing}`}
            aria-label="Close"
          >
            <X size={18} />
          </button>
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-[#E5DCCE] bg-[#FFFDF8] text-[#C4A574] shadow-sm">
            <Coffee size={26} strokeWidth={1.6} aria-hidden />
          </div>
          <p className="relative mt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6B5A48]">
            Brief pause
          </p>
          <h2
            id="dsa-quota-title"
            className="font-display relative mt-1.5 text-2xl font-semibold tracking-tight text-[#1C1917]"
          >
            We&apos;ll be back shortly
          </h2>
        </div>

        <div className="space-y-3 px-6 py-5">
          <p className="text-sm leading-relaxed text-[#57534E]">
            This isn&apos;t your code&apos;s fault — our code runner hit a temporary limit on our side.
            Hang tight and try again in a little while.
          </p>
          <p className="flex items-start gap-2 rounded-xl border border-[#E5DCCE] bg-[#F7F3EC]/70 px-3.5 py-3 text-xs leading-relaxed text-[#6B5A48]">
            <HeartHandshake size={16} className="mt-0.5 shrink-0 text-[#C4A574]" aria-hidden />
            <span>
              If it keeps happening, please contact support and we&apos;ll sort it out — we appreciate
              your patience.
            </span>
          </p>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-[#E5DCCE] px-6 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className={`rounded-full border border-[#E5DCCE] px-4 py-2.5 text-sm font-semibold text-[#2C241B] hover:bg-[#F7F3EC] ${focusRing}`}
          >
            Got it
          </button>
          <Link
            to="/contact-us"
            onClick={onClose}
            className={`inline-flex items-center justify-center gap-1.5 rounded-full bg-[#2C241B] px-4 py-2.5 text-sm font-semibold text-[#FFFDF8] hover:bg-[#1A1510] ${focusRing}`}
          >
            <Mail size={15} className="text-[#C4A574]" aria-hidden />
            Contact support
          </Link>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function isJudgeQuotaFailure(error) {
  if (!error) return false;
  if (error.code === 'JUDGE_QUOTA') return true;
  const status = Number(error.status || 0);
  if (status === 503) return true;
  const msg = String(error.message || '').toLowerCase();
  return /quota|rate\s*limit|too many|credit|billing|temporarily unavailable|high demand/.test(msg)
    && !/please wait before trying again/.test(msg);
}
