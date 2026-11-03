import { useState } from 'react'
import { Link } from 'react-router'
import { loans } from '../data/loans'
import LoanCard from '../components/LoanCard'
import KpiCard from '../components/KpiCard'
import { formatAmount } from '../utils/format'
import { getCurrentBalanceFromSchedule } from '../utils/loanCalculations'

const FILTERS = [
  { key: 'actifs', label: 'Actifs' },
  { key: 'en_attente', label: 'En attente' },
  { key: 'historique', label: 'Historique' },
]

export default function LoansPage() {
  const [activeFilter, setActiveFilter] = useState('actifs')

  const activeLoans = loans.filter((l) => l.status === 'en_cours' || l.status === 'approuvé')
  const pendingLoans = loans.filter((l) => l.status === 'en_attente')
  const historyLoans = loans.filter((l) => l.status === 'rejeté')

  const totalBalance = activeLoans.reduce((sum, l) => {
    const balance = l.schedule && l.schedule.length > 0
      ? getCurrentBalanceFromSchedule(l.amount, l.schedule)
      : l.amount
    return sum + balance
  }, 0)

  const totalMonthly = activeLoans.reduce((sum, l) => sum + (l.monthlyPayment ?? 0), 0)

  let displayedLoans
  if (activeFilter === 'actifs') displayedLoans = activeLoans
  else if (activeFilter === 'en_attente') displayedLoans = pendingLoans
  else displayedLoans = historyLoans

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <p className="text-sm font-medium text-blue">Financement</p>
      <h1 className="mt-2 font-display text-3xl font-bold text-navy">Prêts</h1>
      <p className="mt-2 max-w-xl text-slate-ink">
        Gérez vos prêts en cours, suivez vos remboursements et simulez de nouvelles demandes.
      </p>

      {/* KPI row */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <KpiCard
          label="Capital restant dû"
          value={formatAmount(totalBalance)}
          sub={`${activeLoans.length} prêt${activeLoans.length > 1 ? 's' : ''} actif${activeLoans.length > 1 ? 's' : ''}`}
          tone="default"
        />
        <KpiCard
          label="Mensualités totales"
          value={formatAmount(totalMonthly)}
          sub="par mois"
          tone="warning"
        />
        <KpiCard
          label="Demandes en attente"
          value={pendingLoans.length}
          sub={pendingLoans.length > 0 ? "en cours d'instruction" : 'aucune demande en cours'}
          tone={pendingLoans.length > 0 ? 'warning' : 'default'}
        />
      </div>

      {/* CTA simulateur */}
      <div className="mt-8 flex items-center justify-between">
        <div className="flex gap-1 border-b border-line flex-1">
          {FILTERS.map((filter) => (
            <button
              key={filter.key}
              type="button"
              onClick={() => setActiveFilter(filter.key)}
              className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                activeFilter === filter.key
                  ? 'border-blue text-navy'
                  : 'border-transparent text-slate-ink hover:text-navy'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <Link
          to="/prets/simulateur"
          className="ml-6 shrink-0 rounded bg-blue px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-dark"
        >
          + Simuler un prêt
        </Link>
      </div>

      {/* Liste */}
      <div className="mt-6 space-y-4">
        {displayedLoans.length === 0 ? (
          <p className="py-6 text-sm text-slate-ink">
            {activeFilter === 'actifs' && 'Aucun prêt actif.'}
            {activeFilter === 'en_attente' && 'Aucune demande en attente.'}
            {activeFilter === 'historique' && "Aucun prêt dans l'historique."}
          </p>
        ) : (
          displayedLoans.map((loan) => <LoanCard key={loan.id} loan={loan} />)
        )}
      </div>
    </section>
  )
}
