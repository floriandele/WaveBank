import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { formatAmount } from '../utils/format'
import {
  calculateMonthlyPayment,
  calculateTotalCost,
  calculateTotalInterest,
} from '../utils/loanCalculations'
import { getIndicativeRate } from '../data/loans'

const QUICK_AMOUNTS = [10000, 25000, 50000, 75000, 100000]
const QUICK_DURATIONS = [12, 24, 36, 48, 60, 120]

export default function LoanSimulatorPage() {
  const [searchParams] = useSearchParams()

  const defaultAmount = Number(searchParams.get('montant')) || 20000
  const defaultDuration = Number(searchParams.get('duree')) || 60

  const [amount, setAmount] = useState(defaultAmount)
  const [duration, setDuration] = useState(defaultDuration)
  const [amountInput, setAmountInput] = useState(String(defaultAmount))

  const rate = getIndicativeRate(duration)
  const monthly = calculateMonthlyPayment(amount, rate, duration)
  const totalCost = calculateTotalCost(amount, rate, duration)
  const totalInterest = calculateTotalInterest(amount, rate, duration)

  // Validation
  const amountValid = amount >= 100 && amount <= 100000
  const durationValid = duration >= 12 && duration <= 360
  const isValid = amountValid && durationValid && amount > 0

  function handleAmountChange(e) {
    const val = e.target.value
    setAmountInput(val)
    const num = parseFloat(val)
    if (!isNaN(num)) setAmount(num)
  }

  function handleAmountBlur() {
    if (amount < 100) setAmount(100)
    if (amount > 100000) setAmount(100000)
    setAmountInput(String(Math.min(100000, Math.max(100, amount))))
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <Link to="/prets" className="text-sm font-medium text-blue hover:text-blue-dark">
        ← Retour aux prêts
      </Link>

      <p className="mt-6 text-sm font-medium text-blue">Simulation</p>
      <h1 className="mt-2 font-display text-3xl font-bold text-navy">Simulateur de prêt</h1>
      <p className="mt-2 max-w-xl text-slate-ink">
        Estimez vos mensualités et le coût total de votre financement en quelques secondes.
      </p>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        {/* Panneau gauche : saisie */}
        <div className="border border-line bg-white p-6">
          <h2 className="font-display text-lg font-bold text-navy">Paramètres</h2>

          {/* Montant */}
          <div className="mt-6">
            <label htmlFor="amount" className="block text-sm font-medium text-navy">
              Montant souhaité (100 € – 100 000 €)
            </label>
            <div className="mt-2 flex items-center gap-2">
              <input
                id="amount"
                type="number"
                min={100}
                max={100000}
                step={100}
                value={amountInput}
                onChange={handleAmountChange}
                onBlur={handleAmountBlur}
                className={`w-full rounded border px-3 py-2 text-sm font-medium tabular text-navy focus:outline-none focus:ring-2 focus:ring-blue ${
                  !amountValid && amount > 0 ? 'border-red-400 focus:ring-red-400' : 'border-line'
                }`}
              />
              <span className="shrink-0 text-sm text-slate-ink">€</span>
            </div>
            {!amountValid && amount > 0 && (
              <p className="mt-1 text-xs text-red-600">Montant entre 100 € et 100 000 €</p>
            )}

            {/* Raccourcis montant */}
            <div className="mt-3 flex flex-wrap gap-2">
              {QUICK_AMOUNTS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => {
                    setAmount(a)
                    setAmountInput(String(a))
                  }}
                  className={`rounded border px-2.5 py-1 text-xs font-medium transition-colors ${
                    amount === a
                      ? 'border-blue bg-blue text-white'
                      : 'border-line bg-white text-slate-ink hover:border-blue'
                  }`}
                >
                  {a.toLocaleString('fr-FR')} €
                </button>
              ))}
            </div>
          </div>

          {/* Durée */}
          <div className="mt-6">
            <label htmlFor="duration" className="block text-sm font-medium text-navy">
              Durée (12 – 360 mois)
            </label>
            <input
              id="duration"
              type="number"
              min={12}
              max={360}
              step={1}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className={`mt-2 w-full rounded border px-3 py-2 text-sm font-medium tabular text-navy focus:outline-none focus:ring-2 focus:ring-blue ${
                !durationValid && duration > 0 ? 'border-red-400 focus:ring-red-400' : 'border-line'
              }`}
            />
            {!durationValid && duration > 0 && (
              <p className="mt-1 text-xs text-red-600">Durée entre 12 et 360 mois</p>
            )}
            {durationValid && duration >= 300 && (
              <p className="mt-1 text-xs text-amber-600">
                ⚠ Durée supérieure à 25 ans — engagement très long terme.
              </p>
            )}

            {/* Raccourcis durée */}
            <div className="mt-3 flex flex-wrap gap-2">
              {QUICK_DURATIONS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDuration(d)}
                  className={`rounded border px-2.5 py-1 text-xs font-medium transition-colors ${
                    duration === d
                      ? 'border-blue bg-blue text-white'
                      : 'border-line bg-white text-slate-ink hover:border-blue'
                  }`}
                >
                  {d} mois
                </button>
              ))}
            </div>
          </div>

          {/* Taux */}
          <div className="mt-6 rounded-lg bg-mist p-4">
            <p className="text-xs text-slate-ink">Taux indicatif pour {duration} mois</p>
            <p className="tabular mt-1 font-display text-2xl font-bold text-navy">
              {rate.toLocaleString('fr-FR', { minimumFractionDigits: 1 })} %/an
            </p>
            <p className="mt-1 text-xs text-slate-ink">
              Taux fixe indicatif — taux définitif soumis à étude du dossier.
            </p>
          </div>
        </div>

        {/* Panneau droit : résultats */}
        <div className="flex flex-col gap-4">
          {isValid ? (
            <>
              <div className="border-l-4 border-l-blue border-y border-r border-line bg-white p-6">
                <p className="text-sm text-slate-ink">Mensualité</p>
                <p className="tabular mt-2 font-display text-4xl font-bold text-navy">
                  {formatAmount(monthly)}
                </p>
                <p className="mt-1 text-xs text-slate-ink">par mois pendant {duration} mois</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="border border-line bg-white p-4">
                  <p className="text-xs text-slate-ink">Coût total</p>
                  <p className="tabular mt-1 font-display text-xl font-bold text-navy">
                    {formatAmount(totalCost)}
                  </p>
                  <p className="mt-1 text-xs text-slate-ink">capital + intérêts</p>
                </div>
                <div className="border border-line bg-white p-4">
                  <p className="text-xs text-slate-ink">Total intérêts</p>
                  <p className="tabular mt-1 font-display text-xl font-bold text-amber-700">
                    {formatAmount(totalInterest)}
                  </p>
                  <p className="mt-1 text-xs text-slate-ink">
                    {((totalInterest / amount) * 100).toFixed(1).replace('.', ',')} % du capital
                  </p>
                </div>
              </div>

              <div className="border border-line bg-white p-6">
                <h3 className="font-medium text-navy">Récapitulatif</h3>
                <dl className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-slate-ink">Montant emprunté</dt>
                    <dd className="tabular font-medium text-navy">{formatAmount(amount)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-ink">Taux annuel (fixe)</dt>
                    <dd className="tabular font-medium text-navy">
                      {rate.toLocaleString('fr-FR', { minimumFractionDigits: 1 })} %
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-ink">Durée</dt>
                    <dd className="tabular font-medium text-navy">{duration} mois</dd>
                  </div>
                  <div className="flex justify-between border-t border-line pt-2">
                    <dt className="text-slate-ink">Mensualité</dt>
                    <dd className="tabular font-bold text-navy">{formatAmount(monthly)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-ink">Coût total</dt>
                    <dd className="tabular font-bold text-navy">{formatAmount(totalCost)}</dd>
                  </div>
                </dl>

                <Link
                  to={`/prets/demande?montant=${amount}&duree=${duration}`}
                  className="mt-6 inline-flex w-full items-center justify-center rounded border border-blue bg-blue px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-dark"
                >
                  Faire une demande de prêt
                </Link>
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center border border-line bg-white p-8 text-center">
              <p className="text-slate-ink">
                Saisissez un montant et une durée valides pour voir la simulation.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
