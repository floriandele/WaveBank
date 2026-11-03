import { accounts } from '../data/accounts'
import AccountCard from '../components/AccountCard'

export default function AccountsPage() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <p className="text-sm font-medium text-blue">Vue d'ensemble</p>
      <h1 className="mt-2 font-display text-3xl font-bold text-navy">Comptes</h1>
      <p className="mt-2 max-w-xl text-slate-ink">
        Retrouvez l'ensemble de vos comptes professionnels et leur solde en temps réel.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {accounts.map((account) => (
          <AccountCard key={account.id} account={account} full />
        ))}
      </div>
    </section>
  )
}
