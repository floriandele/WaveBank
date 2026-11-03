import StatusBadge from './StatusBadge'
import { formatAmount, formatDate } from '../utils/format'

export default function InvoiceRow({ invoice }) {
  return (
    <div className="flex items-center gap-4 border-b border-line py-3 last:border-b-0">
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-navy">{invoice.client}</p>
        <p className="text-xs text-slate-ink">Échéance {formatDate(invoice.dueDate)}</p>
      </div>
      <span className="tabular w-28 shrink-0 text-right font-display font-bold text-navy">
        {formatAmount(invoice.amount)}
      </span>
      <div className="w-28 shrink-0 text-right">
        <StatusBadge status={invoice.status} />
      </div>
    </div>
  )
}
