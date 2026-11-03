const TONE_BORDER = {
  default: 'border-l-blue',
  positive: 'border-l-green-600',
  negative: 'border-l-red-600',
  warning: 'border-l-amber-500',
}

const TONE_SUB_TEXT = {
  default: 'text-slate-ink',
  positive: 'text-green-700',
  negative: 'text-red-700',
  warning: 'text-amber-700',
}

export default function KpiCard({ label, value, sub, tone = 'default' }) {
  return (
    <div
      className={`border-l-4 border-y border-r border-line bg-white p-5 ${TONE_BORDER[tone]}`}
    >
      <p className="text-sm text-slate-ink">{label}</p>
      <p className="tabular mt-2 font-display text-2xl font-bold text-navy sm:text-3xl">{value}</p>
      {sub && <p className={`mt-1 text-sm ${TONE_SUB_TEXT[tone]}`}>{sub}</p>}
    </div>
  )
}
