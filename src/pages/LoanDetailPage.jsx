import { Link, useParams } from 'react-router'
import { loans } from '../data/loans'
import AmortizationTable from '../components/AmortizationTable'
import LoanStatusBadge from '../components/LoanStatusBadge'
import { formatAmount, formatDate } from '../utils/format'
import {
  calculateMonthlyPayment,
  calculateRemainingBalance,
  calculateRemainingMonths,
  generateAmortizationSchedule,
} from '../utils/loanCalculations'

export default function LoanDetailPage() {
  const { id } = useParams()
  const loan = loans.find((l) => l.id === id)

  if (!loan) {
    return (
      <section className="mx-auto max-w-6xl px-6 py-16 text-center">
        <h1 className="font-display text-2xl font-bold text-navy">Prêt introuvable</h1>
        <p className="mt-2 text-slate-ink">
          Ce prêt n'existe pas ou n'est plus rattaché à votre espace professionnel.
        </p>
        <Link
          to="/prets"
          className="mt-6 inline-block text-sm font-medium text-blue hover:text-blue-dark"
        >
          ← Retour aux prêts
        </Link>
      </section>
    )
  }

  const { name, number, type, principal, annualRate, durationMonths, startDate, status, color } = loan

  const monthlyPayment = calculateMonthlyPayment(principal, annualRate, durationMonths)
  const remainingBalance = calculateRemainingBalance(principal, annualRate, durationMonths, startDate)
  const remainingMonths = calculateRemainingMonths(durationMonths, startDate)
  const schedule = generateAmortizationSchedule(principal, annualRate, durationMonths, startDate)

  // Prochaine échéance : trouver la prochaine entrée dans le calendrier
  const today = new Date()
  const nextEntry = schedule.find((row) => new Date(row.date) > today)

  // Calcul de la fin de prêt
  const endDate = new Date(startDate)
  endDate.setMonth(endDate.getMonth() + durationMonths)

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <Link to="/prets" className="text-sm font-medium text-blue hover:text-blue-dark">
        ← Retour aux prêts
      </Link>

      {/* En-tête */}
      <div className="mt-6 border border-line bg-white">
        <div className="h-1.5 w-full" style={{ backgroundColor: color }} />
        <div className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm text-slate-ink">
                {type} — {number}
              </p>
              <h1 className="mt-1 font-display text-2xl font-bold text-navy">{name}</h1>
            </div>
            <LoanStatusBadge status={status} />
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs text-slate-ink">Montant initial</p>
              <p className="tabular mt-1 font-display text-xl font-bold text-navy">
                {formatAmount(principal)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-ink">Taux annuel</p>
              <p className="tabular mt-1 font-display text-xl font-bold text-navy">
                {annualRate.toLocaleString('fr-FR', { minimumFractionDigits: 1 })} %
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-ink">Durée totale</p>
              <p className="tabular mt-1 font-display text-xl font-bold text-navy">
                {durationMonths} mois
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-ink">Mensualité</p>
              <p className="tabular mt-1 font-display text-xl font-bold text-navy">
                {formatAmount(monthlyPayment)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-ink">Solde restant dû</p>
              <p className="tabular mt-1 font-display text-xl font-bold text-blue">
                {formatAmount(remainingBalance)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-ink">Mois restants</p>
              <p className="tabular mt-1 font-display text-xl font-bold text-navy">
                {remainingMonths}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-ink">Prochaine échéance</p>
              <p className="tabular mt-1 font-display text-xl font-bold text-navy">
                {nextEntry ? formatDate(nextEntry.date, { day: '2-digit', month: 'long', year: 'numeric' }) : '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-ink">Date de fin prévue</p>
              <p className="tabular mt-1 font-display text-xl font-bold text-navy">
                {formatDate(endDate.toISOString(), { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          to={`/prets/demande?montant=${principal}&duree=${durationMonths}`}
          className="inline-flex items-center gap-2 rounded border border-line bg-white px-4 py-2 text-sm font-medium text-navy transition-colors hover:border-blue"
        >
          Simuler un remboursement anticipé
        </Link>
      </div>

      {/* Calendrier d'amortissement */}
      <div className="mt-10">
        <h2 className="font-display text-xl font-bold text-navy">Calendrier d'amortissement</h2>
        <p className="mt-1 text-sm text-slate-ink">
          Tableau complet des {durationMonths} échéances de votre prêt.
        </p>
        <div className="mt-6 border border-line bg-white p-6">
          <AmortizationTable schedule={schedule} />
        </div>
      </div>
    </section>
  )
}
