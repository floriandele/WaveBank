import { Link } from 'react-router'
import { loans } from '../data/loans'
import { loanApplications } from '../data/loanApplications'
import LoanCard from '../components/LoanCard'
import LoanStatusBadge from '../components/LoanStatusBadge'
import { formatAmount, formatDate } from '../utils/format'

export default function LoansPage() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <p className="text-sm font-medium text-blue">Financement</p>
      <h1 className="mt-2 font-display text-3xl font-bold text-navy">Prêts</h1>
      <p className="mt-2 max-w-xl text-slate-ink">
        Consultez vos prêts actifs, simulez un nouveau financement ou suivez vos demandes en cours.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          to="/prets/simulateur"
          className="inline-flex items-center gap-2 rounded border border-blue bg-blue px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-dark"
        >
          Simuler un prêt
        </Link>
        <Link
          to="/prets/demande"
          className="inline-flex items-center gap-2 rounded border border-line bg-white px-4 py-2 text-sm font-medium text-navy transition-colors hover:border-blue"
        >
          Faire une demande
        </Link>
      </div>

      {/* Prêts actifs */}
      <div className="mt-12">
        <h2 className="font-display text-xl font-bold text-navy">Prêts actifs</h2>
        <p className="mt-1 text-sm text-slate-ink">
          {loans.length} prêt{loans.length > 1 ? 's' : ''} en cours de remboursement
        </p>

        {loans.length === 0 ? (
          <div className="mt-6 border border-line bg-white p-8 text-center">
            <p className="text-slate-ink">Aucun prêt actif sur votre compte.</p>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {loans.map((loan) => (
              <LoanCard key={loan.id} loan={loan} />
            ))}
          </div>
        )}
      </div>

      {/* Candidatures */}
      <div className="mt-14">
        <h2 className="font-display text-xl font-bold text-navy">Mes demandes</h2>
        <p className="mt-1 text-sm text-slate-ink">Suivi de vos candidatures de prêt</p>

        {loanApplications.length === 0 ? (
          <div className="mt-6 border border-line bg-white p-8 text-center">
            <p className="text-slate-ink">Aucune demande de prêt enregistrée.</p>
          </div>
        ) : (
          <div className="mt-6 border border-line bg-white px-4">
            {loanApplications.map((app) => (
              <div
                key={app.id}
                className="flex flex-wrap items-center gap-4 border-b border-line py-4 last:border-b-0"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-navy">
                    {app.loanType} — {formatAmount(app.principal)}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-ink">
                    Déposée le {formatDate(app.submittedDate)} · {app.durationMonths} mois · {app.annualRate} % /an
                  </p>
                  {app.notes && (
                    <p className="mt-1 text-xs italic text-slate-ink">{app.notes}</p>
                  )}
                </div>
                <LoanStatusBadge status={app.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
