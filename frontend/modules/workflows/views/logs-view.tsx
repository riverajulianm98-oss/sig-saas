'use client'

import { useState } from 'react'
import { CheckCircle2, XCircle, MinusCircle, Clock, TrendingUp, Zap, AlertCircle, ChevronLeft, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ExecutionStatus, WorkflowExecution } from '../types'
import { useWorkflowExecutions, useWorkflows, useWorkflowStats } from '../hooks/use-workflows'

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  const d = new Date(iso)
  const now = Date.now()
  const diffMs = now - d.getTime()
  const diffMin = Math.floor(diffMs / 60_000)
  const diffH = Math.floor(diffMin / 60)
  const diffD = Math.floor(diffH / 24)
  if (diffMin < 1) return 'ahora mismo'
  if (diffMin < 60) return `hace ${diffMin} min`
  if (diffH < 24) return `hace ${diffH}h`
  if (diffD < 7) return `hace ${diffD}d`
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })
}

function StatusBadge({ status }: { status: ExecutionStatus }) {
  const map = {
    success: { icon: CheckCircle2, label: 'Exitoso', cls: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-300' },
    failed: { icon: XCircle, label: 'Fallido', cls: 'text-red-600 bg-red-50 dark:bg-red-950 dark:text-red-300' },
    skipped: { icon: MinusCircle, label: 'Omitido', cls: 'text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted))]' },
  }
  const { icon: Icon, label, cls } = map[status]
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium', cls)}>
      <Icon className="h-3 w-3" /> {label}
    </span>
  )
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ElementType; label: string; value: string | number; color: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: color + '22' }}>
        <Icon className="h-4 w-4" style={{ color }} />
      </div>
      <div>
        <p className="text-xs text-[hsl(var(--muted-foreground))]">{label}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  )
}

// ── Main view ─────────────────────────────────────────────────────────────────

export function LogsView() {
  const { data: workflows = [] } = useWorkflows()
  const { data: stats } = useWorkflowStats()
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | undefined>(undefined)
  const { data: executions = [], isLoading } = useWorkflowExecutions(selectedWorkflowId)

  const successCount = executions.filter((e) => e.status === 'success').length
  const failedCount = executions.filter((e) => e.status === 'failed').length

  return (
    <div className="flex h-[calc(100vh-56px)] flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-[hsl(var(--border))] bg-[hsl(var(--background))] px-6 py-4">
        <a
          href="/automation"
          className="flex items-center gap-1 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> Automatización
        </a>
        <span className="text-[hsl(var(--muted-foreground))]">/</span>
        <h1 className="font-semibold">Historial de ejecuciones</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 border-b border-[hsl(var(--border))] bg-[hsl(var(--background))] px-6 py-4 lg:grid-cols-4">
        <StatCard icon={Zap} label="Ejecuciones hoy" value={stats?.executionsToday ?? 0} color="#6366f1" />
        <StatCard icon={TrendingUp} label="Tasa de éxito" value={`${stats?.successRate ?? 0}%`} color="#10b981" />
        <StatCard icon={AlertCircle} label="Errores totales" value={stats?.errorCount ?? 0} color="#ef4444" />
        <StatCard icon={Clock} label="Esta semana" value={stats?.executionsThisWeek ?? 0} color="#3b82f6" />
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] px-6 py-2.5">
        <Filter className="h-4 w-4 shrink-0 text-[hsl(var(--muted-foreground))]" />
        <span className="text-sm text-[hsl(var(--muted-foreground))]">Filtrar por:</span>
        <select
          value={selectedWorkflowId ?? ''}
          onChange={(e) => setSelectedWorkflowId(e.target.value || undefined)}
          className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
        >
          <option value="">Todas las reglas</option>
          {workflows.map((wf) => <option key={wf.id} value={wf.id}>{wf.name}</option>)}
        </select>
        <span className="ml-auto text-xs text-[hsl(var(--muted-foreground))]">
          {executions.length} registros
          {successCount > 0 && <span className="ml-2 text-emerald-600">{successCount} exitosos</span>}
          {failedCount > 0 && <span className="ml-2 text-red-600">{failedCount} fallidos</span>}
        </span>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[hsl(var(--border))] border-t-[hsl(var(--primary))]" />
          </div>
        ) : executions.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center gap-2 text-center">
            <MinusCircle className="h-8 w-8 text-[hsl(var(--muted-foreground))]" />
            <p className="text-sm text-[hsl(var(--muted-foreground))]">Sin ejecuciones registradas</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="sticky top-0 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]">
              <tr>
                <th className="px-6 py-2.5 text-left text-xs font-medium text-[hsl(var(--muted-foreground))]">Estado</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-[hsl(var(--muted-foreground))]">Regla</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-[hsl(var(--muted-foreground))]">Disparado por</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-[hsl(var(--muted-foreground))]">Resultado</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-[hsl(var(--muted-foreground))]">Duración</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-[hsl(var(--muted-foreground))]">Hace</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border))]">
              {executions.map((exec) => (
                <ExecutionRow key={exec.id} exec={exec} />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function ExecutionRow({ exec }: { exec: WorkflowExecution }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <>
      <tr
        onClick={() => setExpanded((v) => !v)}
        className="cursor-pointer hover:bg-[hsl(var(--accent))] transition-colors"
      >
        <td className="px-6 py-3">
          <StatusBadge status={exec.status} />
        </td>
        <td className="max-w-[180px] px-4 py-3">
          <p className="truncate font-medium">{exec.workflowName}</p>
        </td>
        <td className="max-w-[140px] px-4 py-3">
          <p className="truncate text-[hsl(var(--muted-foreground))]">{exec.triggeredBy}</p>
        </td>
        <td className="max-w-[220px] px-4 py-3">
          <p className="truncate text-[hsl(var(--muted-foreground))]">{exec.result}</p>
        </td>
        <td className="whitespace-nowrap px-4 py-3 text-[hsl(var(--muted-foreground))]">
          {exec.durationMs} ms
        </td>
        <td className="whitespace-nowrap px-4 py-3 text-[hsl(var(--muted-foreground))]">
          {formatDate(exec.executedAt)}
        </td>
      </tr>
      {expanded && exec.actionsExecuted.length > 0 && (
        <tr className="bg-[hsl(var(--muted))]/30">
          <td colSpan={6} className="px-6 py-2">
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-[hsl(var(--muted-foreground))]">Acciones ejecutadas:</span>
              {exec.actionsExecuted.map((a, i) => (
                <span key={i} className="rounded-full bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 text-xs text-emerald-700 dark:text-emerald-300">
                  {a}
                </span>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
