import { useState } from 'react'
import { transactions } from '../data/transactions'
import { accounts } from '../data/accounts'
import { company } from '../data/company'
import { formatAmount, formatDateShort } from '../utils/format'

const accountCurrencyMap = Object.fromEntries(accounts.map((a) => [a.id, a.currency]))

function getCurrentMonthLabel() {
  return new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(new Date())
}

function ChevronIcon({ open }) {
  return (
    <svg
      className={`h-5 w-5 shrink-0 text-slate-ink transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  )
}

export default function CommitmentsPage() {
  const [openCategories, setOpenCategories] = useState({})

  const now = new Date()
  const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const commitments = transactions.filter(
    (t) => t.amount < 0 && t.date.startsWith(monthStr),
  )

  const toggleCategory = (cat) =>
    setOpenCategories((prev) => ({ ...prev, [cat]: !prev[cat] }))

  // ── header section ──────────────────────────────────────────────────────────
  const header = (
    <section className="bg-navy">
      <div className="mx-auto max-w-6xl px-6 pt-12 pb-20">
        <p className="text-sm font-medium text-blue">{company.name}</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">
          Engagements mensuels
        </h1>
        <p className="mt-2 text-sm text-white/60 capitalize">{getCurrentMonthLabel()}</p>
      </div>
    </section>
  )

  // ── empty state ──────────────────────────────────────────────────────────────
  if (commitments.length === 0) {
    return (
      <>
        {header}
        <section className="mx-auto max-w-6xl px-6 pb-16">
          <div className="-mt-12 border border-line bg-white p-12 text-center">
            <p className="font-display text-lg font-semibold text-navy">
              Aucun engagement ce mois-ci
            </p>
            <p className="mt-1 text-sm text-slate-ink">
              Aucune dépense enregistrée pour {getCurrentMonthLabel()}.
            </p>
          </div>
        </section>
      </>
    )
  }

  // ── totals by currency ───────────────────────────────────────────────────────
  const totalByCurrency = {}
  const countByCurrency = {}
  for (const t of commitments) {
    const currency = accountCurrencyMap[t.accountId] ?? 'EUR'
    totalByCurrency[currency] = (totalByCurrency[currency] ?? 0) + t.amount
    countByCurrency[currency] = (countByCurrency[currency] ?? 0) + 1
  }

  // ── group by category ────────────────────────────────────────────────────────
  const grouped = {}
  for (const t of commitments) {
    const cat = t.category ?? 'Divers'
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat].push(t)
  }

  return (
    <>
      {header}

      <section className="mx-auto max-w-6xl px-6 pb-16">
        {/* KPI totals */}
        <div
          className={`-mt-12 grid gap-4 ${
            Object.keys(totalByCurrency).length === 1 ? 'sm:grid-cols-2' : 'sm:grid-cols-2'
          }`}
        >
          {Object.entries(totalByCurrency).map(([currency, total]) => (
            <div
              key={currency}
              className="border-l-4 border-l-red-600 border-y border-r border-line bg-white p-5"
            >
              <p className="text-sm text-slate-ink">
                Total engagements ({currency})
              </p>
              <p className="tabular mt-2 font-display text-2xl font-bold text-navy sm:text-3xl">
                {formatAmount(Math.abs(total), currency)}
              </p>
              <p className="mt-1 text-sm text-red-700">
                {countByCurrency[currency]} transaction
                {countByCurrency[currency] > 1 ? 's' : ''}
              </p>
            </div>
          ))}
        </div>

        {/* Category accordion */}
        <div className="mt-8 flex flex-col gap-3">
          {Object.entries(grouped).map(([category, txs]) => {
            const isOpen = openCategories[category] ?? false

            // Totals per currency within this category
            const catTotals = {}
            for (const t of txs) {
              const currency = accountCurrencyMap[t.accountId] ?? 'EUR'
              catTotals[currency] = (catTotals[currency] ?? 0) + t.amount
            }

            return (
              <div key={category} className="border border-line bg-white">
                <button
                  type="button"
                  onClick={() => toggleCategory(category)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left hover:bg-mist transition-colors"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-display font-semibold text-navy truncate">
                      {category}
                    </span>
                    <span className="shrink-0 rounded-full bg-mist border border-line px-2 py-0.5 text-xs font-medium text-slate-ink">
                      {txs.length} transaction{txs.length > 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      {Object.entries(catTotals).map(([currency, total]) => (
                        <p
                          key={currency}
                          className="tabular font-display text-base font-bold text-red-700"
                        >
                          −&thinsp;{formatAmount(Math.abs(total), currency)}
                        </p>
                      ))}
                    </div>
                    <ChevronIcon open={isOpen} />
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-line divide-y divide-line">
                    {txs.map((t) => {
                      const currency = accountCurrencyMap[t.accountId] ?? 'EUR'
                      return (
                        <div
                          key={t.id}
                          className="flex items-center justify-between gap-4 px-6 py-3"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-navy truncate">{t.label}</p>
                            <p className="mt-0.5 text-xs text-slate-ink">
                              {formatDateShort(t.date)}
                            </p>
                          </div>
                          <span className="tabular shrink-0 text-sm font-semibold text-red-700">
                            {formatAmount(t.amount, currency)}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>
    </>
  )
}
