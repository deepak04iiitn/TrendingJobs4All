import { ChevronLeft, ChevronRight } from 'lucide-react';
import { focusRing } from '../../theme/tokens';

export default function AdminPagination({ page, totalPages, total, limit, onPageChange, loading }) {
  if (!total) return null;

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#E5DCCE] pt-4 text-sm text-[#78716C]">
      <p>
        Showing <strong className="text-[#2C241B]">{start}</strong>&ndash;
        <strong className="text-[#2C241B]">{end}</strong> of <strong className="text-[#2C241B]">{total}</strong>
      </p>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={loading || page <= 1}
          onClick={() => onPageChange(page - 1)}
          className={`inline-flex items-center gap-1 rounded-lg border border-[#E5DCCE] bg-[#FFFDF8] px-2.5 py-1.5 text-xs font-medium text-[#6B5A48] transition hover:bg-[#EFE8DC] disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`}
        >
          <ChevronLeft className="h-3.5 w-3.5" /> Prev
        </button>
        <span className="px-2 text-xs font-medium tabular-nums text-[#6B5A48]">
          Page {page} of {totalPages}
        </span>
        <button
          type="button"
          disabled={loading || page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className={`inline-flex items-center gap-1 rounded-lg border border-[#E5DCCE] bg-[#FFFDF8] px-2.5 py-1.5 text-xs font-medium text-[#6B5A48] transition hover:bg-[#EFE8DC] disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`}
        >
          Next <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
