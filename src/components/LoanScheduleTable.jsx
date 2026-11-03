import { formatAmount, formatDate } from '../utils/format'

export default function LoanScheduleTable({ schedule, currentMonth = 0 }) {
  if (!schedule || schedule.length === 0) {
    return (
      <p className="py-4 text-sm text-slate-ink">Tableau d'amortissement non disponible.</p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-wide text-slate-ink">
            <th className="py-3 pr-4">N°</th>
            <th className="py-3 pr-4">Date</th>
            <th className="tabular py-3 pr-4 text-right">Capital</th>
            <th className="tabular py-3 pr-4 text-right">Intérêts</th>
            <th className="tabular py-3 pr-4 text-right">Mensualité</th>
            <th className="tabular py-3 text-right">Solde restant</th>
          </tr>
        </thead>
        <tbody>
          {schedule.map((row) => {
            const isPast = row.n <= currentMonth
            const isCurrent = row.n === currentMonth + 1
            return (
              <tr
                key={row.n}
                className={`border-b border-line last:border-0 ${
                  isCurrent
                    ? 'bg-blue/5 font-semibold'
                    : isPast
                      ? 'text-slate-400'
                      : ''
                }`}
              >
                <td className="py-3 pr-4 text-slate-ink">{row.n}</td>
                <td className="py-3 pr-4 text-slate-ink">{formatDate(row.date)}</td>
                <td className="tabular py-3 pr-4 text-right">{formatAmount(row.capital)}</td>
                <td className="tabular py-3 pr-4 text-right text-red-600">
                  {formatAmount(row.interest)}
                </td>
                <td className="tabular py-3 pr-4 text-right">{formatAmount(row.payment)}</td>
                <td className="tabular py-3 text-right font-medium text-navy">
                  {formatAmount(row.remainingBalance)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
