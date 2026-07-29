import { focusRing } from '../../theme/tokens';

export default function AdminKpiCard({ label, value, hint, icon: Icon, tone = 'default' }) {
  const tones = {
    default: 'border-[#E5DCCE] bg-[#FFFDF8]',
    bronze: 'border-[#C4A574]/35 bg-[#F7F3EC]',
    alert: 'border-amber-200 bg-amber-50/60',
  };

  return (
    <div className={`rounded-2xl border p-4 ${tones[tone] || tones.default}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6B5A48]">{label}</p>
          <p className="font-display mt-2 text-2xl font-semibold tabular-nums text-[#1C1917]">
            {value ?? '—'}
          </p>
          {hint && <p className="mt-1 text-[11px] text-[#78716C]">{hint}</p>}
        </div>
        {Icon && (
          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F7F3EC] text-[#C4A574] ${focusRing}`}>
            <Icon className="h-4 w-4" aria-hidden />
          </span>
        )}
      </div>
    </div>
  );
}
