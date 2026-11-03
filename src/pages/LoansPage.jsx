import { Link } from 'react-router'
import { loans } from '../data/loans'
import { loanApplications } from '../data/loanApplications'
import { formatAmount, formatDate } from '../utils/format'
import {
  generateSchedule,
  calculateMonthlyPayment,
} from '../utils/loanCalculations'
import LoanStatusBadge from '../components/LoanStatusBadge'
import KpiCard from '../components/KpiCard'

function getLoanSummary(loan) {
  const schedule = generateSchedule(
    loan.amount,
    loan.annualRate,
    loan.months,
    loan.startDate,
  )
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const remaining = schedule.filter((e) => new Date(e.date) >= today)
  const remainingBalance =
    remaining.length > 0
      ? remaining[remaining.length - 1].remainingBalance +
        remaining[0].capital +
        remaining[0].interest
      : 0
  const nextPayment = remaining.length > 0 ? remaining[0] : null
  return { remainingBalance, nextPayment, remaining }
}

export default function LoansPage() {
  const totalCapital = loans.reduce((sum, l) => {
    const { remainingBalance } = getLoanSummary(l)
    return sum + remainingBalance
  }, 0)

  const totalMonthly = loans.reduce((l, loan) => {
    const m = calculateMonthlyPayment(loan.amount, loan.annualRate, loan.months)
    return l + m
  }, 0)

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-blue">Financement</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-navy">Crédits</h1>
          <p className="mt-2 max-w-xl text-slate-ink">
            Gérez vos crédits professionnels, suivez vos remboursements et simulez de nouveaux financements.
          </p>
        </div>
        <Link
          to="/credits/simulation"
          className="inline-flex items-center gap-2 rounded-md bg-navy px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-navy/90"
        >
          + Simuler un crédit
        </Link>
      </div>

      {/* KPIs */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <KpiCard
          label="Encours total"
          value={formatAmount(totalCapital)}
          tone="default"
        />
        <KpiCard
          label="Mensualités totales"
          value={formatAmount(totalMonthly)}
          sub="par mois"
          tone="warning"
        />
        <KpiCard
          label="Crédits actifs"
          value={loans.length}
          sub={loans.length > 1 ? 'crédits en cours' : 'crédit en cours'}
          tone="default"
        />
      </div>

      {/* Crédits actifs */}
      <div className="mt-10">
        <h2 className="font-display text-lg font-bold text-navy">Crédits actifs</h2>

        {loans.length === 0 ? (
          <div className="mt-6 border border-line bg-white p-10 text-center">
            <p className="text-slate-ink">Aucun crédit actif.</p>
            <Link
              to="/credits/simulation"
              className="mt-4 inline-block text-sm font-medium text-blue hover:text-blue/80"
            >
              Simuler votre premier crédit →
            </Link>
          </div>
        ) : (
          <div className="mt-4 border border-line bg-white">
            {loans.map((loan) => {
              const { remainingBalance, nextPayment } = getLoanSummary(loan)
              const monthly = calculateMonthlyPayment(
                loan.amount,
                loan.annualRate,
                loan.months,
              )
              return (
                <Link
                  key={loan.id}
                  to={`/credits/${loan.id}`}
                  className="flex flex-wrap items-center justify-between gap-4 border-b border-line px-6 py-5 last:border-0 hover:bg-slate-50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <p className="font-medium text-navy">{loan.label}</p>
                      <LoanStatusBadge status={loan.status} />
                    </div>
                    <p className="mt-1 text-sm text-slate-ink">{loan.description}</p>
                    <p className="mt-1 text-xs text-slate-ink">
                      Montant initial : {formatAmount(loan.amount)} ·{' '}
                      {(loan.annualRate * 100).toFixed(1)} % · {loan.months} mois
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="tabular font-display text-xl font-bold text-navy">
                      {formatAmount(remainingBalance)}
                    </p>
                    <p className="mt-1 text-xs text-slate-ink">solde restant</p>
                    {nextPayment && (
                      <p className="mt-1 text-xs text-slate-ink">
                        Prochaine échéance :{' '}
                        <span className="font-medium text-navy">
                          {formatAmount(monthly)}
                        </span>{' '}
                        le {formatDate(nextPayment.date, { day: '2-digit', month: 'short' })}
                      </p>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* Demandes en cours */}
      {loanApplications.length > 0 && (
        <div className="mt-10">
          <h2 className="font-display text-lg font-bold text-navy">Demandes de crédit</h2>
          <div className="mt-4 border border-line bg-white">
            {loanApplications.map((app) => (
              <div
                key={app.id}
                className="flex flex-wrap items-center justify-between gap-4 border-b border-line px-6 py-5 last:border-0"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <p className="font-medium text-navy">{app.label}</p>
                    <LoanStatusBadge status={app.status} />
                  </div>
                  <p className="mt-1 text-sm text-slate-ink">{app.description}</p>
                  <p className="mt-1 text-xs text-slate-ink">
                    Demandée le {formatDate(app.requestDate, { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="tabular font-display text-xl font-bold text-navy">
                    {formatAmount(app.amount)}
                  </p>
                  <p className="mt-1 text-xs text-slate-ink">
                    {app.months} mois · {(app.annualRate * 100).toFixed(1)} %
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
