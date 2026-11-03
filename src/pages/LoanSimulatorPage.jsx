import { useState, useMemo } from 'react'
import { useNavigate, Link } from 'react-router'
import {
  calculateInterestRate,
  calculateMonthlyPayment,
  calculateTotalCost,
} from '../utils/loanCalculations'
import { formatAmount, formatPercentage } from '../utils/format'
import { addLoan } from '../data/loans'
import { company } from '../data/company'

const MIN_AMOUNT = 500
const MAX_AMOUNT = 50000
const MIN_DURATION = 6
const MAX_DURATION = 84

let nextId = 100

export default function LoanSimulatorPage() {
  const navigate = useNavigate()
  const [amountInput, setAmountInput] = useState('10000')
  const [durationInput, setDurationInput] = useState('36')
  const [submitted, setSubmitted] = useState(false)

  const amountNum = parseFloat(amountInput.replace(',', '.')) || 0
  const durationNum = parseInt(durationInput, 10) || 0

  const amountError =
    amountNum < MIN_AMOUNT || amountNum > MAX_AMOUNT
      ? `Le montant doit être compris entre ${formatAmount(MIN_AMOUNT)} et ${formatAmount(MAX_AMOUNT)}.`
      : null

  const durationError =
    durationNum < MIN_DURATION || durationNum > MAX_DURATION
      ? `La durée doit être comprise entre ${MIN_DURATION} et ${MAX_DURATION} mois.`
      : null

  const isValid = !amountError && !durationError && amountNum > 0 && durationNum > 0

  const simulation = useMemo(() => {
    if (!isValid) return null
    const rate = calculateInterestRate(amountNum)
    const monthly = calculateMonthlyPayment(amountNum, rate, durationNum)
    const total = calculateTotalCost(monthly, durationNum)
    return {
      rate,
      monthly: Math.round(monthly * 100) / 100,
      total: Math.round(total * 100) / 100,
      interest: Math.round((total - amountNum) * 100) / 100,
    }
  }, [amountNum, durationNum, isValid])

  function handleRequest() {
    if (!isValid || !simulation) return
    nextId++
    const today = new Date().toISOString().split('T')[0]
    const newLoan = {
      id: `loan-sim-${nextId}`,
      amount: amountNum,
      duration: durationNum,
      rate: simulation.rate,
      monthlyPayment: simulation.monthly,
      totalCost: simulation.total,
      status: 'en_demande',
      appliedDate: today,
      loanStartDate: null,
      remainingBalance: amountNum,
      remainingMonths: durationNum,
      nextPaymentDate: null,
      schedule: [],
    }
    addLoan(newLoan)
    setSubmitted(true)
    setTimeout(() => navigate('/prets'), 1500)
  }

  return (
    <>
      <section className="bg-navy">
        <div className="mx-auto max-w-6xl px-6 pt-12 pb-20">
          <p className="text-sm font-medium text-blue">{company.name}</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">
            Simulateur de prêt
          </h1>
          <p className="mt-2 text-sm text-white/60">
            Calculez instantanément votre mensualité et le coût total de votre crédit.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-16">
        <div className="-mt-12 border border-line bg-white p-8">
          <h2 className="font-display text-lg font-bold text-navy">Paramètres du prêt</h2>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {/* Montant */}
            <div>
              <label className="block text-sm font-medium text-navy" htmlFor="amount">
                Montant souhaité (€)
              </label>
              <input
                id="amount"
                type="number"
                min={MIN_AMOUNT}
                max={MAX_AMOUNT}
                value={amountInput}
                onChange={(e) => {
                  setAmountInput(e.target.value)
                }}
                className={`tabular mt-1 w-full border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue ${
                  amountError ? 'border-red-400' : 'border-line'
                }`}
              />
              {amountError ? (
                <p className="mt-1 text-xs text-red-600">{amountError}</p>
              ) : (
                <p className="mt-1 text-xs text-slate-ink">
                  De {formatAmount(MIN_AMOUNT)} à {formatAmount(MAX_AMOUNT)}
                </p>
              )}
            </div>

            {/* Durée */}
            <div>
              <label className="block text-sm font-medium text-navy" htmlFor="duration">
                Durée (mois)
              </label>
              <input
                id="duration"
                type="number"
                min={MIN_DURATION}
                max={MAX_DURATION}
                value={durationInput}
                onChange={(e) => {
                  setDurationInput(e.target.value)
                }}
                className={`tabular mt-1 w-full border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue ${
                  durationError ? 'border-red-400' : 'border-line'
                }`}
              />
              {durationError ? (
                <p className="mt-1 text-xs text-red-600">{durationError}</p>
              ) : (
                <p className="mt-1 text-xs text-slate-ink">
                  De {MIN_DURATION} à {MAX_DURATION} mois
                </p>
              )}
            </div>
          </div>

          {/* Résultats de simulation */}
          {simulation && (
            <div className="mt-8 border-t border-line pt-8">
              <h2 className="font-display text-lg font-bold text-navy">Résultat de la simulation</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div className="border-l-4 border-l-blue border-y border-r border-line p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-ink">
                    Mensualité
                  </p>
                  <p className="tabular mt-2 font-display text-2xl font-bold text-navy">
                    {formatAmount(simulation.monthly)}
                  </p>
                  <p className="mt-1 text-xs text-slate-ink">par mois</p>
                </div>
                <div className="border-l-4 border-l-amber-500 border-y border-r border-line p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-ink">
                    Coût total
                  </p>
                  <p className="tabular mt-2 font-display text-2xl font-bold text-navy">
                    {formatAmount(simulation.total)}
                  </p>
                  <p className="mt-1 text-xs text-slate-ink">
                    dont {formatAmount(simulation.interest)} d'intérêts
                  </p>
                </div>
                <div className="border-l-4 border-l-green-600 border-y border-r border-line p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-ink">
                    Taux annuel fixe
                  </p>
                  <p className="tabular mt-2 font-display text-2xl font-bold text-navy">
                    {formatPercentage(simulation.rate)}
                  </p>
                  <p className="mt-1 text-xs text-slate-ink">
                    {amountNum <= 10000
                      ? '≤ 10 000 €'
                      : amountNum <= 25000
                        ? '10 001 – 25 000 €'
                        : '> 25 000 €'}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-4">
                {submitted ? (
                  <p className="font-medium text-green-700">
                    ✓ Demande enregistrée ! Redirection en cours…
                  </p>
                ) : (
                  <>
                    <button
                      onClick={handleRequest}
                      className="rounded bg-blue px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-dark disabled:opacity-40"
                      disabled={!isValid}
                    >
                      Demander ce prêt
                    </button>
                    <Link to="/prets" className="text-sm font-medium text-blue hover:text-blue-dark">
                      ← Retour à mes prêts
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}

          {!isValid && (
            <div className="mt-6">
              <Link to="/prets" className="text-sm font-medium text-blue hover:text-blue-dark">
                ← Retour à mes prêts
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
