import { useState } from 'react'
import { Link } from 'react-router'
import { loans } from '../data/loans'
import LoanCard from '../components/LoanCard'
import { formatDate } from '../utils/format'
import { company } from '../data/company'

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tous' },
  { value: 'en_demande', label: 'En demande' },
  { value: 'accepte', label: 'Acceptés' },
  { value: 'en_cours', label: 'En cours' },
  { value: 'clos', label: 'Clos' },
]

export default function LoansPage() {
  const [filter, setFilter] = useState('all')

  const displayed = filter === 'all' ? loans : loans.filter((l) => l.status === filter)

  return (
    <>
      <section className="bg-navy">
        <div className="mx-auto max-w-6xl px-6 pt-12 pb-20">
          <p className="text-sm font-medium text-blue">{company.name}</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">
            Mes prêts
          </h1>
          <p className="mt-2 text-sm text-white/60">{formatDate(new Date().toISOString())}</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="-mt-8 flex flex-wrap items-center justify-between gap-4 rounded-none border border-line bg-white p-4">
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFilter(opt.value)}
                className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                  filter === opt.value
                    ? 'bg-navy text-white'
                    : 'bg-mist text-slate-ink hover:bg-line'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <Link
            to="/prets/simuler"
            className="inline-block rounded bg-blue px-4 py-2 text-sm font-semibold text-white hover:bg-blue-dark"
          >
            + Simuler un prêt
          </Link>
        </div>

        <div className="mt-6">
          {displayed.length === 0 ? (
            <div className="py-16 text-center">
              <p className="font-display text-lg font-bold text-navy">Aucun prêt trouvé</p>
              <p className="mt-2 text-sm text-slate-ink">
                {filter === 'all'
                  ? "Vous n'avez pas encore de prêt. Simulez votre première demande !"
                  : 'Aucun prêt ne correspond à ce filtre.'}
              </p>
              <Link
                to="/prets/simuler"
                className="mt-6 inline-block rounded bg-blue px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-dark"
              >
                Simuler un prêt
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {displayed.map((loan) => (
                <LoanCard key={loan.id} loan={loan} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
