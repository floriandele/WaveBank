import { useState } from 'react'
import { formatAmount, formatDate } from '../utils/format'

const PAGE_SIZE = 12

export default function AmortizationTable({ schedule, highlightUpTo }) {
  const [page, setPage] = useState(0)

  if (!schedule || schedule.length === 0) {
    return (
      <p className="py-6 text-sm text-slate-ink">Aucun tableau d'amortissement disponible.</p>
    )
  }

  const totalPages = Math.ceil(schedule.length / PAGE_SIZE)
  const pageItems = schedule.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs font-medium text-slate-ink">
              <th className="px-3 py-2 text-center">Mois</th>
              <th className="px-3 py-2">Date</th>
              <th className="tabular px-3 py-2 text-right">Échéance</th>
              <th className="tabular px-3 py-2 text-right">Capital</th>
              <th className="tabular px-3 py-2 text-right">Intérêts</th>
              <th className="tabular px-3 py-2 text-right">Solde restant</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((row) => {
              const rowDate = new Date(row.date + 'T00:00:00')
              const isPast = rowDate <= today
              const isCurrent =
                highlightUpTo &&
                row.month === highlightUpTo

              return (
                <tr
                  key={row.month}
                  className={`border-b border-line transition-colors ${
                    isCurrent
                      ? 'bg-blue/5 font-medium'
                      : isPast
                      ? 'bg-mist/60 text-slate-ink'
                      : ''
                  }`}
                >
                  <td className="px-3 py-2 text-center text-xs text-slate-ink">{row.month}</td>
                  <td className="px-3 py-2 text-navy">{formatDate(row.date)}</td>
                  <td className="tabular px-3 py-2 text-right text-navy">
                    {formatAmount(row.payment)}
                  </td>
                  <td className="tabular px-3 py-2 text-right text-navy">
                    {formatAmount(row.principal)}
                  </td>
                  <td className="tabular px-3 py-2 text-right text-slate-ink">
                    {formatAmount(row.interest)}
                  </td>
                  <td className={`tabular px-3 py-2 text-right font-medium ${isPast ? 'text-slate-ink' : 'text-blue'}`}>
                    {formatAmount(row.balance)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-line px-3 py-3">
          <p className="text-xs text-slate-ink">
            Page {page + 1} / {totalPages} — {schedule.length} échéances
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              className="rounded border border-line px-3 py-1 text-xs font-medium text-navy disabled:opacity-40 hover:bg-mist"
            >
              ← Précédent
            </button>
            <button
              type="button"
              disabled={page === totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
              className="rounded border border-line px-3 py-1 text-xs font-medium text-navy disabled:opacity-40 hover:bg-mist"
            >
              Suivant →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
