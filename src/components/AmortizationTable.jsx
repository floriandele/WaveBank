import { useState } from 'react'
import { formatAmount, formatDate } from '../utils/format'

const PAGE_SIZE = 12

export default function AmortizationTable({ schedule }) {
  const [page, setPage] = useState(0)

  if (!schedule || schedule.length === 0) {
    return <p className="py-6 text-sm text-slate-ink">Aucune donnée de calendrier.</p>
  }

  const totalPages = Math.ceil(schedule.length / PAGE_SIZE)
  const slice = schedule.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-line text-left">
              <th className="py-3 pr-4 font-medium text-slate-ink">Mois</th>
              <th className="py-3 pr-4 font-medium text-slate-ink">Date</th>
              <th className="py-3 pr-4 text-right font-medium text-slate-ink">Mensualité</th>
              <th className="py-3 pr-4 text-right font-medium text-slate-ink">Capital</th>
              <th className="py-3 pr-4 text-right font-medium text-slate-ink">Intérêts</th>
              <th className="py-3 text-right font-medium text-slate-ink">Solde restant</th>
            </tr>
          </thead>
          <tbody>
            {slice.map((row) => (
              <tr key={row.month} className="border-b border-line last:border-b-0 hover:bg-mist">
                <td className="tabular py-3 pr-4 text-slate-ink">{row.month}</td>
                <td className="py-3 pr-4 text-slate-ink">{formatDate(row.date, { month: 'short', year: 'numeric' })}</td>
                <td className="tabular py-3 pr-4 text-right font-medium text-navy">{formatAmount(row.payment)}</td>
                <td className="tabular py-3 pr-4 text-right text-navy">{formatAmount(row.capital)}</td>
                <td className="tabular py-3 pr-4 text-right text-slate-ink">{formatAmount(row.interest)}</td>
                <td className="tabular py-3 text-right font-medium text-navy">{formatAmount(row.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
          <p className="text-xs text-slate-ink">
            Mois {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, schedule.length)} sur{' '}
            {schedule.length}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              className="rounded border border-line bg-white px-3 py-1 text-xs font-medium text-navy transition-colors hover:border-blue disabled:cursor-not-allowed disabled:opacity-40"
            >
              ← Précédent
            </button>
            <button
              type="button"
              disabled={page === totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
              className="rounded border border-line bg-white px-3 py-1 text-xs font-medium text-navy transition-colors hover:border-blue disabled:cursor-not-allowed disabled:opacity-40"
            >
              Suivant →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
