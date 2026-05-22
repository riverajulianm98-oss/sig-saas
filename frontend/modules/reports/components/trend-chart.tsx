'use client'

import { useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import type { AnalyticsTrends } from '@/types/analytics'

// SVG dimensions
const W = 760
const H = 200
const PAD = { l: 44, r: 16, t: 16, b: 36 }
const CW = W - PAD.l - PAD.r   // 700
const CH = H - PAD.t - PAD.b   // 148

function xPos(i: number, n: number) {
  return PAD.l + (i / (n - 1)) * CW
}

function yPos(val: number, min: number, max: number) {
  return PAD.t + CH - ((val - min) / (max - min)) * CH
}

function buildPath(points: [number, number][]): string {
  if (points.length < 2) return ''
  let d = `M ${points[0][0].toFixed(1)},${points[0][1].toFixed(1)}`
  for (let i = 1; i < points.length; i++) {
    const cpx = (points[i - 1][0] + points[i][0]) / 2
    d += ` C ${cpx.toFixed(1)},${points[i - 1][1].toFixed(1)} ${cpx.toFixed(1)},${points[i][1].toFixed(1)} ${points[i][0].toFixed(1)},${points[i][1].toFixed(1)}`
  }
  return d
}

function buildAreaPath(points: [number, number][]): string {
  if (points.length < 2) return ''
  const line = buildPath(points)
  const last = points[points.length - 1]
  const first = points[0]
  return `${line} L ${last[0].toFixed(1)},${(PAD.t + CH).toFixed(1)} L ${first[0].toFixed(1)},${(PAD.t + CH).toFixed(1)} Z`
}

const SERIES_CONFIG = [
  { key: 'compliance',       label: 'Compliance %',       color: '#6366f1', min: 0, max: 100 },
  { key: 'capa_completion',  label: 'Cierre CAPA %',      color: '#10b981', min: 0, max: 100 },
  { key: 'recurrence_rate',  label: 'Reincidencia %',     color: '#f59e0b', min: 0, max: 30 },
]

interface TrendChartProps {
  data: AnalyticsTrends | undefined
  isLoading: boolean
}

export function TrendChart({ data, isLoading }: TrendChartProps) {
  const [active, setActive] = useState<string[]>(['compliance', 'capa_completion'])
  const [tooltip, setTooltip] = useState<{ x: number; y: number; idx: number } | null>(null)

  if (isLoading) return <Skeleton className="h-[280px] w-full rounded-xl" />
  if (!data) return null

  const n = data.months.length
  const gridYValues = [0, 25, 50, 75, 100]

  const toggleSeries = (key: string) =>
    setActive((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key])

  return (
    <div className="space-y-3">
      {/* Legend */}
      <div className="flex flex-wrap gap-4">
        {SERIES_CONFIG.map((s) => (
          <button
            key={s.key}
            onClick={() => toggleSeries(s.key)}
            className={`flex items-center gap-2 text-xs font-medium transition-opacity ${active.includes(s.key) ? 'opacity-100' : 'opacity-30'}`}
          >
            <span className="h-2.5 w-6 rounded-full" style={{ background: s.color }} />
            {s.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="relative w-full overflow-hidden rounded-xl">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" style={{ aspectRatio: `${W}/${H}` }}>
          <defs>
            {SERIES_CONFIG.map((s) => (
              <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={s.color} stopOpacity="0.15" />
                <stop offset="100%" stopColor={s.color} stopOpacity="0" />
              </linearGradient>
            ))}
          </defs>

          {/* Y grid */}
          {gridYValues.map((v) => {
            const y = yPos(v, 0, 100)
            return (
              <g key={v}>
                <line x1={PAD.l} y1={y} x2={W - PAD.r} y2={y} stroke="hsl(var(--border))" strokeWidth="0.5" strokeDasharray={v === 0 ? '' : '3 3'} />
                <text x={PAD.l - 6} y={y + 4} textAnchor="end" fontSize="9" fill="hsl(var(--muted-foreground))">{v}</text>
              </g>
            )
          })}

          {/* X labels */}
          {data.months.map((m, i) => (
            <text key={i} x={xPos(i, n)} y={H - 6} textAnchor="middle" fontSize="9" fill="hsl(var(--muted-foreground))">{m}</text>
          ))}

          {/* Tooltip vertical line */}
          {tooltip && (
            <line x1={xPos(tooltip.idx, n)} y1={PAD.t} x2={xPos(tooltip.idx, n)} y2={PAD.t + CH} stroke="hsl(var(--primary))" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
          )}

          {/* Series */}
          {SERIES_CONFIG.filter((s) => active.includes(s.key)).map((s) => {
            const vals = data[s.key as keyof AnalyticsTrends] as number[]
            const pts: [number, number][] = vals.map((v, i) => [xPos(i, n), yPos(v, s.min, s.max)])
            return (
              <g key={s.key}>
                <path d={buildAreaPath(pts)} fill={`url(#grad-${s.key})`} />
                <path d={buildPath(pts)} fill="none" stroke={s.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                {pts.map(([x, y], i) => (
                  <circle key={i} cx={x} cy={y} r="3" fill={s.color} opacity={tooltip?.idx === i ? 1 : 0.6} />
                ))}
              </g>
            )
          })}

          {/* Hover zones */}
          {Array.from({ length: n }).map((_, i) => (
            <rect
              key={i}
              x={xPos(i, n) - CW / (2 * (n - 1))}
              y={PAD.t}
              width={CW / (n - 1)}
              height={CH}
              fill="transparent"
              onMouseEnter={() => setTooltip({ x: xPos(i, n), y: 0, idx: i })}
              onMouseLeave={() => setTooltip(null)}
            />
          ))}
        </svg>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="pointer-events-none absolute top-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--popover))] p-3 shadow-xl text-xs"
            style={{ left: `${(tooltip.x / W) * 100}%`, transform: tooltip.x > W / 2 ? 'translateX(-100%)' : 'none' }}
          >
            <p className="font-bold mb-1.5">{data.months[tooltip.idx]}</p>
            {SERIES_CONFIG.filter((s) => active.includes(s.key)).map((s) => {
              const val = (data[s.key as keyof AnalyticsTrends] as number[])[tooltip.idx]
              return (
                <div key={s.key} className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
                  <span className="text-[hsl(var(--muted-foreground))]">{s.label}:</span>
                  <span className="font-semibold">{val}%</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
