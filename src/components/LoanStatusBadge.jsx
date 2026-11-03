const STATUS_CONFIG = {
  en_attente: {
    label: 'En attente',
    className: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20',
  },
  approuvée: {
    label: 'Approuvée',
    className: 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20',
  },
  refusée: {
    label: 'Refusée',
    className: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20',
  },
  annulée: {
    label: 'Annulée',
    className: 'bg-slate-50 text-slate-600 ring-1 ring-inset ring-slate-600/20',
  },
  active: {
    label: 'Active',
    className: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20',
  },
}

export default function LoanStatusBadge({ status }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.en_attente

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  )
}
