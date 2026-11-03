const STATUS_CONFIG = {
  en_cours: { label: 'En cours', className: 'bg-blue-50 text-blue ring-1 ring-inset ring-blue/20' },
  en_attente: { label: 'En attente', className: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20' },
  approuvé: { label: 'Approuvé', className: 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20' },
  rejeté: { label: 'Rejeté', className: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20' },
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
