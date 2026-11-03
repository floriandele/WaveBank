import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { loans } from '../data/loans'
import { formatAmount, formatDate } from '../utils/format'
import {
  generateSchedule,
  getRemainingSchedule,
  calculateMonthlyPayment,
  calculateEarlyRepayment,
} from '../utils/loanCalculations'
import KpiCard from '../components/KpiCard'
import LoanStatusBadge from '../components/LoanStatusBadge'
import RepaymentScheduleTable from '../components/RepaymentScheduleTable'

export default function LoanDetailPage() {
  const { id } = useParams()
  const loan = loans.find((l) => l.id === id)

  const [earlyAmount, setEarlyAmount] = useState('')
  const [earlyError, setEarlyError] = useState('')
  const [earlyResult, setEarlyResult] = useState(null)
  const [showFullSchedule, setShowFullSchedule] = useState(false)

  if (!loan) {
    return (
      <section className="mx-auto max-w-6xl px-6 py-16 text-center">
        <h1 className="font-display text-2xl font-bold text-navy">Crédit introuvable</h1>
        <p className="mt-2 text-slate-ink">
          Ce crédit n'existe pas ou n'est plus rattaché à votre espace professionnel.
        </p>
        <Link
          to="/credits"
          className="mt-6 inline-block text-sm font-medium text-blue hover:text-blue/80"
        >
          Retour aux crédits
        </Link>
      </section>
    )
  }

  const fullSchedule = generateSchedule(
    loan.amount,
    loan.annualRate,
    loan.months,
    loan.startDate,
  )

  const remainingSchedule = getRemainingSchedule(
    loan.amount,
    loan.annualRate,
    loan.months,
    loan.startDate,
  )

  const monthly = calculateMonthlyPayment(loan.amount, loan.annualRate, loan.months)

  // Solde restant = solde au début de la prochaine échéance
  const remainingBalance =
    remainingSchedule.length > 0
      ? remainingSchedule[remainingSchedule.length - 1].remainingBalance +
        remainingSchedule[0].capital +
        remainingSchedule[0].interest
      : 0

  const nextPayment = remainingSchedule.length > 0 ? remainingSchedule[0] : null
  const totalPaid = fullSchedule.length - remainingSchedule.length
  const totalInterestPaid = fullSchedule
    .slice(0, totalPaid)
    .reduce((sum, e) => sum + e.interest, 0)

  function handleEarlyAmountChange(e) {
    setEarlyAmount(e.target.value)
    setEarlyError('')
    setEarlyResult(null)
  }

  function handleEarlySimulate(e) {
    e.preventDefault()
    const v = parseFloat(earlyAmount)
    if (!earlyAmount || isNaN(v) || v <= 0) {
      setEarlyError('Veuillez saisir un montant supérieur à 0 €.')
      return
    }
    if (v > remainingBalance) {
      setEarlyError(`Le montant ne peut pas dépasser le solde restant (${formatAmount(remainingBalance)}).`)
      return
    }
    const result = calculateEarlyRepayment(
      remainingBalance,
      loan.annualRate,
      remainingSchedule.length,
      v,
    )
    setEarlyResult(result)
  }

  const displayedSchedule = showFullSchedule ? remainingSchedule : remainingSchedule.slice(0, 24)

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <Link to="/credits" className="text-sm font-medium text-blue hover:text-blue/80">
        ← Retour aux crédits
      </Link>

      {/* Récapitulatif */}
      <div className="mt-6 border border-line bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-2xl font-bold text-navy">{loan.label}</h1>
              <LoanStatusBadge status={loan.status} />
            </div>
            <p className="mt-2 text-sm text-slate-ink">{loan.description}</p>
            <p className="mt-2 text-xs text-slate-ink">
              Démarré le{' '}
              {formatDate(loan.startDate, { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="text-right">
            <p className="tabular font-display text-3xl font-bold text-navy">
              {formatAmount(remainingBalance)}
            </p>
            <p className="mt-1 text-sm text-slate-ink">solde restant</p>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Montant initial"
          value={formatAmount(loan.amount)}
        />
        <KpiCard
          label="Taux annuel"
          value={`${(loan.annualRate * 100).toFixed(1)} %`}
        />
        <KpiCard
          label="Durée totale"
          value={`${loan.months} mois`}
          sub={`${remainingSchedule.length} mois restants`}
          tone="default"
        />
        <KpiCard
          label="Mensualité"
          value={formatAmount(monthly)}
          sub="par mois"
        />
      </div>

      {nextPayment && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <KpiCard
            label="Prochaine échéance"
            value={formatDate(nextPayment.date, { day: '2-digit', month: 'long', year: 'numeric' })}
            sub={`${formatAmount(nextPayment.total)} à régler`}
            tone="warning"
          />
          <KpiCard
            label="Intérêts remboursés"
            value={formatAmount(totalInterestPaid)}
            sub={`sur ${totalPaid} échéance${totalPaid > 1 ? 's' : ''}`}
            tone="default"
          />
        </div>
      )}

      {/* Remboursement anticipé */}
      <div className="mt-10">
        <h2 className="font-display text-lg font-bold text-navy">Remboursement anticipé</h2>
        <p className="mt-1 text-sm text-slate-ink">
          Simulez un remboursement partiel ou total pour estimer vos économies.
        </p>

        <div className="mt-4 border border-line bg-white p-6">
          <form onSubmit={handleEarlySimulate} className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
              <label
                htmlFor="earlyAmount"
                className="block text-sm font-medium text-navy"
              >
                Montant du remboursement anticipé
              </label>
              <div className="relative mt-2">
                <input
                  id="earlyAmount"
                  type="number"
                  min={1}
                  max={remainingBalance}
                  step={100}
                  value={earlyAmount}
                  onChange={handleEarlyAmountChange}
                  placeholder={`Max. ${formatAmount(remainingBalance)}`}
                  className={`w-full rounded-md border bg-white py-2.5 pl-4 pr-10 text-sm text-navy outline-none focus:ring-2 focus:ring-blue ${
                    earlyError ? 'border-red-500' : 'border-line'
                  }`}
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-ink">
                  €
                </span>
              </div>
              {earlyError && (
                <p className="mt-1 text-xs text-red-600">{earlyError}</p>
              )}
            </div>
            <button
              type="submit"
              className="rounded-md bg-navy px-5 py-2.5 text-sm font-medium text-white hover:bg-navy/90"
            >
              Simuler
            </button>
          </form>

          {earlyResult && (
            <div className="mt-6 border-t border-line pt-6">
              <h3 className="font-medium text-navy">Résultat de la simulation</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <KpiCard
                  label="Montant de sortie"
                  value={formatAmount(earlyResult.exitAmount)}
                />
                <KpiCard
                  label="Économies d'intérêts"
                  value={formatAmount(earlyResult.savedInterest)}
                  tone="positive"
                />
                {earlyResult.newBalance > 0 ? (
                  <KpiCard
                    label="Nouveau solde restant"
                    value={formatAmount(earlyResult.newBalance)}
                    sub={`${earlyResult.newSchedule.length} mois restants`}
                  />
                ) : (
                  <KpiCard
                    label="Statut"
                    value="Soldé"
                    sub="Crédit intégralement remboursé"
                    tone="positive"
                  />
                )}
              </div>

              {earlyResult.newSchedule.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-navy">
                    Nouveau calendrier ({earlyResult.newSchedule.length} échéances)
                  </h4>
                  <div className="mt-3 border border-line bg-white px-4 py-2">
                    <RepaymentScheduleTable
                      entries={earlyResult.newSchedule}
                      limit={24}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Calendrier de remboursement */}
      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-navy">
            Calendrier de remboursement
          </h2>
          {remainingSchedule.length > 24 && (
            <button
              type="button"
              onClick={() => setShowFullSchedule((v) => !v)}
              className="text-sm font-medium text-blue hover:text-blue/80"
            >
              {showFullSchedule
                ? 'Afficher moins'
                : `Voir les ${remainingSchedule.length} échéances restantes`}
            </button>
          )}
        </div>
        <p className="mt-1 text-sm text-slate-ink">
          {showFullSchedule
            ? `Toutes les ${remainingSchedule.length} échéances restantes`
            : `24 prochaines échéances sur ${remainingSchedule.length} restantes`}
        </p>
        <div className="mt-4 border border-line bg-white px-4 py-2">
          <RepaymentScheduleTable entries={displayedSchedule} />
        </div>
      </div>
    </section>
  )
}
