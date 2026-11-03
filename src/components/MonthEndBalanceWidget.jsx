import { useMemo } from 'react'
import { computeMonthEndProjection } from '../utils/monthEndBalance'
import { formatAmount, formatDate, formatDateShort } from '../utils/format'

/**
 * Mini barre de progression horizontale représentant la trajectoire du solde.
 */
function BalanceSparkline({ forecastPoints }) {
  if (!forecastPoints || forecastPoints.length < 2) return null

  const balances = forecastPoints.map((p) => p.balance)
  const minVal = Math.min(...balances)
  const maxVal = Math.max(...balances)
  const range = maxVal - minVal || 1

  const width = 200
  const height = 40
  const padX = 4

  const points = forecastPoints.map((p, i) => {
    const x = padX + ((i / (forecastPoints.length - 1)) * (width - padX * 2))
    const y = height - ((p.balance - minVal) / range) * (height - 4) - 2
    return `${x},${y}`
  })

  const hasNegative = forecastPoints.some((p) => p.balance < 0)

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full"
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke={hasNegative ? '#EF4444' : '#10B981'}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}

/**
 * Widget « Solde de fin de mois » affiché sur la page de détail d'un compte.
 *
 * @param {{ account: Object, allTransactions: Array, today?: string }} props
 */
export default function MonthEndBalanceWidget({ account, allTransactions, today }) {
  const projection = useMemo(
    () => computeMonthEndProjection(account, allTransactions, today),
    [account, allTransactions, today],
  )

  const {
    forecastPoints,
    monthEndBalance,
    monthEndDate,
    minBalance,
    minBalanceDate,
    isNegative,
    contributingTransactions,
  } = projection

  const isMinNegative = minBalance < 0
  const isMonthEndNegative = monthEndBalance < 0

  return (
    <section className="mt-8">
      <h2 className="font-display text-lg font-bold text-navy">Solde de fin de mois</h2>

      <div className="mt-4 border border-line bg-white p-6">
        {/* Alerte solde négatif */}
        {isNegative && (
          <div className="mb-5 flex items-start gap-3 rounded border border-red-200 bg-red-50 px-4 py-3">
            <span className="mt-0.5 text-base" aria-hidden="true">⚠</span>
            <div>
              <p className="text-sm font-semibold text-red-700">Risque de solde négatif</p>
              <p className="mt-0.5 text-sm text-red-600">
                Le solde projeté devient négatif avant le{' '}
                {formatDate(monthEndDate, { day: 'numeric', month: 'long' })}. Vérifiez vos
                décaissements à venir.
              </p>
            </div>
          </div>
        )}

        {/* Grille : solde fin de mois + solde minimum */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
          {/* Solde fin de mois */}
          <div className="border border-line p-4">
            <p className="text-xs text-slate-ink">
              Solde au {formatDate(monthEndDate, { day: 'numeric', month: 'long' })}
            </p>
            <p
              className={`tabular mt-1 font-display text-xl font-bold ${
                isMonthEndNegative ? 'text-red-600' : 'text-navy'
              }`}
            >
              {formatAmount(monthEndBalance, account.currency)}
            </p>
          </div>

          {/* Solde minimum projeté */}
          <div
            className={`border p-4 ${
              isMinNegative
                ? 'border-red-200 bg-red-50'
                : 'border-line bg-white'
            }`}
          >
            <p className="text-xs text-slate-ink">
              Solde minimum prévu
              {minBalanceDate !== projection.today && (
                <span className="ml-1 text-slate-ink">
                  ({formatDateShort(minBalanceDate)})
                </span>
              )}
            </p>
            <p
              className={`tabular mt-1 font-display text-xl font-bold ${
                isMinNegative ? 'text-red-600' : 'text-[#10B981]'
              }`}
            >
              {formatAmount(minBalance, account.currency)}
            </p>
          </div>
        </div>

        {/* Sparkline */}
        {forecastPoints.length > 1 && (
          <div className="mt-4 h-10 w-full">
            <BalanceSparkline forecastPoints={forecastPoints} />
          </div>
        )}

        {/* Liste des transactions contributives */}
        {contributingTransactions.length > 0 && (
          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-ink">
              Transactions du mois en cours
            </p>
            <ul className="mt-2 divide-y divide-line">
              {contributingTransactions.map((t) => {
                const isCredit = t.amount > 0
                return (
                  <li
                    key={t.id}
                    className="flex items-center justify-between gap-3 py-2.5"
                  >
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate text-sm text-navy">{t.label}</span>
                      <span className="mt-0.5 text-xs text-slate-ink">
                        {formatDate(t.date, { day: 'numeric', month: 'short' })} ·{' '}
                        {t.category}
                      </span>
                    </div>
                    <span
                      className={`tabular shrink-0 text-sm font-semibold ${
                        isCredit ? 'text-[#10B981]' : 'text-slate-ink'
                      }`}
                    >
                      {isCredit ? '+' : ''}
                      {formatAmount(t.amount, account.currency)}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        {contributingTransactions.length === 0 && (
          <p className="mt-4 text-sm text-slate-ink">
            Aucun mouvement enregistré pour ce mois.
          </p>
        )}
      </div>
    </section>
  )
}
