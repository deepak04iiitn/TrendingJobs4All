import React from 'react';
import { FileSearch, Plus } from 'lucide-react';
import { focusRing } from '../theme/tokens';

export default function InterviewEmptyState({ onShareClick }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#E5DCCE] bg-[#FFFDF8] px-6 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F7F3EC] text-[#C4A574]">
        <FileSearch className="h-6 w-6" aria-hidden />
      </div>
      <h3 className="font-display mt-5 text-2xl font-semibold text-[#1C1917] sm:text-3xl">
        No interview experiences yet
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[#78716C]">
        Be the first to share a QA, SDET or test automation interview story. Your insights could help
        the next candidate prepare with confidence.
      </p>
      <div className="mt-6">
        <button
          type="button"
          onClick={onShareClick}
          className={`inline-flex items-center gap-2 rounded-xl border border-[#2C241B] bg-[#2C241B] px-5 py-2.5 text-sm font-semibold text-[#FFFDF8] shadow-[0_10px_24px_-12px_rgba(44,36,27,0.55)] transition hover:bg-[#1A1510] ${focusRing}`}
        >
          <Plus className="h-4 w-4" aria-hidden />
          Share your experience
        </button>
      </div>
    </div>
  );
}
