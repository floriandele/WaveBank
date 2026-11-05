import { Link } from 'react-router'
import LoanStatusBadge from './LoanStatusBadge'
import { formatAmount } from '../utils/format'
import { calculateMonthlyPayment, calculateRemainingBalance } from '../utils/loanCalculations'

export default function LoanCard({ loan }) {
  const { id, number, name, type, principal, annualRate, durationMonths, startDate, status, color } = loan

  const monthlyPayment = calculateMonthlyPayment(principal, annualRate, durationMonths)
  const remainingBalance = calculateRemainingBalance(principal, annualRate, durationMonths, startDate)

  return (
    <Link
      to={`/prets/${id}`}
      className="group block border border-line bg-white transition-colors hover:border-blue"
    >
      <div className="h-1.5 w-full" style={{ backgroundColor: color }} />
      <div className="p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-slate-ink">{type} — {number}</p>
            <h3 className="mt-1 font-display text-base font-bold text-navy truncate">{name}</h3>
          </div>
          <LoanStatusBadge status={status} />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-ink">Montant emprunté</p>
            <p className="tabular mt-1 font-display text-lg font-bold text-navy">
              {formatAmount(principal)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-ink">Mensualité</p>
            <p className="tabular mt-1 font-display text-lg font-bold text-navy">
              {formatAmount(monthlyPayment)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-ink">Taux annuel</p>
            <p className="tabular mt-1 font-medium text-navy">
              {annualRate.toLocaleString('fr-FR', { minimumFractionDigits: 1 })} %
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-ink">Solde restant</p>
            <p className="tabular mt-1 font-medium text-navy">
              {formatAmount(remainingBalance)}
            </p>
          </div>
        </div>

        <p className="mt-5 text-sm font-medium text-blue group-hover:text-blue-dark">
          Voir le détail →
        </p>
      </div>
    </Link>
  )
}
