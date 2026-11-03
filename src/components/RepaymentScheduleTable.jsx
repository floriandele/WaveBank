import { formatAmount, formatDate } from '../utils/format'

/**
 * Tableau des échéances d'amortissement.
 * entries : tableau produit par generateSchedule() ou getRemainingSchedule()
 * limit   : nombre max de lignes à afficher (undefined = tout afficher)
 */
export default function RepaymentScheduleTable({ entries, limit }) {
  const rows = limit ? entries.slice(0, limit) : entries

  if (rows.length === 0) {
    return (
      <p className="py-6 text-sm text-slate-ink">Aucune échéance à afficher.</p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-wide text-slate-ink">
            <th className="py-3 pr-4">#</th>
            <th className="py-3 pr-4">Date</th>
            <th className="py-3 pr-4 text-right">Capital</th>
            <th className="py-3 pr-4 text-right">Intérêts</th>
            <th className="py-3 pr-4 text-right">Mensualité</th>
            <th className="py-3 text-right">Solde restant</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((entry) => (
            <tr
              key={entry.month}
              className="border-b border-line last:border-0 hover:bg-slate-50"
            >
              <td className="py-3 pr-4 tabular text-slate-ink">{entry.month}</td>
              <td className="py-3 pr-4 text-navy">
                {formatDate(entry.date, { day: '2-digit', month: 'short', year: 'numeric' })}
              </td>
              <td className="py-3 pr-4 tabular text-right text-navy">
                {formatAmount(entry.capital)}
              </td>
              <td className="py-3 pr-4 tabular text-right text-slate-ink">
                {formatAmount(entry.interest)}
              </td>
              <td className="py-3 pr-4 tabular text-right font-medium text-navy">
                {formatAmount(entry.total)}
              </td>
              <td className="py-3 tabular text-right text-slate-ink">
                {formatAmount(entry.remainingBalance)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
