'use client'

import { useState } from 'react'
import { Zap, Play, Power, Trash2, Plus, Clock, TrendingUp, CheckCircle, AlertCircle, Search, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Workflow } from '../types'
import {
  useWorkflows, useWorkflowStats, useCreateWorkflow, useUpdateWorkflow,
  useDeleteWorkflow, useToggleWorkflow, useRunWorkflow,
} from '../hooks/use-workflows'
import { WorkflowBuilder } from '../components/workflow-builder'
import { getTriggerDef } from '../rules/triggers'

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType
  label: string
  value: string | number
  sub?: string
  color: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: color + '22' }}>
        <Icon className="h-4 w-4" style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-[hsl(var(--muted-foreground))]">{label}</p>
        <p className="text-xl font-bold leading-tight">{value}</p>
        {sub && <p className="text-[10px] text-[hsl(var(--muted-foreground))]">{sub}</p>}
      </div>
    </div>
  )
}

// ── Workflow row ──────────────────────────────────────────────────────────────

function WorkflowRow({
  workflow,
  selected,
  onSelect,
  onToggle,
  onRun,
  onDelete,
}: {
  workflow: Workflow
  selected: boolean
  onSelect: () => void
  onToggle: () => void
  onRun: () => void
  onDelete: () => void
}) {
  const triggerDef = getTriggerDef(workflow.trigger.type)
  const successRate = workflow.executionCount > 0
    ? Math.round((workflow.successCount / workflow.executionCount) * 100)
    : 100

  return (
    <div
      onClick={onSelect}
      className={cn(
        'group flex cursor-pointer items-start gap-3 rounded-lg px-3 py-2.5 transition-colors',
        selected
          ? 'bg-[hsl(var(--primary))]/10 ring-1 ring-[hsl(var(--primary))]/30'
          : 'hover:bg-[hsl(var(--accent))]'
      )}
    >
      {/* Trigger icon */}
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm"
        style={{ background: triggerDef.color + '22' }}
      >
        {triggerDef.icon}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium">{workflow.name}</p>
          <span
            className={cn(
              'shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
              workflow.status === 'active'
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'
            )}
          >
            {workflow.status === 'active' ? 'Activo' : 'Inactivo'}
          </span>
        </div>
        <p className="truncate text-xs text-[hsl(var(--muted-foreground))]">{triggerDef.label}</p>
        <div className="mt-1 flex items-center gap-2 text-[10px] text-[hsl(var(--muted-foreground))]">
          <span>{workflow.executionCount} ejec.</span>
          <span>·</span>
          <span>{successRate}% éxito</span>
        </div>
      </div>

      {/* Action buttons (visible on hover / selected) */}
      <div className={cn('flex shrink-0 flex-col gap-1 transition-opacity', selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100')}>
        <button
          onClick={(e) => { e.stopPropagation(); onRun() }}
          title="Ejecutar ahora"
          className="flex h-6 w-6 items-center justify-center rounded-md text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-950 transition-colors"
        >
          <Play className="h-3 w-3" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onToggle() }}
          title={workflow.status === 'active' ? 'Desactivar' : 'Activar'}
          className={cn(
            'flex h-6 w-6 items-center justify-center rounded-md transition-colors',
            workflow.status === 'active'
              ? 'text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-950'
              : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))]'
          )}
        >
          <Power className="h-3 w-3" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete() }}
          title="Eliminar"
          className="flex h-6 w-6 items-center justify-center rounded-md text-[hsl(var(--muted-foreground))] hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950 transition-colors"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyCanvas({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[hsl(var(--muted))]">
        <Zap className="h-8 w-8 text-[hsl(var(--muted-foreground))]" />
      </div>
      <div>
        <p className="font-semibold">Sin automatización seleccionada</p>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Selecciona una regla de la lista o crea una nueva
        </p>
      </div>
      <button
        onClick={onCreate}
        className="flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-[hsl(var(--primary-foreground))] hover:opacity-90 transition-opacity"
      >
        <Plus className="h-4 w-4" /> Nueva automatización
      </button>
    </div>
  )
}

// ── Main view ─────────────────────────────────────────────────────────────────

type EditorState = { mode: 'new' } | { mode: 'edit'; workflow: Workflow }

export function AutomationView() {
  const { data: workflows = [], isLoading } = useWorkflows()
  const { data: stats } = useWorkflowStats()
  const createWorkflow = useCreateWorkflow()
  const updateWorkflow = useUpdateWorkflow()
  const deleteWorkflow = useDeleteWorkflow()
  const toggleWorkflow = useToggleWorkflow()
  const runWorkflow = useRunWorkflow()

  const [search, setSearch] = useState('')
  const [editor, setEditor] = useState<EditorState | null>(null)

  const filtered = workflows.filter((w) =>
    w.name.toLowerCase().includes(search.toLowerCase()) ||
    w.description.toLowerCase().includes(search.toLowerCase())
  )

  function handleSave(data: Parameters<typeof createWorkflow.mutate>[0]) {
    if (editor?.mode === 'edit') {
      updateWorkflow.mutate({ id: editor.workflow.id, data }, {
        onSuccess: () => {
          // refresh editor to reflect saved state
        },
      })
    } else {
      createWorkflow.mutate(data, {
        onSuccess: (saved) => setEditor({ mode: 'edit', workflow: saved as Workflow }),
      })
    }
  }

  function handleRun() {
    if (editor?.mode !== 'edit') return
    runWorkflow.mutate(editor.workflow)
  }

  return (
    <div className="flex h-[calc(100vh-56px)] flex-col overflow-hidden">
      {/* ── Stats banner ── */}
      <div className="grid grid-cols-2 gap-3 border-b border-[hsl(var(--border))] bg-[hsl(var(--background))] px-6 py-4 lg:grid-cols-4">
        <StatCard icon={Zap} label="Reglas activas" value={stats?.activeWorkflows ?? 0} sub={`de ${stats?.totalWorkflows ?? 0} total`} color="#6366f1" />
        <StatCard icon={TrendingUp} label="Ejecuciones hoy" value={stats?.executionsToday ?? 0} sub={`${stats?.executionsThisWeek ?? 0} esta semana`} color="#3b82f6" />
        <StatCard icon={CheckCircle} label="Tasa de éxito" value={`${stats?.successRate ?? 0}%`} sub="últimas ejecuciones" color="#10b981" />
        <StatCard icon={Clock} label="Tiempo ahorrado" value={`${Math.round((stats?.totalTimeSavedMinutes ?? 0) / 60)}h`} sub={`${stats?.totalTimeSavedMinutes ?? 0} min total`} color="#f59e0b" />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Left panel — workflow list ── */}
        <aside className="flex w-72 shrink-0 flex-col border-r border-[hsl(var(--border))] bg-[hsl(var(--card))]">
          <div className="flex items-center gap-2 border-b border-[hsl(var(--border))] p-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar reglas..."
                className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] py-1.5 pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
              />
            </div>
            <button
              onClick={() => setEditor({ mode: 'new' })}
              title="Nueva automatización"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90 transition-opacity"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-lg bg-[hsl(var(--muted))]" />
              ))
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <AlertCircle className="h-6 w-6 text-[hsl(var(--muted-foreground))]" />
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Sin resultados</p>
              </div>
            ) : (
              filtered.map((wf) => (
                <WorkflowRow
                  key={wf.id}
                  workflow={wf}
                  selected={editor?.mode === 'edit' && editor.workflow.id === wf.id}
                  onSelect={() => setEditor({ mode: 'edit', workflow: wf })}
                  onToggle={() => toggleWorkflow.mutate(wf.id)}
                  onRun={() => runWorkflow.mutate(wf)}
                  onDelete={() => {
                    deleteWorkflow.mutate(wf.id)
                    if (editor?.mode === 'edit' && editor.workflow.id === wf.id) setEditor(null)
                  }}
                />
              ))
            )}
          </div>

          {/* Link to logs */}
          <div className="border-t border-[hsl(var(--border))] p-3">
            <a
              href="/automation/logs"
              className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))] transition-colors"
            >
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4" /> Ver historial de ejecuciones
              </span>
              <ChevronRight className="h-4 w-4" />
            </a>
          </div>
        </aside>

        {/* ── Right panel — builder ── */}
        <main className="flex-1 overflow-hidden bg-[hsl(var(--background))]">
          {editor === null ? (
            <EmptyCanvas onCreate={() => setEditor({ mode: 'new' })} />
          ) : (
            <WorkflowBuilder
              key={editor.mode === 'edit' ? editor.workflow.id : 'new'}
              initial={editor.mode === 'edit' ? editor.workflow : undefined}
              onSave={handleSave}
              onRun={editor.mode === 'edit' ? handleRun : undefined}
              saving={createWorkflow.isPending || updateWorkflow.isPending}
              isExisting={editor.mode === 'edit'}
            />
          )}
        </main>
      </div>
    </div>
  )
}
