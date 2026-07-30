import { useState } from 'react';
import { createPortal } from 'react-dom';
import { MessageSquarePlus } from 'lucide-react';
import FeedbackPanel from './FeedbackPanel';
import { focusRing } from '../theme/tokens';

export default function FeedbackFab() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <FeedbackPanel open={open} onClose={() => setOpen(false)} />
      {createPortal(
        <div
          className={`pointer-events-none fixed bottom-6 right-6 z-[2147483647] flex items-center gap-3 transition-all duration-300 sm:bottom-8 sm:right-8 ${
            open ? 'translate-y-2 opacity-0' : ''
          }`}
        >
          {/* Persistent tooltip */}
          <span
            className="relative rounded-full border border-[#E5DCCE] bg-[#FFFDF8]/95 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#6B5A48] shadow-[0_10px_26px_-14px_rgba(44,36,27,0.35)] backdrop-blur-sm"
            aria-hidden
          >
            Feedback
            <span
              className="absolute -right-1 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 border-r border-t border-[#E5DCCE] bg-[#FFFDF8]"
              aria-hidden
            />
          </span>

          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Share feedback"
            aria-expanded={open}
            className={`
              group pointer-events-auto relative flex h-14 w-14 items-center justify-center
              rounded-full bg-[#2C241B] text-[#FFFDF8]
              shadow-[0_16px_36px_-12px_rgba(44,36,27,0.45)]
              transition-all duration-300
              hover:-translate-y-0.5 hover:bg-[#1A1510]
              hover:shadow-[0_20px_40px_-12px_rgba(44,36,27,0.55)]
              ${open ? 'pointer-events-none' : ''}
              ${focusRing}
            `}
          >
            <span
              className="absolute inset-0 rounded-full ring-1 ring-[#C4A574]/45 ring-offset-2 ring-offset-transparent transition group-hover:ring-[#C4A574]/80"
              aria-hidden
            />
            <MessageSquarePlus
              size={22}
              strokeWidth={1.75}
              className="relative transition-transform duration-300 group-hover:scale-105"
              aria-hidden
            />
          </button>
        </div>,
        document.body
      )}
    </>
  );
}
