import { useMemo, useRef, useState } from 'react'
import { formatAmount, formatDate } from '../utils/format'

const WIDTH = 720
const HEIGHT = 280
const MARGIN = { top: 16, right: 16, bottom: 28, left: 64 }
const INNER_WIDTH = WIDTH - MARGIN.left - MARGIN.right
const INNER_HEIGHT = HEIGHT - MARGIN.top - MARGIN.bottom

const LINE_COLOR = '#2F5DFB'
const FORECAST_COLOR = '#7C3AED'

function niceTicks(min, max, count = 4) {
  const step = (max - min) / (count - 1)
  return Array.from({ length: count }, (_, i) => Math.round(min + step * i))
}

/**
 * CashFlowChart
 *
 * Props:
 *   data  {Array<{date: string, balance: number, isProjected?: boolean}>}
 *         Tableau de points. Quand isProjected est absent de tous les points,
 *         le graphique est tracé en une seule couleur (mode legacy).
 *         Quand certains points ont isProjected: true, les deux segments
 *         (historique et prévisionnel) sont colorés différemment.
 */
export default function CashFlowChart({ data }) {
  const svgRef = useRef(null)
  const [hoverIndex, setHoverIndex] = useState(null)

  const hasForecastSegment = useMemo(() => data.some((d) => d.isProjected === true), [data])

  // Index du premier point prévisionnel (séparation historique / prévisionnel)
  const splitIndex = useMemo(() => {
    if (!hasForecastSegment) return -1
    const idx = data.findIndex((d) => d.isProjected === true)
    return idx
  }, [data, hasForecastSegment])

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

  const baseline = MARGIN.top + INNER_HEIGHT

  // Chemin complet (pour zone de remplissage)
  const fullLinePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const fullAreaPath = `${fullLinePath} L ${points[points.length - 1].x} ${baseline} L ${points[0].x} ${baseline} Z`

  // Segments séparés si données hybrides (historique + prévisionnel)
  const historicalPoints = hasForecastSegment && splitIndex > 0 ? points.slice(0, splitIndex + 1) : []
  const forecastPoints = hasForecastSegment && splitIndex >= 0 ? points.slice(splitIndex) : []

  const historicalLinePath = historicalPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const forecastLinePath = forecastPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

  const historicalAreaPath = historicalPoints.length > 1
    ? `${historicalLinePath} L ${historicalPoints[historicalPoints.length - 1].x} ${baseline} L ${historicalPoints[0].x} ${baseline} Z`
    : ''

  const forecastAreaPath = forecastPoints.length > 1
    ? `${forecastLinePath} L ${forecastPoints[forecastPoints.length - 1].x} ${baseline} L ${forecastPoints[0].x} ${baseline} Z`
    : ''

  const yTicks = niceTicks(yMin, yMax, 4)

  // Calcul des index de dates à afficher sur l'axe X
  const xAxisIndices = useMemo(() => {
    const len = data.length
    if (len <= 1) return [0]
    const indices = [0, Math.round(len * 0.25), Math.round(len * 0.5), Math.round(len * 0.75), len - 1]
    return [...new Set(indices)].filter((i) => i < len)
  }, [data])

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
  const isActiveProjected = active.isProjected === true
  const tooltipWidth = 120
  const tooltipHeight = 44
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
          <p className="text-sm text-slate-ink">
            {hasForecastSegment
              ? 'Mois en cours — historique & projection, comptes EUR'
              : '30 prochains jours, tous comptes EUR confondus'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-ink">
            {hoverIndex !== null ? formatDate(active.date) : "Aujourd’hui"}
          </p>
          <p
            className={`tabular font-display text-xl font-bold ${
              isActiveProjected && hasForecastSegment ? 'text-violet-700' : 'text-navy'
            }`}
          >
            {formatAmount(active.balance)}
          </p>
          {hasForecastSegment && (
            <p className="text-xs text-slate-ink">
              {isActiveProjected ? 'prévisionnel' : 'constaté'}
            </p>
          )}
        </div>
      </div>

      {/* Légende */}
      {hasForecastSegment && (
        <div className="mt-2 flex gap-4 text-xs text-slate-ink">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-5 rounded bg-blue-600" aria-hidden="true" />
            Historique
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block h-0.5 w-5 rounded"
              style={{ background: FORECAST_COLOR }}
              aria-hidden="true"
            />
            Prévisionnel
          </span>
        </div>
      )}

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
          <linearGradient id="cashflow-forecast-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={FORECAST_COLOR} stopOpacity="0.14" />
            <stop offset="100%" stopColor={FORECAST_COLOR} stopOpacity="0" />
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

        {xAxisIndices.map((i) => (
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

        {/* Ligne de séparation historique / prévisionnel */}
        {hasForecastSegment && splitIndex > 0 && (
          <line
            x1={points[splitIndex].x}
            x2={points[splitIndex].x}
            y1={MARGIN.top}
            y2={baseline}
            stroke="#CBD5E1"
            strokeWidth="1"
            strokeDasharray="4 3"
          />
        )}

        {hasForecastSegment ? (
          <>
            {/* Zone et ligne historique */}
            {historicalAreaPath && (
              <path d={historicalAreaPath} fill="url(#cashflow-area)" />
            )}
            {historicalLinePath && (
              <path
                d={historicalLinePath}
                fill="none"
                stroke={LINE_COLOR}
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            )}

            {/* Zone et ligne prévisionnelle */}
            {forecastAreaPath && (
              <path d={forecastAreaPath} fill="url(#cashflow-forecast-area)" />
            )}
            {forecastLinePath && (
              <path
                d={forecastLinePath}
                fill="none"
                stroke={FORECAST_COLOR}
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeDasharray="6 3"
              />
            )}
          </>
        ) : (
          <>
            <path d={fullAreaPath} fill="url(#cashflow-area)" />
            <path
              d={fullLinePath}
              fill="none"
              stroke={LINE_COLOR}
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </>
        )}

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
            <circle
              cx={active.x}
              cy={active.y}
              r="5"
              fill={isActiveProjected && hasForecastSegment ? FORECAST_COLOR : LINE_COLOR}
              stroke="white"
              strokeWidth="2"
            />

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
              {hasForecastSegment && (
                <text
                  x={tooltipX + 10}
                  y={tooltipY + 42}
                  className={`text-[9px] ${isActiveProjected ? 'fill-violet-700' : 'fill-slate-ink'}`}
                >
                  {isActiveProjected ? 'prévisionnel' : 'constaté'}
                </text>
              )}
            </g>
          </>
        )}
      </svg>
    </div>
  )
}
