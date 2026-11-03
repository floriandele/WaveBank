const STATUS_CONFIG = {
  payee: { label: 'Payée', className: 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20' },
  en_attente: { label: 'En attente', className: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20' },
  en_retard: { label: 'En retard', className: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20' },
}

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.en_attente

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  )
}
