import { Link } from 'react-router'
import { formatAmount, formatDate } from '../utils/format'

const STATUS_LABEL = {
  en_demande: 'En demande',
  accepte: 'Accepté',
  en_cours: 'En cours',
  clos: 'Clos',
}

const STATUS_STYLE = {
  en_demande: 'bg-amber-100 text-amber-800',
  accepte: 'bg-blue/10 text-blue',
  en_cours: 'bg-green-100 text-green-800',
  clos: 'bg-slate-100 text-slate-600',
}

const STATUS_BORDER = {
  en_demande: 'border-l-amber-500',
  accepte: 'border-l-blue',
  en_cours: 'border-l-green-600',
  clos: 'border-l-slate-400',
}

export default function LoanCard({ loan }) {
  const canViewDetail = loan.status === 'en_cours' || loan.status === 'accepte'

  return (
    <div
      className={`border-l-4 border-y border-r border-line bg-white p-5 ${STATUS_BORDER[loan.status] ?? 'border-l-slate-400'}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span
            className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLE[loan.status] ?? ''}`}
          >
            {STATUS_LABEL[loan.status] ?? loan.status}
          </span>
          <p className="mt-2 font-display text-xl font-bold text-navy">
            {formatAmount(loan.amount)}
          </p>
          <p className="text-sm text-slate-ink">
            {loan.duration} mois — demandé le {formatDate(loan.appliedDate)}
          </p>
        </div>

        <div className="text-right">
          {loan.monthlyPayment && (
            <p className="tabular font-display text-lg font-bold text-navy">
              {formatAmount(loan.monthlyPayment)}
              <span className="text-sm font-normal text-slate-ink"> /mois</span>
            </p>
          )}
          {loan.nextPaymentDate && (
            <p className="mt-1 text-sm text-slate-ink">
              Prochaine échéance : {formatDate(loan.nextPaymentDate)}
            </p>
          )}
          {loan.remainingBalance != null && loan.status === 'en_cours' && (
            <p className="mt-1 text-sm text-slate-ink">
              Solde restant : {formatAmount(loan.remainingBalance)}
            </p>
          )}
        </div>
      </div>

      {canViewDetail && (
        <div className="mt-4 flex justify-end">
          <Link
            to={`/prets/${loan.id}`}
            className="text-sm font-medium text-blue hover:text-blue-dark"
          >
            Voir le détail →
          </Link>
        </div>
      )}
    </div>
  )
}
