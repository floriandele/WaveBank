import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { formatAmount } from '../utils/format'
import {
  calculateMonthlyPayment,
  calculateRemainingBalance,
  calculateRemainingMonths,
  simulateEarlyRepayment,
  generateAmortizationSchedule,
} from '../utils/loanCalculations'
import { getIndicativeRate, loans } from '../data/loans'
import { createApplication } from '../data/loanApplications'
import AmortizationTable from '../components/AmortizationTable'

export default function LoanApplicationPage() {
  const [searchParams] = useSearchParams()

  const defaultAmount = Number(searchParams.get('montant')) || ''
  const defaultDuration = Number(searchParams.get('duree')) || 60

  // --- Formulaire de demande ---
  const [amount, setAmount] = useState(defaultAmount)
  const [duration, setDuration] = useState(defaultDuration)
  const [loanType, setLoanType] = useState('Autre')
  const [submitted, setSubmitted] = useState(false)
  const [submittedApp, setSubmittedApp] = useState(null)

  // --- Simulation remboursement anticipé ---
  const [selectedLoanId, setSelectedLoanId] = useState(loans[0]?.id ?? '')
  const [earlyPayment, setEarlyPayment] = useState('')
  const [earlyResult, setEarlyResult] = useState(null)

  const rate = getIndicativeRate(Number(duration))
  const monthly = amount && duration ? calculateMonthlyPayment(Number(amount), rate, Number(duration)) : 0

  // Validation form
  const amountNum = Number(amount)
  const durationNum = Number(duration)
  const amountValid = amountNum >= 100 && amountNum <= 100000
  const durationValid = durationNum >= 12 && durationNum <= 360
  const formValid = amountValid && durationValid && amount !== ''

  function handleSubmit(e) {
    e.preventDefault()
    if (!formValid) return
    const app = createApplication({
      loanType,
      principal: amountNum,
      annualRate: rate,
      durationMonths: durationNum,
    })
    setSubmittedApp(app)
    setSubmitted(true)
  }

  // Simulation anticipée
  const selectedLoan = loans.find((l) => l.id === selectedLoanId)
  const remainingBalance = selectedLoan
    ? calculateRemainingBalance(
        selectedLoan.principal,
        selectedLoan.annualRate,
        selectedLoan.durationMonths,
        selectedLoan.startDate,
      )
    : 0
  const remainingMonths = selectedLoan
    ? calculateRemainingMonths(selectedLoan.durationMonths, selectedLoan.startDate)
    : 0

  function handleSimulateEarly(e) {
    e.preventDefault()
    if (!selectedLoan || !earlyPayment) return
    const result = simulateEarlyRepayment(
      remainingBalance,
      selectedLoan.annualRate,
      remainingMonths,
      Number(earlyPayment),
    )
    setEarlyResult(result)
  }

  const earlyNewSchedule =
    earlyResult?.valid && earlyResult.newBalance > 0
      ? generateAmortizationSchedule(
          earlyResult.newBalance,
          selectedLoan?.annualRate ?? 5.5,
          earlyResult.reducedDuration,
          new Date().toISOString().slice(0, 10),
        )
      : null

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <Link to="/prets" className="text-sm font-medium text-blue hover:text-blue-dark">
        ← Retour aux prêts
      </Link>

      <p className="mt-6 text-sm font-medium text-blue">Financement</p>
      <h1 className="mt-2 font-display text-3xl font-bold text-navy">Demande de prêt</h1>
      <p className="mt-2 max-w-xl text-slate-ink">
        Complétez le formulaire ci-dessous pour soumettre votre demande de financement. Vous pouvez
        également simuler un remboursement anticipé sur un prêt existant.
      </p>

      <div className="mt-10 grid gap-12 lg:grid-cols-2">
        {/* Formulaire de demande */}
        <div>
          <h2 className="font-display text-xl font-bold text-navy">Nouvelle demande</h2>

          {submitted && submittedApp ? (
            <div className="mt-6 border border-green-200 bg-green-50 p-6">
              <p className="font-medium text-green-800">✓ Demande enregistrée</p>
              <p className="mt-2 text-sm text-green-700">
                Votre demande de prêt ({formatAmount(submittedApp.principal)} sur{' '}
                {submittedApp.durationMonths} mois) a été transmise sous la référence{' '}
                <span className="font-medium">{submittedApp.id}</span>. Statut :{' '}
                <span className="font-medium">En cours</span>.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false)
                  setSubmittedApp(null)
                  setAmount('')
                  setDuration(60)
                }}
                className="mt-4 text-sm font-medium text-blue hover:text-blue-dark"
              >
                Faire une nouvelle demande
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              {/* Type */}
              <div>
                <label htmlFor="loanType" className="block text-sm font-medium text-navy">
                  Type de financement
                </label>
                <select
                  id="loanType"
                  value={loanType}
                  onChange={(e) => setLoanType(e.target.value)}
                  className="mt-1.5 w-full rounded border border-line px-3 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-blue"
                >
                  <option>Immobilier</option>
                  <option>Équipement</option>
                  <option>Trésorerie</option>
                  <option>Véhicule</option>
                  <option>Autre</option>
                </select>
              </div>

              {/* Montant */}
              <div>
                <label htmlFor="app-amount" className="block text-sm font-medium text-navy">
                  Montant souhaité (€)
                </label>
                <input
                  id="app-amount"
                  type="number"
                  min={100}
                  max={100000}
                  step={100}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Ex : 25 000"
                  required
                  className={`mt-1.5 w-full rounded border px-3 py-2 text-sm font-medium tabular text-navy focus:outline-none focus:ring-2 focus:ring-blue ${
                    amount !== '' && !amountValid ? 'border-red-400 focus:ring-red-400' : 'border-line'
                  }`}
                />
                {amount !== '' && !amountValid && (
                  <p className="mt-1 text-xs text-red-600">Montant entre 100 € et 100 000 €</p>
                )}
              </div>

              {/* Durée */}
              <div>
                <label htmlFor="app-duration" className="block text-sm font-medium text-navy">
                  Durée souhaitée (mois)
                </label>
                <input
                  id="app-duration"
                  type="number"
                  min={12}
                  max={360}
                  step={1}
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  required
                  className={`mt-1.5 w-full rounded border px-3 py-2 text-sm font-medium tabular text-navy focus:outline-none focus:ring-2 focus:ring-blue ${
                    !durationValid ? 'border-red-400 focus:ring-red-400' : 'border-line'
                  }`}
                />
                {!durationValid && (
                  <p className="mt-1 text-xs text-red-600">Durée entre 12 et 360 mois</p>
                )}
              </div>

              {/* Aperçu mensualité */}
              {formValid && (
                <div className="rounded-lg bg-mist p-4">
                  <p className="text-xs text-slate-ink">Mensualité estimée ({rate} % /an)</p>
                  <p className="tabular mt-1 font-display text-2xl font-bold text-navy">
                    {formatAmount(monthly)}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-ink">
                    Estimation indicative — taux définitif soumis à étude.
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={!formValid}
                className="w-full rounded border border-blue bg-blue px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-dark disabled:cursor-not-allowed disabled:opacity-50"
              >
                Soumettre la demande
              </button>
            </form>
          )}
        </div>

        {/* Simulation remboursement anticipé */}
        <div>
          <h2 className="font-display text-xl font-bold text-navy">Remboursement anticipé</h2>
          <p className="mt-2 text-sm text-slate-ink">
            Simulez l'impact d'un versement anticipé sur un prêt actif.
          </p>

          {loans.length === 0 ? (
            <div className="mt-6 border border-line bg-white p-6">
              <p className="text-sm text-slate-ink">Aucun prêt actif pour simuler un remboursement anticipé.</p>
            </div>
          ) : (
            <form onSubmit={handleSimulateEarly} className="mt-6 space-y-5">
              {/* Sélection du prêt */}
              <div>
                <label htmlFor="selectLoan" className="block text-sm font-medium text-navy">
                  Prêt concerné
                </label>
                <select
                  id="selectLoan"
                  value={selectedLoanId}
                  onChange={(e) => {
                    setSelectedLoanId(e.target.value)
                    setEarlyResult(null)
                  }}
                  className="mt-1.5 w-full rounded border border-line px-3 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-blue"
                >
                  {loans.map((loan) => (
                    <option key={loan.id} value={loan.id}>
                      {loan.name} — {formatAmount(loan.principal)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Info prêt sélectionné */}
              {selectedLoan && (
                <div className="rounded-lg bg-mist p-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-ink">Solde restant dû</span>
                    <span className="tabular font-medium text-navy">{formatAmount(remainingBalance)}</span>
                  </div>
                  <div className="mt-1 flex justify-between">
                    <span className="text-slate-ink">Mois restants</span>
                    <span className="tabular font-medium text-navy">{remainingMonths}</span>
                  </div>
                  <div className="mt-1 flex justify-between">
                    <span className="text-slate-ink">Mensualité actuelle</span>
                    <span className="tabular font-medium text-navy">
                      {formatAmount(
                        calculateMonthlyPayment(
                          selectedLoan.principal,
                          selectedLoan.annualRate,
                          selectedLoan.durationMonths,
                        ),
                      )}
                    </span>
                  </div>
                </div>
              )}

              {/* Montant remboursement */}
              <div>
                <label htmlFor="earlyPayment" className="block text-sm font-medium text-navy">
                  Montant du remboursement anticipé (€)
                </label>
                <input
                  id="earlyPayment"
                  type="number"
                  min={1}
                  step={100}
                  value={earlyPayment}
                  onChange={(e) => {
                    setEarlyPayment(e.target.value)
                    setEarlyResult(null)
                  }}
                  placeholder="Ex : 5 000"
                  required
                  className="mt-1.5 w-full rounded border border-line px-3 py-2 text-sm font-medium tabular text-navy focus:outline-none focus:ring-2 focus:ring-blue"
                />
              </div>

              <button
                type="submit"
                disabled={!earlyPayment || !selectedLoanId}
                className="w-full rounded border border-navy bg-navy px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-navy-light disabled:cursor-not-allowed disabled:opacity-50"
              >
                Simuler
              </button>
            </form>
          )}

          {/* Résultats simulation anticipée */}
          {earlyResult && (
            <div className="mt-6">
              {!earlyResult.valid ? (
                <div className="border border-red-200 bg-red-50 p-4">
                  <p className="text-sm font-medium text-red-700">⚠ Remboursement impossible</p>
                  <p className="mt-1 text-sm text-red-600">{earlyResult.message}</p>
                </div>
              ) : (
                <div className="border border-line bg-white p-5">
                  <h3 className="font-display text-base font-bold text-navy">
                    Résultats de la simulation
                  </h3>
                  <p className="mt-1 text-xs text-slate-ink">
                    Après remboursement de {formatAmount(Number(earlyPayment))} — nouveau solde :{' '}
                    <span className="font-medium text-navy">{formatAmount(earlyResult.newBalance)}</span>
                  </p>

                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-lg bg-mist p-4">
                      <p className="text-xs font-medium text-blue">Option A — Réduire la durée</p>
                      <p className="tabular mt-2 font-display text-lg font-bold text-navy">
                        {earlyResult.reducedDuration} mois
                      </p>
                      <p className="mt-1 text-xs text-slate-ink">
                        Vous économisez{' '}
                        <span className="font-medium text-green-700">{earlyResult.savedMonths} mois</span>
                      </p>
                      <p className="mt-0.5 text-xs text-slate-ink">
                        Mensualité inchangée : {formatAmount(earlyResult.currentMonthly)}
                      </p>
                    </div>
                    <div className="rounded-lg bg-mist p-4">
                      <p className="text-xs font-medium text-blue">Option B — Réduire la mensualité</p>
                      <p className="tabular mt-2 font-display text-lg font-bold text-navy">
                        {formatAmount(earlyResult.reducedMonthly)}
                      </p>
                      <p className="mt-1 text-xs text-slate-ink">
                        Vous économisez{' '}
                        <span className="font-medium text-green-700">
                          {formatAmount(earlyResult.savedPerMonth)}/mois
                        </span>
                      </p>
                      <p className="mt-0.5 text-xs text-slate-ink">
                        Durée inchangée : {earlyResult.remainingMonths} mois
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Nouveau calendrier (option A) */}
              {earlyResult.valid && earlyNewSchedule && (
                <div className="mt-6">
                  <h3 className="font-display text-base font-bold text-navy">
                    Nouveau calendrier (Option A — durée réduite)
                  </h3>
                  <div className="mt-4 border border-line bg-white p-4">
                    <AmortizationTable schedule={earlyNewSchedule} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
