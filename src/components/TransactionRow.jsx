import { formatAmount, formatDate } from '../utils/format'

export default function TransactionRow({ transaction, currency = 'EUR' }) {
  const isCredit = transaction.amount > 0

  return (
    <div className="flex items-center gap-4 border-b border-line py-3 last:border-b-0">
      <span className="w-24 shrink-0 text-sm text-slate-ink">
        {formatDate(transaction.date, { day: '2-digit', month: 'short' })}
      </span>
      <span className="min-w-0 flex-1 truncate text-sm font-medium text-navy">
        {transaction.label}
      </span>
      <span className="hidden shrink-0 rounded-full bg-mist px-2.5 py-1 text-xs text-slate-ink sm:inline-block">
        {transaction.category}
      </span>
      <span
        className={`tabular w-32 shrink-0 text-right font-medium ${
          isCredit ? 'text-green-600' : 'text-slate-ink'
        }`}
      >
        {isCredit ? '+' : ''}
        {formatAmount(transaction.amount, currency)}
      </span>
    </div>
  )
}
