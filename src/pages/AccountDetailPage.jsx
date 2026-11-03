import { Link, useParams } from 'react-router'
import { accounts } from '../data/accounts'
import { transactions } from '../data/transactions'
import TransactionRow from '../components/TransactionRow'
import { formatAmount } from '../utils/format'

export default function AccountDetailPage() {
  const { id } = useParams()
  const account = accounts.find((a) => a.id === id)

  if (!account) {
    return (
      <section className="mx-auto max-w-6xl px-6 py-16 text-center">
        <h1 className="font-display text-2xl font-bold text-navy">Compte introuvable</h1>
        <p className="mt-2 text-slate-ink">
          Ce compte n'existe pas ou n'est plus rattaché à votre espace professionnel.
        </p>
        <Link to="/comptes" className="mt-6 inline-block text-sm font-medium text-blue hover:text-blue-dark">
          Retour aux comptes
        </Link>
      </section>
    )
  }

  const accountTransactions = transactions
    .filter((t) => t.accountId === account.id)
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <Link to="/comptes" className="text-sm font-medium text-blue hover:text-blue-dark">
        ← Retour aux comptes
      </Link>

      <div className="mt-6 border border-line bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="inline-block h-1.5 w-10 rounded-full" style={{ backgroundColor: account.color }} />
            <p className="mt-3 text-sm text-slate-ink">{account.type}</p>
            <h1 className="mt-1 font-display text-2xl font-bold text-navy">{account.name}</h1>
            <p className="tabular mt-2 text-sm text-slate-ink">{account.iban}</p>
          </div>
          <p className="tabular font-display text-3xl font-bold text-navy">
            {formatAmount(account.balance, account.currency)}
          </p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="font-display text-lg font-bold text-navy">Mouvements</h2>
        <div className="mt-4 border border-line bg-white px-4">
          {accountTransactions.length === 0 ? (
            <p className="py-6 text-sm text-slate-ink">Aucun mouvement sur ce compte.</p>
          ) : (
            accountTransactions.map((transaction) => (
              <TransactionRow key={transaction.id} transaction={transaction} currency={account.currency} />
            ))
          )}
        </div>
      </div>
    </section>
  )
}
