import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { formatAmount } from '../utils/format'
import {
  calculateMonthlyPayment,
  calculateTotalInterest,
  calculateTotalRepaid,
} from '../utils/loanCalculations'
import { loans } from '../data/loans'

const LOAN_TYPES = [
  'Prêt équipement',
  'Prêt trésorerie',
  'Prêt immobilier professionnel',
  'Prêt véhicule',
  'Prêt personnel',
]

export default function LoanSimulatorPage() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    amount: 20000,
    term: 36,
    rate: 4.5,
    type: 'Prêt équipement',
    label: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState({})

  const { amount, term, rate } = form
  const monthly = calculateMonthlyPayment(amount, rate, term)
  const totalInterest = calculateTotalInterest(amount, rate, term)
  const totalRepaid = calculateTotalRepaid(amount, rate, term)

  function handleChange(e) {
    const { name, value, type } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  function validate() {
    const errs = {}
    if (!form.amount || form.amount < 1000 || form.amount > 100000) {
      errs.amount = 'Le montant doit être compris entre 1 000 € et 100 000 €.'
    }
    if (!form.term || form.term < 6 || form.term > 120) {
      errs.term = 'La durée doit être comprise entre 6 et 120 mois.'
    }
    if (!form.rate || form.rate <= 0) {
      errs.rate = 'Le taux doit être positif.'
    }
    if (!form.label.trim()) {
      errs.label = 'Veuillez saisir un objet pour ce prêt.'
    }
    return errs
  }

  function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    const newLoan = {
      id: `pret-${Date.now()}`,
      type: form.type,
      label: form.label,
      amount: form.amount,
      rate: form.rate,
      term: form.term,
      monthlyPayment: monthly,
      status: 'en_attente',
      createdDate: new Date().toISOString().split('T')[0],
      startDate: null,
      nextPaymentDate: null,
      schedule: [],
    }

    loans.push(newLoan)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <section className="mx-auto max-w-6xl px-6 py-16 text-center">
        <div className="mx-auto max-w-md">
          <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-full bg-green-50 text-green-600 text-2xl">
            ✓
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold text-navy">Demande enregistrée</h1>
          <p className="mt-2 text-slate-ink">
            Votre demande de prêt de{' '}
            <strong className="text-navy">{formatAmount(form.amount)}</strong> sur{' '}
            <strong className="text-navy">{form.term} mois</strong> a été enregistrée avec le
            statut <strong className="text-navy">en attente</strong>.
          </p>
          <p className="mt-1 text-slate-ink">
            Mensualité estimée :{' '}
            <strong className="text-navy">{formatAmount(monthly)}</strong>/mois
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/prets"
              className="rounded bg-navy px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-navy-light"
            >
              Voir mes prêts
            </Link>
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="rounded border border-line px-5 py-2.5 text-sm font-medium text-navy transition-colors hover:bg-mist"
            >
              Nouvelle simulation
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <Link to="/prets" className="text-sm font-medium text-blue hover:text-blue-dark">
        ← Retour aux prêts
      </Link>

      <p className="mt-6 text-sm font-medium text-blue">Financement</p>
      <h1 className="mt-2 font-display text-3xl font-bold text-navy">Simulateur de prêt</h1>
      <p className="mt-2 max-w-xl text-slate-ink">
        Ajustez les paramètres pour calculer vos mensualités et le coût total du crédit.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Type de prêt */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-navy">
              Type de prêt
            </label>
            <select
              id="type"
              name="type"
              value={form.type}
              onChange={handleChange}
              className="mt-1 w-full rounded border border-line bg-white px-3 py-2 text-sm text-navy focus:border-blue focus:outline-none"
            >
              {LOAN_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Objet */}
          <div>
            <label htmlFor="label" className="block text-sm font-medium text-navy">
              Objet du prêt
            </label>
            <input
              id="label"
              name="label"
              type="text"
              value={form.label}
              onChange={handleChange}
              placeholder="Ex : Achat d'équipements de production"
              className="mt-1 w-full rounded border border-line bg-white px-3 py-2 text-sm text-navy placeholder:text-slate-ink focus:border-blue focus:outline-none"
            />
            {errors.label && <p className="mt-1 text-xs text-red-600">{errors.label}</p>}
          </div>

          {/* Montant */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-navy">
              Montant (1 000 – 100 000 €)
            </label>
            <input
              id="amount"
              name="amount"
              type="range"
              min="1000"
              max="100000"
              step="500"
              value={form.amount}
              onChange={handleChange}
              className="mt-2 w-full accent-blue"
            />
            <div className="mt-1 flex items-center justify-between">
              <span className="text-xs text-slate-ink">1 000 €</span>
              <span className="tabular font-display text-lg font-bold text-navy">
                {formatAmount(form.amount)}
              </span>
              <span className="text-xs text-slate-ink">100 000 €</span>
            </div>
            <input
              type="number"
              name="amount"
              min="1000"
              max="100000"
              step="100"
              value={form.amount}
              onChange={handleChange}
              className="mt-2 w-full rounded border border-line bg-white px-3 py-2 text-sm text-navy focus:border-blue focus:outline-none"
            />
            {errors.amount && <p className="mt-1 text-xs text-red-600">{errors.amount}</p>}
          </div>

          {/* Durée */}
          <div>
            <label htmlFor="term" className="block text-sm font-medium text-navy">
              Durée (6 – 120 mois)
            </label>
            <input
              id="term"
              name="term"
              type="range"
              min="6"
              max="120"
              step="6"
              value={form.term}
              onChange={handleChange}
              className="mt-2 w-full accent-blue"
            />
            <div className="mt-1 flex items-center justify-between">
              <span className="text-xs text-slate-ink">6 mois</span>
              <span className="tabular font-display text-lg font-bold text-navy">
                {form.term} mois
              </span>
              <span className="text-xs text-slate-ink">120 mois</span>
            </div>
            {errors.term && <p className="mt-1 text-xs text-red-600">{errors.term}</p>}
          </div>

          {/* Taux */}
          <div>
            <label htmlFor="rate" className="block text-sm font-medium text-navy">
              Taux annuel (%)
            </label>
            <input
              id="rate"
              name="rate"
              type="number"
              min="0.1"
              max="20"
              step="0.1"
              value={form.rate}
              onChange={handleChange}
              className="mt-1 w-full rounded border border-line bg-white px-3 py-2 text-sm text-navy focus:border-blue focus:outline-none"
            />
            {errors.rate && <p className="mt-1 text-xs text-red-600">{errors.rate}</p>}
          </div>

          <button
            type="submit"
            className="w-full rounded bg-blue px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-dark"
          >
            Demander ce prêt
          </button>
        </form>

        {/* Résultats */}
        <div className="space-y-4">
          <div className="border-l-4 border-l-blue border-y border-r border-line bg-white p-5">
            <p className="text-sm text-slate-ink">Mensualité</p>
            <p className="tabular mt-2 font-display text-3xl font-bold text-navy">
              {formatAmount(monthly)}
            </p>
            <p className="mt-1 text-sm text-slate-ink">par mois pendant {form.term} mois</p>
          </div>

          <div className="border-l-4 border-l-amber-500 border-y border-r border-line bg-white p-5">
            <p className="text-sm text-slate-ink">Coût total des intérêts</p>
            <p className="tabular mt-2 font-display text-3xl font-bold text-navy">
              {formatAmount(totalInterest)}
            </p>
            <p className="mt-1 text-sm text-amber-700">
              Taux annuel : {form.rate} %
            </p>
          </div>

          <div className="border-l-4 border-l-slate-300 border-y border-r border-line bg-white p-5">
            <p className="text-sm text-slate-ink">Coût total remboursé</p>
            <p className="tabular mt-2 font-display text-3xl font-bold text-navy">
              {formatAmount(totalRepaid)}
            </p>
            <p className="mt-1 text-sm text-slate-ink">
              Capital {formatAmount(form.amount)} + Intérêts {formatAmount(totalInterest)}
            </p>
          </div>

          {/* Répartition visuelle */}
          <div className="border border-line bg-white p-5">
            <p className="text-sm font-medium text-navy mb-3">Répartition du coût total</p>
            <div className="flex h-4 w-full overflow-hidden rounded-full">
              <div
                className="bg-blue"
                style={{
                  width: `${totalRepaid > 0 ? (form.amount / totalRepaid) * 100 : 100}%`,
                }}
                title={`Capital : ${formatAmount(form.amount)}`}
              />
              <div
                className="bg-amber-400"
                style={{
                  width: `${totalRepaid > 0 ? (totalInterest / totalRepaid) * 100 : 0}%`,
                }}
                title={`Intérêts : ${formatAmount(totalInterest)}`}
              />
            </div>
            <div className="mt-2 flex gap-4 text-xs text-slate-ink">
              <span className="flex items-center gap-1">
                <span className="inline-block h-2 w-3 rounded-sm bg-blue" /> Capital
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-2 w-3 rounded-sm bg-amber-400" /> Intérêts
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
