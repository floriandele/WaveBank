import { useMemo, useRef, useState } from 'react'
import { formatAmount, formatDate } from '../utils/format'

const WIDTH = 720
const HEIGHT = 280
const MARGIN = { top: 16, right: 16, bottom: 28, left: 64 }
const INNER_WIDTH = WIDTH - MARGIN.left - MARGIN.right
const INNER_HEIGHT = HEIGHT - MARGIN.top - MARGIN.bottom

const LINE_COLOR = '#2F5DFB'

function niceTicks(min, max, count = 4) {
  const step = (max - min) / (count - 1)
  return Array.from({ length: count }, (_, i) => Math.round(min + step * i))
}

export default function CashFlowChart({ data }) {
  const svgRef = useRef(null)
  const [hoverIndex, setHoverIndex] = useState(null)

  const { points, yMin, yMax, xScale, yScale } = useMemo(() => {
    const balances = data.map((d) => d.balance)
    const rawMin = Math.min(...balances)
    const rawMax = Math.max(...balances)
    const padding = (rawMax - rawMin) * 0.15 || rawMax * 0.05
    const min = Math.floor((rawMin - padding) / 500) * 500
    const max = Math.ceil((rawMax + padding) / 500) * 500

    const xs = (i) => MARGIN.left + (i / (data.length - 1)) * INNER_WIDTH
    const ys = (v) => MARGIN.top + (1 - (v - min) / (max - min)) * INNER_HEIGHT

    return {
      points: data.map((d, i) => ({ x: xs(i), y: ys(d.balance), ...d })),
      yMin: min,
      yMax: max,
      xScale: xs,
      yScale: ys,
    }
  }, [data])

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const baseline = MARGIN.top + INNER_HEIGHT
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${baseline} L ${points[0].x} ${baseline} Z`

  const yTicks = niceTicks(yMin, yMax, 4)

  function handlePointerMove(event) {
    const svg = svgRef.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const fraction = (event.clientX - rect.left) / rect.width
    const x = fraction * WIDTH
    const i = Math.round(((x - MARGIN.left) / INNER_WIDTH) * (points.length - 1))
    setHoverIndex(Math.min(Math.max(i, 0), points.length - 1))
  }

  function handlePointerLeave() {
    setHoverIndex(null)
  }

  const active = hoverIndex !== null ? points[hoverIndex] : points[points.length - 1]
  const tooltipWidth = 108
  const tooltipHeight = 40
  const tooltipOnRight = active.x < WIDTH - MARGIN.right - tooltipWidth - 10
  const tooltipX = tooltipOnRight ? active.x + 10 : active.x - tooltipWidth - 10
  const tooltipY = Math.max(active.y - tooltipHeight - 8, MARGIN.top)

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <div>
          <h3 className="font-display text-lg font-bold text-navy">
            Flux de trésorerie prévisionnel
          </h3>
          <p className="text-sm text-slate-ink">30 prochains jours, tous comptes EUR confondus</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-ink">
            {hoverIndex !== null ? formatDate(active.date) : 'Aujourd’hui'}
          </p>
          <p className="tabular font-display text-xl font-bold text-navy">
            {formatAmount(active.balance)}
          </p>
        </div>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={`Solde de trésorerie prévisionnel, de ${formatAmount(
          points[0].balance,
        )} le ${formatDate(points[0].date)} à ${formatAmount(
          points[points.length - 1].balance,
        )} le ${formatDate(points[points.length - 1].date)}`}
        className="mt-4 h-auto w-full touch-none"
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        <defs>
          <linearGradient id="cashflow-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={LINE_COLOR} stopOpacity="0.18" />
            <stop offset="100%" stopColor={LINE_COLOR} stopOpacity="0" />
          </linearGradient>
        </defs>

        {yTicks.map((tick) => {
          const y = yScale(tick)
          return (
            <g key={tick}>
              <line
                x1={MARGIN.left}
                x2={WIDTH - MARGIN.right}
                y1={y}
                y2={y}
                stroke="#E2E8F3"
                strokeWidth="1"
              />
              <text x={MARGIN.left - 10} y={y} textAnchor="end" dominantBaseline="middle" className="fill-slate-ink text-[10px]">
                {new Intl.NumberFormat('fr-FR', { notation: 'compact' }).format(tick)} €
              </text>
            </g>
          )
        })}

        {[0, 7, 14, 21, 29].map((i) => (
          <text
            key={i}
            x={xScale(i)}
            y={HEIGHT - 8}
            textAnchor="middle"
            className="fill-slate-ink text-[10px]"
          >
            {formatDate(points[i].date, { day: '2-digit', month: 'short' })}
          </text>
        ))}

        <path d={areaPath} fill="url(#cashflow-area)" />
        <path d={linePath} fill="none" stroke={LINE_COLOR} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

        {hoverIndex !== null && (
          <>
            <line
              x1={active.x}
              x2={active.x}
              y1={MARGIN.top}
              y2={baseline}
              stroke="#5B6B85"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            <circle cx={active.x} cy={active.y} r="5" fill={LINE_COLOR} stroke="white" strokeWidth="2" />

            <g className="tabular">
              <rect
                x={tooltipX}
                y={tooltipY}
                width={tooltipWidth}
                height={tooltipHeight}
                rx="6"
                fill="white"
                stroke="#E2E8F3"
              />
              <text x={tooltipX + 10} y={tooltipY + 16} className="fill-navy text-[10px] font-medium">
                {formatDate(active.date, { day: '2-digit', month: 'short' })}
              </text>
              <text x={tooltipX + 10} y={tooltipY + 30} className="fill-slate-ink text-[10px]">
                {formatAmount(active.balance)}
              </text>
            </g>
          </>
        )}
      </svg>
    </div>
  )
}
