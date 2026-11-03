import { useState } from 'react'
import { invoices } from '../data/invoices'
import InvoiceRow from '../components/InvoiceRow'

const FILTERS = [
  { key: 'toutes', label: 'Toutes' },
  { key: 'en_attente', label: 'En attente' },
  { key: 'payee', label: 'Payées' },
  { key: 'en_retard', label: 'En retard' },
]

export default function InvoicesPage() {
  const [activeFilter, setActiveFilter] = useState('toutes')

  const filteredInvoices =
    activeFilter === 'toutes' ? invoices : invoices.filter((f) => f.status === activeFilter)

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <p className="text-sm font-medium text-blue">Facturation client</p>
      <h1 className="mt-2 font-display text-3xl font-bold text-navy">Factures</h1>
      <p className="mt-2 max-w-xl text-slate-ink">
        Suivez l'état de vos factures émises et anticipez vos encaissements.
      </p>

      <div className="mt-8 flex gap-1 border-b border-line">
        {FILTERS.map((filter) => (
          <button
            key={filter.key}
            type="button"
            onClick={() => setActiveFilter(filter.key)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              activeFilter === filter.key
                ? 'border-blue text-navy'
                : 'border-transparent text-slate-ink hover:text-navy'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="mt-6 border border-line bg-white px-4">
        {filteredInvoices.length === 0 ? (
          <p className="py-6 text-sm text-slate-ink">Aucune facture dans cette catégorie.</p>
        ) : (
          filteredInvoices.map((invoice) => <InvoiceRow key={invoice.id} invoice={invoice} />)
        )}
      </div>
    </section>
  )
}
