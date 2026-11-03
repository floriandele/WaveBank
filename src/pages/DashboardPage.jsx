import { Link } from 'react-router'
import { accounts } from '../data/accounts'
import { invoices } from '../data/invoices'
import { cashflowForecast } from '../data/cashflow'
import { company } from '../data/company'
import KpiCard from '../components/KpiCard'
import CashFlowChart from '../components/CashFlowChart'
import AccountCard from '../components/AccountCard'
import InvoiceRow from '../components/InvoiceRow'
import { formatAmount, formatDate } from '../utils/format'

// Prévision de décaissements sur 30 jours basée sur les charges récurrentes
// connues (salaires, charges sociales, loyer, assurance). Valeur cohérente
// avec les creux de src/data/cashflow.js.
const DECAISSEMENTS_PREVUS_30J = 11770

export default function DashboardPage() {
  const eurAccounts = accounts.filter((a) => a.currency === 'EUR')
  const soldeTotal = eurAccounts.reduce((sum, a) => sum + a.balance, 0)

  const encaissementsPrevus = invoices
    .filter((f) => f.status === 'en_attente')
    .reduce((sum, f) => sum + f.amount, 0)

  const facturesEnRetard = invoices.filter((f) => f.status === 'en_retard')
  const montantEnRetard = facturesEnRetard.reduce((sum, f) => sum + f.amount, 0)

  const recentInvoices = [...invoices]
    .sort((a, b) => new Date(b.issuedDate) - new Date(a.issuedDate))
    .slice(0, 5)

  return (
    <>
      <section className="bg-navy">
        <div className="mx-auto max-w-6xl px-6 pt-12 pb-20">
          <p className="text-sm font-medium text-blue">{company.name}</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">
            Tableau de bord
          </h1>
          <p className="mt-2 text-sm text-white/60">{formatDate(new Date().toISOString())}</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6">
        <div className="-mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="Solde total (comptes EUR)" value={formatAmount(soldeTotal)} />
          <KpiCard
            label="Encaissements prévus (30j)"
            value={formatAmount(encaissementsPrevus)}
            sub="Factures en attente de règlement"
            tone="positive"
          />
          <KpiCard
            label="Décaissements prévus (30j)"
            value={formatAmount(DECAISSEMENTS_PREVUS_30J)}
            sub="Charges récurrentes estimées"
            tone="warning"
          />
          <KpiCard
            label="Factures en retard"
            value={`${facturesEnRetard.length} facture${facturesEnRetard.length > 1 ? 's' : ''}`}
            sub={formatAmount(montantEnRetard)}
            tone="negative"
          />
        </div>

        <div className="mt-10 border border-line bg-white p-6">
          <CashFlowChart data={cashflowForecast} />
        </div>

        <div className="mt-10 grid gap-8 pb-16 lg:grid-cols-2">
          <div>
            <div className="flex items-baseline justify-between">
              <h2 className="font-display text-lg font-bold text-navy">Comptes</h2>
              <Link to="/comptes" className="text-sm font-medium text-blue hover:text-blue-dark">
                Tous les comptes
              </Link>
            </div>
            <div className="mt-4 flex flex-col gap-3">
              {accounts.map((account) => (
                <AccountCard key={account.id} account={account} />
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-baseline justify-between">
              <h2 className="font-display text-lg font-bold text-navy">Factures récentes</h2>
              <Link to="/factures" className="text-sm font-medium text-blue hover:text-blue-dark">
                Toutes les factures
              </Link>
            </div>
            <div className="mt-4 border border-line bg-white px-4">
              {recentInvoices.map((invoice) => (
                <InvoiceRow key={invoice.id} invoice={invoice} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
