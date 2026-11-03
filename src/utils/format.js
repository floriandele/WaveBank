export function formatAmount(value, currency = 'EUR') {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatDate(dateStr, options = { day: '2-digit', month: 'long', year: 'numeric' }) {
  return new Intl.DateTimeFormat('fr-FR', options).format(new Date(dateStr))
}

export function formatDateShort(dateStr) {
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short' }).format(new Date(dateStr))
}
