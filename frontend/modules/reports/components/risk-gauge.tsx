'use client'

import { Skeleton } from '@/components/ui/skeleton'
import type { ExecutiveSummary } from '@/types/analytics'

const R = 80
const CX = 100
const CY = 95
const SW = 18

function arc(startDeg: number, endDeg: number, r: number): string {
  const toRad = (d: number) => (d * Math.PI) / 180
  const x1 = CX + r * Math.cos(toRad(startDeg))
  const y1 = CY + r * Math.sin(toRad(startDeg))
  const x2 = CX + r * Math.cos(toRad(endDeg))
  const y2 = CY + r * Math.sin(toRad(endDeg))
  const large = endDeg - startDeg > 180 ? 1 : 0
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`
}

// Gauge spans from 180° to 360° (half-circle from left to right)
// bajo: 180→240 (60°), medio: 240→300 (60°), alto: 300→360 (60°)
const ZONES = [
  { from: 180, to: 240, color: '#10b981', label: 'Bajo' },
  { from: 240, to: 300, color: '#f59e0b', label: 'Medio' },
  { from: 300, to: 360, color: '#ef4444', label: 'Alto' },
]

const NEEDLE_ANGLE: Record<string, number> = {
  bajo: 210,
  medio: 270,
  alto: 330,
}

const RISK_COLORS: Record<string, string> = {
  bajo: '#10b981',
  medio: '#f59e0b',
  alto: '#ef4444',
}

const RISK_LABELS: Record<string, string> = {
  bajo: 'Riesgo Bajo',
  medio: 'Riesgo Medio',
  alto: 'Riesgo Alto',
}

interface RiskGaugeProps {
  data: ExecutiveSummary | undefined
  isLoading: boolean
}

export function RiskGauge({ data, isLoading }: RiskGaugeProps) {
  if (isLoading) return <Skeleton className="h-[200px] w-full rounded-xl" />
  if (!data) return null

  const needleAngle = NEEDLE_ANGLE[data.risk_level] ?? 270
  const color = RISK_COLORS[data.risk_level] ?? '#f59e0b'
  const label = RISK_LABELS[data.risk_level] ?? 'Desconocido'
  const toRad = (d: number) => (d * Math.PI) / 180
  const needleLen = R - 6

  return (
    <div className="flex flex-col items-center gap-3">
      <svg viewBox="0 0 200 110" className="w-full max-w-[240px]">
        {/* Background arcs */}
        {ZONES.map((z) => (
          <path key={z.label} d={arc(z.from, z.to, R)} fill="none" stroke={z.color} strokeWidth={SW} strokeLinecap="butt" opacity="0.25" />
        ))}
        {/* Active arc (from 180 to needle) */}
        <path d={arc(180, needleAngle, R)} fill="none" stroke={color} strokeWidth={SW} strokeLinecap="butt" />

        {/* Needle */}
        <line
          x1={CX}
          y1={CY}
          x2={(CX + needleLen * Math.cos(toRad(needleAngle))).toFixed(2)}
          y2={(CY + needleLen * Math.sin(toRad(needleAngle))).toFixed(2)}
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx={CX} cy={CY} r="5" fill={color} />
        <circle cx={CX} cy={CY} r="2.5" fill="hsl(var(--card))" />

        {/* Zone ticks */}
        {ZONES.map((z) => {
          const midDeg = (z.from + z.to) / 2
          const tx = CX + (R + SW) * Math.cos(toRad(midDeg))
          const ty = CY + (R + SW) * Math.sin(toRad(midDeg))
          return (
            <text key={z.label} x={tx.toFixed(1)} y={ty.toFixed(1)} textAnchor="middle" fontSize="8" fill={z.color} fontWeight="600">
              {z.label}
            </text>
          )
        })}
      </svg>

      {/* Label */}
      <div className="text-center">
        <p className="text-xl font-black" style={{ color }}>{label}</p>
        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">Score global de riesgo SIG</p>
      </div>

      {/* Breakdown bars */}
      <div className="w-full space-y-1.5">
        {[
          { label: 'Bajo riesgo',   pct: data.risk_by_area.bajo,  color: '#10b981' },
          { label: 'Riesgo medio',  pct: data.risk_by_area.medio, color: '#f59e0b' },
          { label: 'Riesgo alto',   pct: data.risk_by_area.alto,  color: '#ef4444' },
        ].map((row) => (
          <div key={row.label} className="flex items-center gap-2 text-xs">
            <span className="w-24 text-[hsl(var(--muted-foreground))]">{row.label}</span>
            <div className="flex-1 h-1.5 bg-[hsl(var(--muted))]/40 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${row.pct}%`, background: row.color }} />
            </div>
            <span className="w-8 text-right font-semibold">{row.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
