import { Link, useParams } from 'react-router'
import { accounts } from '../data/accounts'
import { transactions } from '../data/transactions'
import TransactionRow from '../components/TransactionRow'
import KpiCard from '../components/KpiCard'
import { formatAmount, formatDate } from '../utils/format'

function EndOfMonthProjection({ account }) {
  const now = new Date()
  // Normalize today to midnight local time for comparisons
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  // Last day of the current month
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  // Helper to format a Date as YYYY-MM-DD
  const toIso = (d) => {
    const pad = (n) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  }

  const todayStr = toIso(today)
  const endOfMonthStr = toIso(endOfMonth)

  // Future transactions: strictly after today, within current month, for this account
  const futureTransactions = transactions
    .filter((t) => {
      if (t.accountId !== account.id) return false
      const [y, m, dy] = t.date.split('-').map(Number)
      const txDate = new Date(y, m - 1, dy)
      return txDate > today && txDate <= endOfMonth
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date))

  // Compute projected balance day by day applying future transactions
  let runningBalance = account.balance
  let minBalance = account.balance
  let minDate = todayStr

  futureTransactions.forEach((t) => {
    runningBalance += t.amount
    if (runningBalance < minBalance) {
      minBalance = runningBalance
      minDate = t.date
    }
  })

  const projectedEndBalance = runningBalance
  const creuxTone = minBalance < 0 ? 'negative' : 'warning'
  const endTone = projectedEndBalance < 0 ? 'negative' : 'default'

  return (
    <div className="mt-8">
      <h2 className="font-display text-lg font-bold text-navy">Projection fin de mois</h2>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <KpiCard
          label="Creux de trésorerie"
          value={formatAmount(minBalance, account.currency)}
          sub={`Le ${formatDate(minDate)}`}
          tone={creuxTone}
        />
        <KpiCard
          label="Solde projeté fin de mois"
          value={formatAmount(projectedEndBalance, account.currency)}
          sub={`Au ${formatDate(endOfMonthStr)}`}
          tone={endTone}
        />
      </div>

      <div className="mt-4 border border-line bg-white px-4">
        {futureTransactions.length === 0 ? (
          <p className="py-6 text-sm text-slate-ink">Aucune transaction prévue ce mois-ci.</p>
        ) : (
          futureTransactions.map((transaction) => (
            <TransactionRow key={transaction.id} transaction={transaction} currency={account.currency} />
          ))
        )}
      </div>
    </div>
  )
}

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

  // Show end-of-month projection only for EUR checking accounts
  const showProjection = account.currency === 'EUR' && account.type === 'Compte courant'

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

      {showProjection && <EndOfMonthProjection account={account} />}
    </section>
  )
}
