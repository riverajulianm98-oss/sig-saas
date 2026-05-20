'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { useComplianceBreakdown } from '../hooks/use-audits'
import type { ComplianceClause } from '@/types/audits'

function ScoreRing({ score, size = 80 }: { score: number | null; size?: number }) {
  const radius = (size - 12) / 2
  const circumference = 2 * Math.PI * radius
  const pct = score ?? 0
  const offset = circumference - (pct / 100) * circumference
  const color = pct >= 80 ? '#10b981' : pct >= 60 ? '#f59e0b' : '#ef4444'

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} strokeWidth={6} className="fill-none stroke-[hsl(var(--muted))]" />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          strokeWidth={6}
          fill="none"
          stroke={color}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold tabular-nums" style={{ color: score !== null ? color : undefined }}>
          {score !== null ? `${score}%` : '—'}
        </span>
      </div>
    </div>
  )
}

function ClauseBar({ clause }: { clause: ComplianceClause }) {
  const total = clause.total - clause.no_aplica
  const score = clause.score ?? 0
  const color = score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-amber-500' : 'bg-red-500'

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-mono font-semibold text-[hsl(var(--primary))]">{clause.clause_code}</span>
          {clause.clause_title && (
            <span className="text-[hsl(var(--muted-foreground))] truncate max-w-[14rem]">{clause.clause_title}</span>
          )}
        </div>
        <span className="font-semibold tabular-nums">{clause.score !== null ? `${clause.score}%` : '—'}</span>
      </div>
      <div className="h-1.5 rounded-full bg-[hsl(var(--muted))]">
        <div className={`h-1.5 rounded-full transition-all ${color}`} style={{ width: `${score}%` }} />
      </div>
      <div className="flex items-center gap-3 text-[10px] text-[hsl(var(--muted-foreground))]">
        <span className="text-emerald-600 font-medium">{clause.cumple} cumple</span>
        <span className="text-amber-600">{clause.parcial} parcial</span>
        <span className="text-red-600">{clause.no_cumple} no cumple</span>
        {clause.no_aplica > 0 && <span>{clause.no_aplica} n/a</span>}
        <span className="ml-auto">{total} evaluados</span>
      </div>
    </div>
  )
}

interface ComplianceWidgetsProps {
  auditId: string
  overallScore?: number | null
}

export function ComplianceWidgets({ auditId, overallScore }: ComplianceWidgetsProps) {
  const { data: breakdown, isLoading } = useComplianceBreakdown(auditId)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <Skeleton className="h-60 rounded-xl" />
      </div>
    )
  }

  const score = breakdown?.overall_score ?? overallScore ?? null
  const responded = breakdown?.responded_items ?? 0
  const total = breakdown?.total_items ?? 0
  const pct = total ? Math.round((responded / total) * 100) : 0

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {/* Overall score */}
        <div className="rounded-xl border border-[hsl(var(--border))] p-5 flex flex-col items-center gap-2">
          <ScoreRing score={score} size={80} />
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Compliance Global</p>
          </div>
        </div>

        {/* Progress */}
        <div className="rounded-xl border border-[hsl(var(--border))] p-5 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Progreso checklist</p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-semibold">{responded}</span>
              <span className="text-[hsl(var(--muted-foreground))]">/ {total}</span>
            </div>
            <div className="h-2 rounded-full bg-[hsl(var(--muted))]">
              <div className="h-2 rounded-full bg-[hsl(var(--primary))] transition-all" style={{ width: `${pct}%` }} />
            </div>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">{pct}% completado</p>
          </div>
        </div>

        {/* Distribution */}
        <div className="rounded-xl border border-[hsl(var(--border))] p-5 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Distribución</p>
          {breakdown ? (
            <div className="space-y-1.5">
              {[
                { label: 'Cumple',    count: breakdown.clauses.reduce((a, c) => a + c.cumple, 0),    color: 'bg-emerald-500' },
                { label: 'Parcial',   count: breakdown.clauses.reduce((a, c) => a + c.parcial, 0),   color: 'bg-amber-500' },
                { label: 'No cumple', count: breakdown.clauses.reduce((a, c) => a + c.no_cumple, 0), color: 'bg-red-500' },
                { label: 'No aplica', count: breakdown.clauses.reduce((a, c) => a + c.no_aplica, 0), color: 'bg-[hsl(var(--muted-foreground))]' },
              ].map((d) => (
                <div key={d.label} className="flex items-center gap-2 text-xs">
                  <div className={`h-2 w-2 rounded-full flex-shrink-0 ${d.color}`} />
                  <span className="flex-1 text-[hsl(var(--muted-foreground))]">{d.label}</span>
                  <span className="font-semibold tabular-nums">{d.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[hsl(var(--muted-foreground))]">Sin datos aún</p>
          )}
        </div>
      </div>

      {/* Clause breakdown */}
      {breakdown?.clauses.length ? (
        <div className="rounded-xl border border-[hsl(var(--border))] p-5 space-y-4">
          <h4 className="text-sm font-semibold">Score por cláusula</h4>
          <div className="space-y-4">
            {breakdown.clauses.map((clause) => (
              <ClauseBar key={clause.clause_code} clause={clause} />
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-[hsl(var(--border))] p-6 text-center">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Completa el checklist para ver el desglose de compliance por cláusula
          </p>
        </div>
      )}
    </div>
  )
}
