import { Link } from 'react-router'
import { formatAmount, formatDate } from '../utils/format'
import { getCurrentBalanceFromSchedule } from '../utils/loanCalculations'
import LoanStatusBadge from './LoanStatusBadge'

export default function LoanCard({ loan }) {
  const { id, type, label, amount, rate, monthlyPayment, status, startDate, schedule } = loan

  const currentBalance = schedule && schedule.length > 0
    ? getCurrentBalanceFromSchedule(amount, schedule)
    : amount

  const isActive = status === 'en_cours' || status === 'approuvé'

  return (
    <div className="border border-line bg-white p-6 flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm text-slate-ink">{type}</p>
          <h3 className="mt-1 font-display text-lg font-bold text-navy">{label}</h3>
        </div>
        <LoanStatusBadge status={status} />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <p className="text-xs text-slate-ink">Montant</p>
          <p className="tabular mt-1 font-display text-base font-bold text-navy">
            {formatAmount(amount)}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-ink">Taux annuel</p>
          <p className="tabular mt-1 font-display text-base font-bold text-navy">{rate} %</p>
        </div>
        {monthlyPayment !== null && (
          <div>
            <p className="text-xs text-slate-ink">Mensualité</p>
            <p className="tabular mt-1 font-display text-base font-bold text-navy">
              {formatAmount(monthlyPayment)}
            </p>
          </div>
        )}
        {isActive && (
          <div>
            <p className="text-xs text-slate-ink">Solde restant</p>
            <p className="tabular mt-1 font-display text-base font-bold text-blue">
              {formatAmount(currentBalance)}
            </p>
          </div>
        )}
        {startDate && (
          <div>
            <p className="text-xs text-slate-ink">Date de début</p>
            <p className="tabular mt-1 text-sm text-navy">{formatDate(startDate)}</p>
          </div>
        )}
      </div>

      {isActive && (
        <div className="pt-2 border-t border-line">
          <Link
            to={`/prets/${id}`}
            className="text-sm font-medium text-blue hover:text-blue-dark"
          >
            Voir le détail →
          </Link>
        </div>
      )}
    </div>
  )
}
