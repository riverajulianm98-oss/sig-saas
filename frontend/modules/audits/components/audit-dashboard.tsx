'use client'

import {
  ClipboardCheck, AlertTriangle, TrendingUp, Activity,
  CheckCircle2, Clock, XCircle, BarChart3,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuditDashboard } from '../hooks/use-audits'

interface StatWidgetProps {
  label: string
  value: number | string
  icon: React.ReactNode
  color: string
  sub?: string
  trend?: 'up' | 'down' | 'neutral'
}

function StatWidget({ label, value, icon, color, sub }: StatWidgetProps) {
  return (
    <div className="rounded-xl border border-[hsl(var(--border))] p-4 space-y-3 hover:border-[hsl(var(--primary))]/30 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">{label}</span>
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${color}`}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold tabular-nums">{value}</p>
        {sub && <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

function DistributionBar({ label, data }: { label: string; data: Record<string, number> }) {
  const total = Object.values(data).reduce((a, b) => a + b, 0)
  if (!total) return null

  const COLORS: Record<string, string> = {
    planeada:       'bg-blue-500',
    en_proceso:     'bg-amber-500',
    finalizada:     'bg-emerald-500',
    cerrada:        'bg-slate-400',
    cancelada:      'bg-red-400',
    abierto:        'bg-red-500',
    en_seguimiento: 'bg-amber-500',
    cerrado:        'bg-emerald-500',
    no_conformidad:     'bg-red-500',
    observacion:        'bg-amber-500',
    oportunidad_mejora: 'bg-blue-500',
    fortaleza:          'bg-emerald-500',
    pendiente:          'bg-slate-400',
    en_progreso:        'bg-amber-500',
    completada:         'bg-emerald-500',
    vencida:            'bg-red-500',
  }

  const LABELS: Record<string, string> = {
    planeada: 'Planeada', en_proceso: 'En proceso', finalizada: 'Finalizada',
    cerrada: 'Cerrada', cancelada: 'Cancelada', abierto: 'Abierto',
    en_seguimiento: 'En seguimiento', cerrado: 'Cerrado',
    no_conformidad: 'No conformidad', observacion: 'Observación',
    oportunidad_mejora: 'Oportunidad', fortaleza: 'Fortaleza',
    pendiente: 'Pendiente', en_progreso: 'En progreso',
    completada: 'Completada', vencida: 'Vencida',
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">{label}</span>
        <span className="text-xs text-[hsl(var(--muted-foreground))]">{total} total</span>
      </div>
      {/* Stacked bar */}
      <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
        {Object.entries(data).filter(([,v]) => v > 0).map(([key, val]) => (
          <div
            key={key}
            className={`${COLORS[key] ?? 'bg-[hsl(var(--muted-foreground))]'} transition-all`}
            style={{ width: `${(val / total) * 100}%` }}
            title={`${LABELS[key] ?? key}: ${val}`}
          />
        ))}
      </div>
      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(data).filter(([,v]) => v > 0).map(([key, val]) => (
          <div key={key} className="flex items-center gap-1.5 text-xs">
            <div className={`h-2 w-2 rounded-full ${COLORS[key] ?? 'bg-[hsl(var(--muted-foreground))]'}`} />
            <span className="text-[hsl(var(--muted-foreground))]">{LABELS[key] ?? key}</span>
            <span className="font-semibold">{val}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function AuditDashboardWidgets() {
  const { data, isLoading } = useAuditDashboard()

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
      </div>
    )
  }

  if (!data) return null

  const scoreAvg = data.compliance_score_avg !== null ? `${Math.round(data.compliance_score_avg)}%` : '—'

  return (
    <div className="space-y-4">
      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatWidget
          label="Auditorías abiertas"
          value={data.open_audits}
          icon={<ClipboardCheck className="h-4 w-4 text-blue-600" />}
          color="bg-blue-500/10"
        />
        <StatWidget
          label="Hallazgos críticos"
          value={data.critical_findings}
          icon={<AlertTriangle className="h-4 w-4 text-red-600" />}
          color="bg-red-500/10"
          sub="Severidad crítica o alta"
        />
        <StatWidget
          label="Hallazgos abiertos"
          value={data.open_findings}
          icon={<Activity className="h-4 w-4 text-amber-600" />}
          color="bg-amber-500/10"
        />
        <StatWidget
          label="Compliance promedio"
          value={scoreAvg}
          icon={<TrendingUp className="h-4 w-4 text-emerald-600" />}
          color="bg-emerald-500/10"
          sub="Todas las auditorías"
        />
      </div>

      {/* Distribution charts */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-[hsl(var(--border))] p-5 space-y-4">
          <DistributionBar label="Auditorías por estado" data={data.audits_by_status} />
        </div>
        <div className="rounded-xl border border-[hsl(var(--border))] p-5 space-y-4">
          <DistributionBar label="Hallazgos por clasificación" data={data.findings_by_classification} />
        </div>
      </div>

      {/* Action plans */}
      {Object.keys(data.action_plans_by_status).length > 0 && (
        <div className="rounded-xl border border-[hsl(var(--border))] p-5">
          <DistributionBar label="Planes de acción por estado" data={data.action_plans_by_status} />
        </div>
      )}

      {/* Top processes with findings */}
      {Object.keys(data.findings_by_process).length > 0 && (
        <div className="rounded-xl border border-[hsl(var(--border))] p-5 space-y-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
              Hallazgos por proceso
            </span>
          </div>
          <div className="space-y-2">
            {Object.entries(data.findings_by_process)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 6)
              .map(([process, count]) => {
                const max = Math.max(...Object.values(data.findings_by_process))
                return (
                  <div key={process} className="flex items-center gap-3">
                    <span className="text-xs text-[hsl(var(--muted-foreground))] w-28 truncate flex-shrink-0">{process}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-[hsl(var(--muted))]">
                      <div
                        className="h-1.5 rounded-full bg-[hsl(var(--primary))]"
                        style={{ width: `${(count / max) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold tabular-nums w-4 text-right">{count}</span>
                  </div>
                )
              })}
          </div>
        </div>
      )}
    </div>
  )
}
