import { Link } from 'react-router'
import { formatAmount } from '../utils/format'

export default function AccountCard({ account, full = false }) {
  const { id, name, type, balance, currency, iban, color } = account

  if (full) {
    return (
      <Link
        to={`/comptes/${id}`}
        className="group block border border-line bg-white transition-colors hover:border-blue"
      >
        <div className="h-1.5 w-full" style={{ backgroundColor: color }} />
        <div className="p-6">
          <p className="text-sm text-slate-ink">{type}</p>
          <h3 className="mt-1 font-display text-lg font-bold text-navy">{name}</h3>
          <p className="tabular mt-6 text-3xl font-bold text-navy">{formatAmount(balance, currency)}</p>
          <p className="tabular mt-3 text-sm text-slate-ink">{iban}</p>
          <p className="mt-6 text-sm font-medium text-blue group-hover:text-blue-dark">
            Voir le compte
          </p>
        </div>
      </Link>
    )
  }

  return (
    <Link
      to={`/comptes/${id}`}
      className="flex items-center gap-4 border border-line bg-white p-4 transition-colors hover:border-blue"
    >
      <span className="h-10 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-navy">{name}</p>
        <p className="tabular truncate text-xs text-slate-ink">{iban}</p>
      </div>
      <p className="tabular shrink-0 text-right font-display text-base font-bold text-navy">
        {formatAmount(balance, currency)}
      </p>
    </Link>
  )
}
