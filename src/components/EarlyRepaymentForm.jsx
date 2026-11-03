import { useState } from 'react'
import { formatAmount } from '../utils/format'
import { calculateEarlyRepaymentImpact, getCurrentBalanceFromSchedule } from '../utils/loanCalculations'
import AmortizationTable from './AmortizationTable'

export default function EarlyRepaymentForm({ loan, onRepaymentConfirmed }) {
  const { amount, rate, schedule, monthlyPayment } = loan

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const remainingSchedule = schedule.filter((e) => new Date(e.date + 'T00:00:00') > today)
  const currentBalance = getCurrentBalanceFromSchedule(amount, schedule)
  const remainingMonths = remainingSchedule.length

  const [repaymentAmount, setRepaymentAmount] = useState('')
  const [reduceOption, setReduceOption] = useState('reduce_term')
  const [simulation, setSimulation] = useState(null)
  const [confirmed, setConfirmed] = useState(false)
  const [error, setError] = useState('')

  function handleSimulate(e) {
    e.preventDefault()
    setError('')
    const value = parseFloat(repaymentAmount.replace(',', '.'))
    if (!value || value <= 0) {
      setError('Veuillez saisir un montant positif.')
      return
    }
    if (value > currentBalance) {
      setError(`Le montant dépasse le solde restant (${formatAmount(currentBalance)}).`)
      return
    }
    const result = calculateEarlyRepaymentImpact(
      currentBalance,
      value,
      rate,
      remainingMonths,
      reduceOption,
    )
    setSimulation(result)
    setConfirmed(false)
  }

  function handleConfirm() {
    if (!simulation) return
    setConfirmed(true)
    if (onRepaymentConfirmed) {
      onRepaymentConfirmed(simulation)
    }
  }

  if (remainingMonths === 0) {
    return (
      <p className="text-sm text-slate-ink">
        Ce prêt est entièrement remboursé. Aucun remboursement anticipé possible.
      </p>
    )
  }

  return (
    <div className="space-y-6">
      {confirmed && (
        <div className="rounded border border-green-200 bg-green-50 px-4 py-3">
          <p className="text-sm font-medium text-green-700">
            ✓ Remboursement anticipé enregistré avec succès.{' '}
            {simulation?.isFullRepayment
              ? 'Le prêt est désormais clôturé.'
              : `Nouveau solde : ${formatAmount(simulation?.newBalance)}.`}
          </p>
        </div>
      )}

      <div className="border border-line bg-mist/50 p-4 rounded grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-xs text-slate-ink">Solde restant</p>
          <p className="tabular mt-1 font-display font-bold text-navy">{formatAmount(currentBalance)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-ink">Mensualité actuelle</p>
          <p className="tabular mt-1 font-display font-bold text-navy">{formatAmount(monthlyPayment)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-ink">Mois restants</p>
          <p className="tabular mt-1 font-display font-bold text-navy">{remainingMonths}</p>
        </div>
      </div>

      <form onSubmit={handleSimulate} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="repayment-amount" className="block text-sm font-medium text-navy">
              Montant du remboursement anticipé (EUR)
            </label>
            <input
              id="repayment-amount"
              type="number"
              min="1"
              max={currentBalance}
              step="0.01"
              value={repaymentAmount}
              onChange={(e) => setRepaymentAmount(e.target.value)}
              placeholder={`Max. ${formatAmount(currentBalance)}`}
              className="mt-1 w-full rounded border border-line bg-white px-3 py-2 text-sm text-navy placeholder:text-slate-ink focus:border-blue focus:outline-none"
            />
          </div>
          <div>
            <p className="block text-sm font-medium text-navy">Option de remboursement</p>
            <div className="mt-1 space-y-1">
              <label className="flex items-center gap-2 text-sm text-navy cursor-pointer">
                <input
                  type="radio"
                  value="reduce_term"
                  checked={reduceOption === 'reduce_term'}
                  onChange={() => setReduceOption('reduce_term')}
                  className="accent-blue"
                />
                Réduire la durée (même mensualité)
              </label>
              <label className="flex items-center gap-2 text-sm text-navy cursor-pointer">
                <input
                  type="radio"
                  value="reduce_payment"
                  checked={reduceOption === 'reduce_payment'}
                  onChange={() => setReduceOption('reduce_payment')}
                  className="accent-blue"
                />
                Réduire la mensualité (même durée)
              </label>
            </div>
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          className="rounded bg-navy px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-navy-light"
        >
          Simuler le remboursement
        </button>
      </form>

      {simulation && !confirmed && (
        <div className="border border-line bg-white p-5 space-y-4">
          <h4 className="font-display text-base font-bold text-navy">Résultat de la simulation</h4>

          {simulation.isFullRepayment ? (
            <div className="rounded border border-green-200 bg-green-50 px-4 py-3">
              <p className="text-sm font-medium text-green-700">
                Ce remboursement clôture entièrement le prêt.
              </p>
              <p className="mt-1 text-sm text-green-600">
                Intérêts économisés : <strong>{formatAmount(simulation.interestSaved)}</strong>
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 text-sm">
                <div>
                  <p className="text-xs text-slate-ink">Nouveau solde</p>
                  <p className="tabular mt-1 font-display font-bold text-blue">
                    {formatAmount(simulation.newBalance)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-ink">Nouvelle mensualité</p>
                  <p className="tabular mt-1 font-display font-bold text-navy">
                    {formatAmount(simulation.newMonthlyPayment)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-ink">Nouveaux mois restants</p>
                  <p className="tabular mt-1 font-display font-bold text-navy">
                    {simulation.newTerm}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-ink">Intérêts économisés</p>
                  <p className="tabular mt-1 font-display font-bold text-green-700">
                    {formatAmount(simulation.interestSaved)}
                  </p>
                </div>
              </div>

              {simulation.newSchedule.length > 0 && (
                <div>
                  <h5 className="mt-4 mb-2 text-sm font-medium text-navy">
                    Nouvel échéancier
                  </h5>
                  <AmortizationTable schedule={simulation.newSchedule} />
                </div>
              )}
            </>
          )}

          <button
            type="button"
            onClick={handleConfirm}
            className="rounded bg-blue px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-dark"
          >
            Confirmer le remboursement anticipé
          </button>
        </div>
      )}
    </div>
  )
}
