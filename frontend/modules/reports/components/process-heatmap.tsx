'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { ProcessRisk, ClauseScore } from '@/types/analytics'

const SEV_COLS = [
  { key: 'critica', label: 'Crítica', baseColor: 'rgb(239,68,68)' },
  { key: 'alta',    label: 'Alta',    baseColor: 'rgb(249,115,22)' },
  { key: 'media',   label: 'Media',   baseColor: 'rgb(234,179,8)' },
  { key: 'baja',    label: 'Baja',    baseColor: 'rgb(34,197,94)' },
]

function cellOpacity(count: number, max: number): number {
  if (count === 0) return 0
  return 0.15 + (count / max) * 0.75
}

interface ProcessHeatmapProps {
  data: ProcessRisk[] | undefined
  isLoading: boolean
}

export function ProcessHeatmap({ data, isLoading }: ProcessHeatmapProps) {
  if (isLoading) return <Skeleton className="h-64 w-full rounded-xl" />
  if (!data?.length) return null

  const maxCount = Math.max(...data.flatMap((d) => [d.critica, d.alta, d.media, d.baja]))

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr>
            <th className="py-2 pr-3 text-left text-[hsl(var(--muted-foreground))] font-medium w-36">Proceso</th>
            {SEV_COLS.map((s) => (
              <th key={s.key} className="py-2 px-1 text-center font-semibold" style={{ color: s.baseColor }}>
                {s.label}
              </th>
            ))}
            <th className="py-2 pl-3 text-right text-[hsl(var(--muted-foreground))] font-medium">Riesgo</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[hsl(var(--border))]/50">
          {data.map((row) => (
            <tr key={row.process}>
              <td className="py-2 pr-3 font-medium text-[hsl(var(--foreground))]">{row.process}</td>
              {SEV_COLS.map((s) => {
                const count = row[s.key as keyof ProcessRisk] as number
                const opacity = cellOpacity(count, maxCount)
                return (
                  <td key={s.key} className="py-1 px-1">
                    <div
                      className="flex h-8 items-center justify-center rounded-md font-bold transition-all"
                      style={{
                        background: count > 0 ? s.baseColor : 'transparent',
                        opacity: count > 0 ? opacity + 0.2 : 1,
                        color: count > 0 ? 'white' : 'hsl(var(--muted-foreground))',
                      }}
                    >
                      {count > 0 ? count : '·'}
                    </div>
                  </td>
                )
              })}
              <td className="py-2 pl-3 text-right">
                <RiskScoreBar score={row.risk_score} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function RiskScoreBar({ score }: { score: number }) {
  const color = score >= 70 ? '#ef4444' : score >= 40 ? '#f59e0b' : '#10b981'
  return (
    <div className="flex items-center gap-2 justify-end">
      <div className="w-16 h-1.5 bg-[hsl(var(--muted))]/40 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${score}%`, background: color }} />
      </div>
      <span className="w-6 font-bold tabular-nums" style={{ color }}>{score}</span>
    </div>
  )
}

// ─── Clause scores bar chart ──────────────────────────────────────────────────
interface ClauseScoresChartProps {
  data: ClauseScore[] | undefined
  isLoading: boolean
}

export function ClauseScoresChart({ data, isLoading }: ClauseScoresChartProps) {
  if (isLoading) return <Skeleton className="h-64 w-full rounded-xl" />
  if (!data?.length) return null

  return (
    <div className="space-y-3">
      {data.map((c) => {
        const color = c.score >= 80 ? '#10b981' : c.score >= 65 ? '#f59e0b' : '#ef4444'
        return (
          <div key={c.clause} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-[hsl(var(--muted-foreground))] w-4">{c.clause}</span>
                <span className="font-medium text-[hsl(var(--foreground))]">{c.label}</span>
              </div>
              <span className="font-black tabular-nums" style={{ color }}>{c.score}%</span>
            </div>
            <div className="h-2 w-full bg-[hsl(var(--muted))]/40 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${c.score}%`, background: color }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
