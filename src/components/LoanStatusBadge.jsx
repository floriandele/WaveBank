const STATUS_CONFIG = {
  actif: {
    label: 'Actif',
    className: 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20',
  },
  en_cours: {
    label: 'En cours',
    className: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20',
  },
  approuvee: {
    label: 'Approuvée',
    className: 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20',
  },
  rejetee: {
    label: 'Rejetée',
    className: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20',
  },
  solde: {
    label: 'Soldé',
    className: 'bg-slate-50 text-slate-600 ring-1 ring-inset ring-slate-600/20',
  },
}

export default function LoanStatusBadge({ status }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.en_cours

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  )
}
