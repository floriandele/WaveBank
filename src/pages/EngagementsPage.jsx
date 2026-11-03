import { useState } from 'react'
import { engagements } from '../data/engagements'
import { accounts } from '../data/accounts'
import EngagementRow from '../components/EngagementRow'
import { formatAmount } from '../utils/format'

export default function EngagementsPage() {
  const [activeAccountId, setActiveAccountId] = useState('tous')
  const [showArchived, setShowArchived] = useState(false)

  // Build account filter options
  const accountOptions = [
    { id: 'tous', name: 'Tous les comptes' },
    ...accounts,
  ]

  // Filter by account and active status
  const filtered = engagements.filter((eng) => {
    const matchAccount = activeAccountId === 'tous' || eng.accountId === activeAccountId
    const matchActive = showArchived || eng.active
    return matchAccount && matchActive
  })

  // Group by category
  const grouped = filtered.reduce((acc, eng) => {
    if (!acc[eng.category]) acc[eng.category] = []
    acc[eng.category].push(eng)
    return acc
  }, {})

  // Total monthly for the current filter
  const total = filtered
    .filter((eng) => eng.active)
    .reduce((sum, eng) => sum + eng.amount, 0)

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <p className="text-sm font-medium text-blue">Charges récurrentes</p>
      <h1 className="mt-2 font-display text-3xl font-bold text-navy">Engagements mensuels</h1>
      <p className="mt-2 max-w-xl text-slate-ink">
        Visualisez et anticipez l'ensemble de vos obligations financières récurrentes par compte.
      </p>

      {/* Filters */}
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <div className="flex gap-1 border-b border-line">
          {accountOptions.map((account) => (
            <button
              key={account.id}
              type="button"
              onClick={() => setActiveAccountId(account.id)}
              className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                activeAccountId === account.id
                  ? 'border-blue text-navy'
                  : 'border-transparent text-slate-ink hover:text-navy'
              }`}
            >
              {account.name}
            </button>
          ))}
        </div>
      </div>

      {/* Total monthly banner */}
      <div className="mt-6 flex items-center justify-between rounded-xl border border-line bg-white px-6 py-4">
        <div>
          <p className="text-sm text-slate-ink">Total mensuel récurrent</p>
          <p className="mt-0.5 font-display text-2xl font-bold text-navy">
            {formatAmount(total)}
          </p>
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-ink">
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(e) => setShowArchived(e.target.checked)}
            className="h-4 w-4 rounded border-line accent-blue"
          />
          Afficher les archivés
        </label>
      </div>

      {/* Engagements list */}
      {filtered.length === 0 ? (
        <div className="mt-6 rounded-xl border border-line bg-white px-6 py-12 text-center">
          <p className="text-slate-ink">Aucun engagement mensuel pour ce compte.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-8">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-slate-ink">
                  {category}
                </h2>
                <span className="text-sm font-medium text-navy">
                  {formatAmount(items.filter((i) => i.active).reduce((s, i) => s + i.amount, 0))}
                  <span className="ml-1 text-xs font-normal text-slate-ink">/ mois</span>
                </span>
              </div>
              <div className="rounded-xl border border-line bg-white px-4">
                {items.map((engagement) => (
                  <EngagementRow key={engagement.id} engagement={engagement} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
