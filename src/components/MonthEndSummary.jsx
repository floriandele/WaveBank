import { useMemo } from 'react'
import { formatAmount, formatDate } from '../utils/format'
import { getMinBalance, detectOverdraftRisk, getTopExpenses, getTotalExpenses } from '../utils/forecast'

/**
 * MonthEndSummary – Résumé de la projection de fin de mois.
 *
 * Props:
 *   currentBalance   {number}  solde actuel consolidé (comptes EUR)
 *   forecastData     {Array}   données de projection filtrées pour le mois courant
 *   transactions     {Array}   toutes les transactions du mois (pour les top dépenses)
 *   todayStr         {string}  date ISO de référence (optionnel, défaut: today)
 */
export default function MonthEndSummary({ currentBalance, forecastData = [], transactions = [], todayStr }) {
  const minEntry = useMemo(() => getMinBalance(forecastData), [forecastData])
  const risk = useMemo(() => detectOverdraftRisk(forecastData), [forecastData])
  const topExpenses = useMemo(() => getTopExpenses(transactions, todayStr, 5), [transactions, todayStr])
  const totalExpenses = useMemo(() => getTotalExpenses(transactions, todayStr), [transactions, todayStr])

  const hasData = forecastData.length > 0

  return (
    <div className="border border-line bg-white p-6">
      {/* En-tête avec alerte éventuelle */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-lg font-bold text-navy">
            Projection fin de mois
          </h3>
          <p className="text-sm text-slate-ink">
            Évolution prévisionnelle jusqu'au dernier jour du mois courant
          </p>
        </div>
        {risk === 'negative' && (
          <span
            role="status"
            aria-label="Alerte découvert"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700"
          >
            <span aria-hidden="true">⚠️</span> Risque découvert
          </span>
        )}
        {risk === 'warning' && (
          <span
            role="status"
            aria-label="Alerte solde bas"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700"
          >
            <span aria-hidden="true">⚠️</span> Solde bas
          </span>
        )}
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-3">
        {/* Solde actuel */}
        <div className="border-l-4 border-l-blue border-y border-r border-line p-4">
          <p className="text-sm text-slate-ink">Solde actuel (EUR)</p>
          <p className="tabular mt-1 font-display text-2xl font-bold text-navy">
            {formatAmount(currentBalance)}
          </p>
        </div>

        {/* Solde minimum projeté */}
        <div
          className={`border-l-4 border-y border-r border-line p-4 ${
            risk === 'negative'
              ? 'border-l-red-600'
              : risk === 'warning'
              ? 'border-l-amber-500'
              : 'border-l-blue'
          }`}
        >
          <p className="text-sm text-slate-ink">Solde minimum projeté</p>
          {hasData && minEntry ? (
            <>
              <p
                className={`tabular mt-1 font-display text-2xl font-bold ${
                  risk === 'negative'
                    ? 'text-red-700'
                    : risk === 'warning'
                    ? 'text-amber-700'
                    : 'text-navy'
                }`}
              >
                {formatAmount(minEntry.balance)}
              </p>
              <p className="mt-0.5 text-xs text-slate-ink">
                le {formatDate(minEntry.date, { day: '2-digit', month: 'long' })}
              </p>
            </>
          ) : (
            <p className="tabular mt-1 font-display text-2xl font-bold text-navy">—</p>
          )}
        </div>

        {/* Total dépenses du mois */}
        <div className="border-l-4 border-l-amber-500 border-y border-r border-line p-4">
          <p className="text-sm text-slate-ink">Dépenses du mois</p>
          <p className="tabular mt-1 font-display text-2xl font-bold text-amber-700">
            {formatAmount(totalExpenses)}
          </p>
          <p className="mt-0.5 text-xs text-slate-ink">décaissements planifiés</p>
        </div>
      </div>

      {/* Principales dépenses */}
      <div className="mt-6">
        <h4 className="font-display text-sm font-semibold text-navy">
          Principales dépenses du mois
        </h4>
        {topExpenses.length === 0 ? (
          <p className="mt-3 text-sm text-slate-ink italic">Aucune dépense planifiée ce mois-ci.</p>
        ) : (
          <ul className="mt-3 divide-y divide-line">
            {topExpenses.map((t, idx) => (
              <li key={idx} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-navy">{t.label}</p>
                  <p className="mt-0.5 text-xs text-slate-ink">
                    {t.category} — {formatDate(t.date, { day: '2-digit', month: 'short' })}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="tabular text-sm font-semibold text-red-700">
                    {formatAmount(t.amount)}
                  </p>
                  <p className="tabular mt-0.5 text-xs text-slate-ink">
                    cumul : {formatAmount(t.cumulativeImpact)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
