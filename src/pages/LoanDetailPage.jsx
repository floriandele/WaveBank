import { useState } from 'react'
import { useParams, Link } from 'react-router'
import { loans } from '../data/loans'
import LoanScheduleTable from '../components/LoanScheduleTable'
import KpiCard from '../components/KpiCard'
import { calculateEarlyRepaymentImpact } from '../utils/loanCalculations'
import { formatAmount, formatDate, formatPercentage } from '../utils/format'
import { company } from '../data/company'

const STATUS_LABEL = {
  en_demande: 'En demande',
  accepte: 'Accepté',
  en_cours: 'En cours',
  clos: 'Clos',
}

export default function LoanDetailPage() {
  const { id } = useParams()
  const loan = loans.find((l) => l.id === id)
  const [repayment, setRepayment] = useState('')
  const [impact, setImpact] = useState(null)
  const [repaymentWarning, setRepaymentWarning] = useState(null)

  if (!loan) {
    return (
      <section className="mx-auto max-w-6xl px-6 py-16 text-center">
        <h1 className="font-display text-2xl font-bold text-navy">Prêt introuvable</h1>
        <p className="mt-2 text-slate-ink">
          Ce prêt n'existe pas ou n'est plus rattaché à votre espace.
        </p>
        <Link to="/prets" className="mt-6 inline-block text-sm font-medium text-blue hover:text-blue-dark">
          ← Retour à mes prêts
        </Link>
      </section>
    )
  }

  // Nombre de mensualités déjà payées (pour surligner le tableau)
  const totalMonths = loan.schedule.length
  const currentMonth = totalMonths - (loan.remainingMonths ?? totalMonths)

  function handleSimulateRepayment() {
    const amount = parseFloat(repayment.replace(',', '.'))
    if (!amount || amount <= 0) return

    setRepaymentWarning(null)

    if (amount > loan.remainingBalance) {
      setRepaymentWarning(
        `Le montant saisi (${formatAmount(amount)}) dépasse le solde restant dû (${formatAmount(loan.remainingBalance)}). Le remboursement sera limité au solde exact.`,
      )
    }

    const result = calculateEarlyRepaymentImpact(
      loan.remainingBalance,
      amount,
      loan.rate,
      loan.remainingMonths ?? loan.duration,
    )
    setImpact(result)
  }

  const isClosed = loan.status === 'clos'
  const canRepay = loan.status === 'en_cours'

  return (
    <>
      <section className="bg-navy">
        <div className="mx-auto max-w-6xl px-6 pt-12 pb-20">
          <p className="text-sm font-medium text-blue">{company.name}</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">
            Détail du prêt
          </h1>
          <p className="mt-2 text-sm text-white/60">
            Référence <span className="tabular">{loan.id}</span>
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="-mt-12">
          <Link to="/prets" className="text-sm font-medium text-blue hover:text-blue-dark">
            ← Retour à mes prêts
          </Link>

          {/* Fiche résumé */}
          <div className="mt-4 border border-line bg-white p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <span className="inline-block rounded-full bg-blue/10 px-2 py-0.5 text-xs font-semibold text-blue">
                  {STATUS_LABEL[loan.status] ?? loan.status}
                </span>
                <p className="mt-3 text-sm text-slate-ink">Montant emprunté</p>
                <p className="tabular font-display text-3xl font-bold text-navy">
                  {formatAmount(loan.amount)}
                </p>
              </div>
              <div className="text-right text-sm text-slate-ink">
                <p>
                  Durée : <span className="font-medium text-navy">{loan.duration} mois</span>
                </p>
                <p className="mt-1">
                  Taux : <span className="tabular font-medium text-navy">{formatPercentage(loan.rate)}</span>
                </p>
                {loan.monthlyPayment && (
                  <p className="mt-1">
                    Mensualité :{' '}
                    <span className="tabular font-medium text-navy">
                      {formatAmount(loan.monthlyPayment)}
                    </span>
                  </p>
                )}
                {loan.appliedDate && (
                  <p className="mt-1">
                    Demandé le : <span className="font-medium text-navy">{formatDate(loan.appliedDate)}</span>
                  </p>
                )}
                {loan.loanStartDate && (
                  <p className="mt-1">
                    Début : <span className="font-medium text-navy">{formatDate(loan.loanStartDate)}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* KPIs */}
          {loan.status === 'en_cours' && (
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <KpiCard
                label="Solde restant dû"
                value={formatAmount(loan.remainingBalance)}
                tone="negative"
              />
              <KpiCard
                label="Mensualités restantes"
                value={`${loan.remainingMonths} mois`}
                sub={`sur ${loan.duration} au total`}
              />
              {loan.nextPaymentDate && (
                <KpiCard
                  label="Prochaine échéance"
                  value={formatDate(loan.nextPaymentDate, { day: '2-digit', month: 'long' })}
                  sub={formatAmount(loan.monthlyPayment)}
                  tone="warning"
                />
              )}
            </div>
          )}

          {/* Remboursement anticipé */}
          {canRepay && (
            <div className="mt-8 border border-line bg-white p-6">
              <h2 className="font-display text-lg font-bold text-navy">Remboursement anticipé</h2>
              <p className="mt-1 text-sm text-slate-ink">
                Simulez l'impact d'un remboursement partiel ou total sur la durée de votre crédit.
              </p>

              {repaymentWarning && (
                <div className="mt-4 border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
                  ⚠️ {repaymentWarning}
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-end gap-4">
                <div className="flex-1 min-w-48">
                  <label
                    htmlFor="repayment"
                    className="block text-sm font-medium text-navy"
                  >
                    Montant à rembourser (€)
                  </label>
                  <input
                    id="repayment"
                    type="number"
                    min="1"
                    max={loan.remainingBalance}
                    value={repayment}
                    onChange={(e) => {
                      setRepayment(e.target.value)
                      setImpact(null)
                    }}
                    placeholder={`Max. ${formatAmount(loan.remainingBalance)}`}
                    className="tabular mt-1 w-full border border-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue"
                  />
                </div>
                <button
                  onClick={handleSimulateRepayment}
                  disabled={!repayment || parseFloat(repayment) <= 0}
                  className="rounded bg-blue px-4 py-2 text-sm font-semibold text-white hover:bg-blue-dark disabled:opacity-40"
                >
                  Simuler
                </button>
                <button
                  onClick={() => {
                    setRepayment(String(loan.remainingBalance))
                    setImpact(null)
                  }}
                  className="rounded border border-line px-4 py-2 text-sm font-medium text-slate-ink hover:bg-mist"
                >
                  Remboursement total
                </button>
              </div>

              {impact && (
                <div className="mt-6 border-t border-line pt-6">
                  {impact.isFullRepayment ? (
                    <div className="rounded bg-green-50 border border-green-200 p-4">
                      <p className="font-semibold text-green-800">
                        ✓ Remboursement total — votre prêt serait soldé.
                      </p>
                      <p className="mt-1 text-sm text-green-700">
                        Montant exact à verser : {formatAmount(impact.actualRepayment)}
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-3">
                      <KpiCard
                        label="Nouveau solde restant"
                        value={formatAmount(impact.newBalance)}
                        tone="negative"
                      />
                      <KpiCard
                        label="Nouvelle durée restante"
                        value={`${impact.newDuration} mois`}
                        sub={`au lieu de ${loan.remainingMonths} mois`}
                        tone="positive"
                      />
                      <KpiCard
                        label="Intérêts économisés"
                        value={formatAmount(impact.savedInterest)}
                        tone="positive"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {isClosed && (
            <div className="mt-8 rounded border border-line bg-slate-50 p-4 text-center text-sm text-slate-ink">
              Ce prêt est entièrement remboursé. Aucune action possible.
            </div>
          )}

          {/* Tableau d'amortissement */}
          {loan.schedule && loan.schedule.length > 0 && (
            <div className="mt-8 border border-line bg-white p-6">
              <h2 className="font-display text-lg font-bold text-navy">
                Tableau d'amortissement
              </h2>
              <p className="mt-1 text-sm text-slate-ink">
                {loan.schedule.length} échéances —{' '}
                {loan.status === 'en_cours'
                  ? `${currentMonth} payée(s), ${loan.remainingMonths} restante(s)`
                  : 'prévisionnel'}
              </p>
              <div className="mt-4">
                <LoanScheduleTable schedule={loan.schedule} currentMonth={currentMonth} />
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
