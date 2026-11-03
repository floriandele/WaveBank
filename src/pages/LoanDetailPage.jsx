import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { loans } from '../data/loans'
import { formatAmount, formatDate } from '../utils/format'
import { getCurrentBalanceFromSchedule, getRemainingMonths } from '../utils/loanCalculations'
import LoanStatusBadge from '../components/LoanStatusBadge'
import AmortizationTable from '../components/AmortizationTable'
import EarlyRepaymentForm from '../components/EarlyRepaymentForm'
import KpiCard from '../components/KpiCard'

const TABS = [
  { key: 'schedule', label: "Tableau d'amortissement" },
  { key: 'repayment', label: 'Remboursement anticipé' },
]

export default function LoanDetailPage() {
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState('schedule')
  const [repaymentDone, setRepaymentDone] = useState(null)

  const loan = loans.find((l) => l.id === id)

  if (!loan) {
    return (
      <section className="mx-auto max-w-6xl px-6 py-16 text-center">
        <h1 className="font-display text-2xl font-bold text-navy">Prêt introuvable</h1>
        <p className="mt-2 text-slate-ink">
          Ce prêt n'existe pas ou n'est plus rattaché à votre espace professionnel.
        </p>
        <Link to="/prets" className="mt-6 inline-block text-sm font-medium text-blue hover:text-blue-dark">
          Retour aux prêts
        </Link>
      </section>
    )
  }

  const { type, label, amount, rate, term, monthlyPayment, status, startDate, createdDate, schedule } = loan

  const currentBalance = schedule && schedule.length > 0
    ? getCurrentBalanceFromSchedule(amount, schedule)
    : amount
  const remainingMonths = getRemainingMonths(schedule)
  const paidMonths = (schedule?.length ?? 0) - remainingMonths

  const isActive = status === 'en_cours' || status === 'approuvé'

  function handleRepaymentConfirmed(simulation) {
    setRepaymentDone(simulation)
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <Link to="/prets" className="text-sm font-medium text-blue hover:text-blue-dark">
        ← Retour aux prêts
      </Link>

      {/* En-tête du prêt */}
      <div className="mt-6 border border-line bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-ink">{type}</p>
            <h1 className="mt-1 font-display text-2xl font-bold text-navy">{label}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <LoanStatusBadge status={status} />
              {startDate && (
                <span className="text-sm text-slate-ink">
                  Depuis le {formatDate(startDate)}
                </span>
              )}
              {!startDate && createdDate && (
                <span className="text-sm text-slate-ink">
                  Demandé le {formatDate(createdDate)}
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-ink">Montant initial</p>
            <p className="tabular font-display text-3xl font-bold text-navy">
              {formatAmount(amount)}
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      {isActive && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Solde restant"
            value={formatAmount(currentBalance)}
            sub={`${Math.round((currentBalance / amount) * 100)} % du capital initial`}
            tone="default"
          />
          <KpiCard
            label="Mensualité"
            value={formatAmount(monthlyPayment)}
            sub={`Taux : ${rate} % / an`}
            tone="warning"
          />
          <KpiCard
            label="Mois restants"
            value={remainingMonths}
            sub={`sur ${term} mois au total`}
            tone="default"
          />
          <KpiCard
            label="Mois payés"
            value={paidMonths}
            sub={`Capital remboursé : ${formatAmount(amount - currentBalance)}`}
            tone="positive"
          />
        </div>
      )}

      {/* Barre de progression */}
      {isActive && (
        <div className="mt-6 border border-line bg-white p-5">
          <div className="flex items-center justify-between text-sm text-slate-ink mb-2">
            <span>Progression du remboursement</span>
            <span className="tabular font-medium text-navy">
              {Math.round(((amount - currentBalance) / amount) * 100)} %
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-mist">
            <div
              className="h-full rounded-full bg-blue transition-all"
              style={{ width: `${((amount - currentBalance) / amount) * 100}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-xs text-slate-ink">
            <span>{formatAmount(amount - currentBalance)} remboursé</span>
            <span>{formatAmount(currentBalance)} restant</span>
          </div>
        </div>
      )}

      {/* Infos de base si prêt non actif */}
      {!isActive && (
        <div className="mt-6 border border-line bg-white p-5 grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-slate-ink">Taux annuel</p>
            <p className="tabular mt-1 font-display text-lg font-bold text-navy">{rate} %</p>
          </div>
          <div>
            <p className="text-xs text-slate-ink">Durée</p>
            <p className="tabular mt-1 font-display text-lg font-bold text-navy">{term} mois</p>
          </div>
          <div>
            <p className="text-xs text-slate-ink">Mensualité estimée</p>
            <p className="tabular mt-1 font-display text-lg font-bold text-navy">
              {monthlyPayment ? formatAmount(monthlyPayment) : '—'}
            </p>
          </div>
        </div>
      )}

      {/* Confirmation remboursement anticipé */}
      {repaymentDone && (
        <div className="mt-6 rounded border border-green-200 bg-green-50 px-4 py-3">
          <p className="text-sm font-medium text-green-700">
            ✓ Remboursement anticipé de {formatAmount(repaymentDone.repaymentAmount)} enregistré.
            {repaymentDone.isFullRepayment
              ? ' Le prêt est désormais clôturé.'
              : ` Nouveau solde : ${formatAmount(repaymentDone.newBalance)}. Intérêts économisés : ${formatAmount(repaymentDone.interestSaved)}.`}
          </p>
        </div>
      )}

      {/* Onglets (seulement pour prêts actifs avec schedule) */}
      {isActive && schedule && schedule.length > 0 && (
        <>
          <div className="mt-8 flex gap-1 border-b border-line">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'border-blue text-navy'
                    : 'border-transparent text-slate-ink hover:text-navy'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="mt-6 border border-line bg-white">
            {activeTab === 'schedule' && (
              <div>
                <div className="border-b border-line px-5 py-4">
                  <h2 className="font-display text-base font-bold text-navy">
                    Tableau d'amortissement
                  </h2>
                  <p className="mt-1 text-sm text-slate-ink">
                    {schedule.length} échéances — les lignes grisées correspondent aux paiements
                    déjà effectués.
                  </p>
                </div>
                <AmortizationTable schedule={schedule} />
              </div>
            )}
            {activeTab === 'repayment' && (
              <div className="p-5">
                <h2 className="font-display text-base font-bold text-navy">
                  Remboursement anticipé
                </h2>
                <p className="mt-1 mb-5 text-sm text-slate-ink">
                  Simulez l'impact d'un remboursement partiel ou total sur vos intérêts restants.
                </p>
                <EarlyRepaymentForm loan={loan} onRepaymentConfirmed={handleRepaymentConfirmed} />
              </div>
            )}
          </div>
        </>
      )}
    </section>
  )
}
