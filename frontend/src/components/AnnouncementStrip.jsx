import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BellRing, X } from 'lucide-react';
import { focusRing } from '../theme/tokens';

const DISMISS_KEY = 'r2h_premium_strip_dismissed_v1';
const STRIP_HEIGHT_VAR = '--r2h-announcement-height';
const MESSAGE = 'New: Premium Jobs — get the top 10 QA/SDET roles matched to your experience, emailed to you daily. ₹149/month.';

// Header.jsx reads --r2h-announcement-height to offset its own fixed
// positioning, so this component and Header stay decoupled (no prop drilling).
export default function AnnouncementStrip() {
  const [dismissed, setDismissed] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setDismissed(localStorage.getItem(DISMISS_KEY) === '1');
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty(STRIP_HEIGHT_VAR, dismissed ? '0px' : '36px');
    return () => document.documentElement.style.setProperty(STRIP_HEIGHT_VAR, '0px');
  }, [dismissed]);

  if (dismissed) return null;

  const handleDismiss = (e) => {
    e.stopPropagation();
    localStorage.setItem(DISMISS_KEY, '1');
    setDismissed(true);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigate('/premium-jobs')}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') navigate('/premium-jobs');
      }}
      className={`announcement-strip fixed inset-x-0 top-0 z-40 flex h-9 cursor-pointer items-center gap-3 overflow-hidden bg-[#2C241B] px-3 text-[#FFFDF8] ${focusRing}`}
    >
      <BellRing size={14} className="shrink-0 text-[#C4A574]" aria-hidden />
      <div className="announcement-strip__track min-w-0 flex-1 overflow-hidden">
        <div className="announcement-strip__content text-xs font-medium sm:text-sm">
          <span>{MESSAGE}</span>
          <span aria-hidden>{MESSAGE}</span>
        </div>
      </div>
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss announcement"
        className={`shrink-0 rounded-full p-1 text-[#FFFDF8]/70 hover:bg-white/10 hover:text-[#FFFDF8] ${focusRing}`}
      >
        <X size={14} />
      </button>

      <style>{`
        .announcement-strip__track {
          mask-image: linear-gradient(90deg, transparent, black 24px, black calc(100% - 24px), transparent);
        }
        .announcement-strip__content {
          display: flex;
          gap: 3rem;
          white-space: nowrap;
          width: max-content;
          animation: r2h-marquee 22s linear infinite;
        }
        @keyframes r2h-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .announcement-strip__content {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
