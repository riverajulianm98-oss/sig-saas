'use client'

import Link from 'next/link'
import { AlertTriangle, CheckCircle2, Clock, RefreshCw, TrendingUp, Users } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import type { CapaDashboardResponse } from '@/types/findings'

interface CapaDashboardProps {
  data: CapaDashboardResponse | undefined
  isLoading: boolean
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  className = '',
}: {
  label: string
  value: number | string
  sub?: string
  icon: typeof AlertTriangle
  className?: string
}) {
  return (
    <div className={`rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">{label}</span>
        <Icon className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
      </div>
      <p className="text-3xl font-bold tracking-tight">{value}</p>
      {sub && <p className="text-xs text-[hsl(var(--muted-foreground))]">{sub}</p>}
    </div>
  )
}

function BarRow({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div className="flex items-center gap-3">
      <span className="w-28 text-xs text-[hsl(var(--muted-foreground))] truncate">{label}</span>
      <div className="flex-1 h-2 bg-[hsl(var(--muted))]/40 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 text-right text-xs font-semibold">{value}</span>
    </div>
  )
}

export function CapaDashboardWidgets({ data, isLoading }: CapaDashboardProps) {
  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <Skeleton className="h-48 rounded-xl" />
      </div>
    )
  }

  if (!data) return null

  const open = data.pendiente + data.en_progreso + data.validacion

  return (
    <div className="space-y-5">
      {/* KPI row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard
          label="Abiertas"
          value={open}
          sub={`${data.total} total`}
          icon={AlertTriangle}
          className={open > 0 ? 'border-orange-500/30' : ''}
        />
        <StatCard
          label="Vencidas"
          value={data.vencidas}
          sub="Sin cerrar a tiempo"
          icon={Clock}
          className={data.vencidas > 0 ? 'border-red-500/30' : ''}
        />
        <StatCard
          label="Cerradas"
          value={data.cerrada}
          sub={data.total > 0 ? `${Math.round((data.cerrada / data.total) * 100)}% del total` : ''}
          icon={CheckCircle2}
          className={data.cerrada > 0 ? 'border-green-500/30' : ''}
        />
        <StatCard
          label="Reincidencias"
          value={data.reincidencias}
          sub="Hallazgos recurrentes"
          icon={RefreshCw}
          className={data.reincidencias > 0 ? 'border-yellow-500/30' : ''}
        />
        <StatCard
          label="Tiempo cierre"
          value={data.avg_close_days != null ? `${data.avg_close_days}d` : '—'}
          sub="Promedio de días"
          icon={TrendingUp}
        />
      </div>

      {/* Status pipeline visual */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
        <h3 className="text-sm font-semibold mb-4">Pipeline CAPA</h3>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[
            { label: 'Pendiente',   count: data.pendiente,   color: 'bg-slate-500' },
            { label: 'En progreso', count: data.en_progreso, color: 'bg-blue-500' },
            { label: 'Validación',  count: data.validacion,  color: 'bg-yellow-500' },
            { label: 'Cerrada',     count: data.cerrada,     color: 'bg-green-500' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="flex items-end justify-center gap-0.5 h-16 mb-1">
                <div
                  className={`w-10 rounded-t-md ${s.color}`}
                  style={{ height: `${data.total > 0 ? Math.max(4, (s.count / data.total) * 100) : 4}%` }}
                />
              </div>
              <p className="text-lg font-bold">{s.count}</p>
              <p className="text-[11px] text-[hsl(var(--muted-foreground))]">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Two column breakdown */}
      <div className="grid grid-cols-2 gap-4">
        {/* By process */}
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
          <h3 className="text-sm font-semibold mb-3">Por área de proceso</h3>
          <div className="space-y-2.5">
            {Object.entries(data.by_process)
              .sort(([, a], [, b]) => b - a)
              .map(([area, count]) => (
                <BarRow key={area} label={area} value={count} total={data.total} color="bg-[hsl(var(--primary))]" />
              ))}
          </div>
        </div>

        {/* By type */}
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
          <h3 className="text-sm font-semibold mb-3">Por tipo de acción</h3>
          <div className="space-y-2.5">
            {Object.entries(data.by_action_type)
              .sort(([, a], [, b]) => b - a)
              .map(([type, count]) => {
                const colors: Record<string, string> = {
                  correctiva: 'bg-orange-500',
                  preventiva:  'bg-blue-500',
                  mejora:      'bg-purple-500',
                }
                const labels: Record<string, string> = {
                  correctiva: 'Correctiva',
                  preventiva: 'Preventiva',
                  mejora:     'Mejora',
                }
                return (
                  <BarRow
                    key={type}
                    label={labels[type] ?? type}
                    value={count}
                    total={data.total}
                    color={colors[type] ?? 'bg-slate-500'}
                  />
                )
              })}
          </div>
        </div>
      </div>
    </div>
  )
}
