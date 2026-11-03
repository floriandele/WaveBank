import { formatAmount, formatDate } from '../utils/format'

export default function EngagementRow({ engagement }) {
  return (
    <div className="flex items-center gap-4 border-b border-line py-3 last:border-b-0">
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-navy">{engagement.label}</p>
        <p className="text-xs text-slate-ink">
          Prochaine échéance {formatDate(engagement.nextDate)}
        </p>
      </div>
      <span className="hidden w-32 shrink-0 text-right text-sm text-slate-ink sm:block">
        {engagement.category}
      </span>
      <span className="tabular w-28 shrink-0 text-right font-display font-bold text-navy">
        {formatAmount(engagement.amount)}
      </span>
    </div>
  )
}
