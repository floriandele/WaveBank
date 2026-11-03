import { useState } from 'react'
import { Link } from 'react-router'
import { formatAmount } from '../utils/format'
import {
  getInterestRate,
  calculateMonthlyPayment,
  generateSchedule,
} from '../utils/loanCalculations'
import KpiCard from '../components/KpiCard'
import RepaymentScheduleTable from '../components/RepaymentScheduleTable'

const DEFAULT_AMOUNT = 20000
const DEFAULT_MONTHS = 36

export default function LoanSimulationPage() {
  const [amount, setAmount] = useState(DEFAULT_AMOUNT)
  const [months, setMonths] = useState(DEFAULT_MONTHS)
  const [amountInput, setAmountInput] = useState(String(DEFAULT_AMOUNT))
  const [monthsInput, setMonthsInput] = useState(String(DEFAULT_MONTHS))
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [showFullSchedule, setShowFullSchedule] = useState(false)

  // Validation
  function validate(a, m) {
    const errs = {}
    if (!a || isNaN(a) || a < 1000 || a > 500000)
      errs.amount = 'Le montant doit être compris entre 1 000 € et 500 000 €.'
    if (!m || isNaN(m) || m < 1 || m > 60)
      errs.months = 'La durée doit être comprise entre 1 et 60 mois.'
    return errs
  }

  const errs = validate(amount, months)
  const isValid = Object.keys(errs).length === 0

  const annualRate = isValid ? getInterestRate(amount) : 0.06
  const monthly = isValid ? calculateMonthlyPayment(amount, annualRate, months) : 0
  const totalCost = monthly * months
  const totalInterest = totalCost - (isValid ? amount : 0)

  const today = new Date().toISOString().slice(0, 10)
  const schedule = isValid
    ? generateSchedule(amount, annualRate, months, today)
    : []

  function handleAmountChange(e) {
    setAmountInput(e.target.value)
    const v = parseFloat(e.target.value)
    setAmount(v)
    setErrors((prev) => ({ ...prev, amount: undefined }))
  }

  function handleMonthsChange(e) {
    setMonthsInput(e.target.value)
    const v = parseInt(e.target.value, 10)
    setMonths(v)
    setErrors((prev) => ({ ...prev, months: undefined }))
  }

  function handleRequest(e) {
    e.preventDefault()
    const newErrs = validate(amount, months)
    if (Object.keys(newErrs).length > 0) {
      setErrors(newErrs)
      return
    }
    setSubmitted(true)
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <Link to="/credits" className="text-sm font-medium text-blue hover:text-blue/80">
        ← Retour aux crédits
      </Link>

      <p className="mt-6 text-sm font-medium text-blue">Financement</p>
      <h1 className="mt-2 font-display text-3xl font-bold text-navy">Simuler un crédit</h1>
      <p className="mt-2 max-w-xl text-slate-ink">
        Calculez votre mensualité et le coût total de votre crédit en quelques secondes.
      </p>

      {submitted ? (
        <div className="mt-10 border border-line bg-white p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-green-700 text-2xl">
            ✓
          </div>
          <h2 className="mt-4 font-display text-xl font-bold text-navy">Demande envoyée !</h2>
          <p className="mt-2 text-slate-ink">
            Votre demande de crédit de{' '}
            <span className="font-medium text-navy">{formatAmount(amount)}</span> sur{' '}
            <span className="font-medium text-navy">{months} mois</span> a été transmise avec
            le statut <span className="font-medium text-amber-700">en attente</span>.
          </p>
          <p className="mt-1 text-sm text-slate-ink">
            Notre équipe vous contactera sous 48 h ouvrées.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link
              to="/credits"
              className="rounded-md bg-navy px-5 py-2.5 text-sm font-medium text-white hover:bg-navy/90"
            >
              Voir mes crédits
            </Link>
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="rounded-md border border-line px-5 py-2.5 text-sm font-medium text-navy hover:bg-slate-50"
            >
              Nouvelle simulation
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          {/* Formulaire */}
          <div className="border border-line bg-white p-6">
            <h2 className="font-display text-lg font-bold text-navy">Paramètres</h2>

            <form onSubmit={handleRequest} className="mt-6 space-y-5" noValidate>
              <div>
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium text-navy"
                >
                  Montant souhaité
                </label>
                <div className="relative mt-2">
                  <input
                    id="amount"
                    type="number"
                    min={1000}
                    max={500000}
                    step={500}
                    value={amountInput}
                    onChange={handleAmountChange}
                    className={`w-full rounded-md border bg-white py-2.5 pl-4 pr-10 text-sm text-navy outline-none focus:ring-2 focus:ring-blue ${
                      errors.amount ? 'border-red-500' : 'border-line'
                    }`}
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-ink">
                    €
                  </span>
                </div>
                {errors.amount && (
                  <p className="mt-1 text-xs text-red-600">{errors.amount}</p>
                )}
                <p className="mt-1 text-xs text-slate-ink">
                  Entre 1 000 € et 500 000 €
                </p>
              </div>

              <div>
                <label
                  htmlFor="months"
                  className="block text-sm font-medium text-navy"
                >
                  Durée de remboursement
                </label>
                <div className="relative mt-2">
                  <input
                    id="months"
                    type="number"
                    min={1}
                    max={60}
                    step={1}
                    value={monthsInput}
                    onChange={handleMonthsChange}
                    className={`w-full rounded-md border bg-white py-2.5 pl-4 pr-14 text-sm text-navy outline-none focus:ring-2 focus:ring-blue ${
                      errors.months ? 'border-red-500' : 'border-line'
                    }`}
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-ink">
                    mois
                  </span>
                </div>
                {errors.months && (
                  <p className="mt-1 text-xs text-red-600">{errors.months}</p>
                )}
                <p className="mt-1 text-xs text-slate-ink">Entre 1 et 60 mois</p>
              </div>

              <button
                type="submit"
                className="mt-2 w-full rounded-md bg-navy px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-navy/90 disabled:opacity-50"
                disabled={!isValid}
              >
                Demander ce crédit
              </button>
            </form>
          </div>

          {/* Résultats */}
          <div className="space-y-4">
            {isValid ? (
              <>
                <KpiCard
                  label="Mensualité estimée"
                  value={formatAmount(monthly)}
                  sub={`sur ${months} mois`}
                  tone="default"
                />
                <KpiCard
                  label="Taux annuel appliqué"
                  value={`${(annualRate * 100).toFixed(1)} %`}
                  sub={
                    amount < 10000
                      ? 'Tranche < 10 000 €'
                      : amount <= 50000
                      ? 'Tranche 10 000 – 50 000 €'
                      : 'Tranche > 50 000 €'
                  }
                  tone="default"
                />
                <KpiCard
                  label="Intérêts totaux"
                  value={formatAmount(totalInterest)}
                  tone="warning"
                />
                <KpiCard
                  label="Coût total du crédit"
                  value={formatAmount(totalCost)}
                  sub={`Capital ${formatAmount(amount)} + intérêts ${formatAmount(totalInterest)}`}
                  tone="warning"
                />
              </>
            ) : (
              <div className="border border-line bg-white p-8 text-center text-slate-ink text-sm">
                Renseignez un montant et une durée valides pour voir la simulation.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Calendrier de remboursement */}
      {isValid && !submitted && schedule.length > 0 && (
        <div className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-navy">
              Calendrier de remboursement
            </h2>
            <button
              type="button"
              onClick={() => setShowFullSchedule((v) => !v)}
              className="text-sm font-medium text-blue hover:text-blue/80"
            >
              {showFullSchedule
                ? 'Afficher moins'
                : `Voir les ${schedule.length} échéances`}
            </button>
          </div>
          <div className="mt-4 border border-line bg-white px-4 py-2">
            <RepaymentScheduleTable
              entries={schedule}
              limit={showFullSchedule ? undefined : 24}
            />
          </div>
        </div>
      )}
    </section>
  )
}
