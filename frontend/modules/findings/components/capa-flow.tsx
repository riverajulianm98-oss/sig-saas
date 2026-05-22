'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Calendar, User, CheckCircle2, AlertCircle, Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { CapaTypeBadge, CAPA_STATUS_CONFIG } from './finding-severity-badge'
import { useChangeCapaStatus } from '../hooks/use-findings'
import { formatDate } from '@/lib/utils'
import type { CapaResponse, CapaStatus } from '@/types/findings'

const FLOW_STEPS: { status: CapaStatus; label: string }[] = [
  { status: 'pendiente',   label: 'Pendiente' },
  { status: 'en_progreso', label: 'En progreso' },
  { status: 'validacion',  label: 'Validación' },
  { status: 'cerrada',     label: 'Cerrada' },
]

const NEXT_STATUS: Partial<Record<CapaStatus, CapaStatus>> = {
  pendiente:   'en_progreso',
  en_progreso: 'validacion',
  validacion:  'cerrada',
}

function isOverdue(dueDate: string | null, status: CapaStatus): boolean {
  if (!dueDate || status === 'cerrada' || status === 'cancelada') return false
  return new Date(dueDate) < new Date()
}

interface CapaCardProps {
  action: CapaResponse
  findingId: string
  showFindingLink?: boolean
}

function CapaCard({ action, findingId, showFindingLink = false }: CapaCardProps) {
  const [advancing, setAdvancing] = useState(false)
  const { mutateAsync } = useChangeCapaStatus(findingId, action.id)
  const overdue = isOverdue(action.due_date, action.status)
  const next = NEXT_STATUS[action.status]

  const advance = async () => {
    if (!next) return
    setAdvancing(true)
    try {
      await mutateAsync({ status: next })
    } finally {
      setAdvancing(false)
    }
  }

  return (
    <div className={`rounded-lg border bg-[hsl(var(--card))] p-3 space-y-2.5 transition-all hover:shadow-md ${overdue ? 'border-red-500/30' : 'border-[hsl(var(--border))]'}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {action.code && (
            <span className="font-mono text-[10px] text-[hsl(var(--muted-foreground))]">{action.code}</span>
          )}
          <CapaTypeBadge type={action.action_type} />
        </div>
        {overdue && (
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 text-red-500" />
        )}
      </div>

      {/* Title */}
      <p className="text-xs font-semibold leading-snug line-clamp-2">{action.title}</p>

      {/* Finding link (for CAPA board) */}
      {showFindingLink && (
        <Link
          href={`/findings/${action.finding_id}`}
          onClick={(e) => e.stopPropagation()}
          className="text-[10px] text-[hsl(var(--primary))] hover:underline line-clamp-1"
        >
          ↗ {action.finding_code ?? action.finding_id}: {action.finding_title}
        </Link>
      )}

      {/* Meta */}
      <div className="space-y-1">
        {action.responsible_name && (
          <div className="flex items-center gap-1 text-[11px] text-[hsl(var(--muted-foreground))]">
            <User className="h-3 w-3 flex-shrink-0" />
            {action.responsible_name}
          </div>
        )}
        {action.due_date && (
          <div className={`flex items-center gap-1 text-[11px] font-medium ${overdue ? 'text-red-600 dark:text-red-400' : 'text-[hsl(var(--muted-foreground))]'}`}>
            <Calendar className="h-3 w-3 flex-shrink-0" />
            {overdue ? '⚠ ' : ''}{formatDate(action.due_date)}
          </div>
        )}
        {action.effectiveness_score != null && (
          <div className="flex items-center gap-1 text-[11px] text-green-600 dark:text-green-400">
            <CheckCircle2 className="h-3 w-3" />
            Efectividad: {action.effectiveness_score}%
          </div>
        )}
      </div>

      {/* Advance button */}
      {next && (
        <Button
          size="sm"
          variant="outline"
          className="w-full h-6 text-[10px] gap-1 mt-1"
          onClick={(e) => { e.stopPropagation(); advance() }}
          disabled={advancing}
        >
          {advancing
            ? <Loader2 className="h-3 w-3 animate-spin" />
            : <ArrowRight className="h-3 w-3" />
          }
          {advancing ? 'Avanzando...' : `→ ${CAPA_STATUS_CONFIG[next]?.label}`}
        </Button>
      )}
    </div>
  )
}

interface CapaFlowProps {
  actions: CapaResponse[]
  findingId: string
  isLoading?: boolean
  onAddAction?: () => void
  showFindingLinks?: boolean
}

export function CapaFlow({ actions, findingId, isLoading, onAddAction, showFindingLinks = false }: CapaFlowProps) {
  const [showCancelled, setShowCancelled] = useState(false)

  if (isLoading) {
    return (
      <div className="grid grid-cols-4 gap-3">
        {FLOW_STEPS.map((s) => (
          <div key={s.status} className="space-y-2">
            <Skeleton className="h-7 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
        ))}
      </div>
    )
  }

  const cancelled = actions.filter((a) => a.status === 'cancelada')
  const active = showCancelled ? actions : actions.filter((a) => a.status !== 'cancelada')

  const byStatus = (status: CapaStatus) => active.filter((a) => a.status === status)

  return (
    <div className="space-y-4">
      {/* Flow header */}
      <div className="flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))]">
        {FLOW_STEPS.map((s, i) => (
          <div key={s.status} className="flex items-center gap-1">
            {i > 0 && <ArrowRight className="h-3 w-3" />}
            <span className={`font-medium ${byStatus(s.status).length > 0 ? 'text-[hsl(var(--foreground))]' : ''}`}>
              {s.label}
            </span>
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[hsl(var(--muted))] text-[10px] font-bold">
              {byStatus(s.status).length}
            </span>
          </div>
        ))}
        {cancelled.length > 0 && (
          <button
            onClick={() => setShowCancelled((v) => !v)}
            className="ml-auto text-[10px] hover:text-[hsl(var(--foreground))] transition-colors"
          >
            {showCancelled ? 'Ocultar' : 'Ver'} canceladas ({cancelled.length})
          </button>
        )}
      </div>

      {/* Kanban columns */}
      <div className="grid grid-cols-4 gap-3">
        {FLOW_STEPS.map((step) => {
          const stepActions = byStatus(step.status)
          const cfg = CAPA_STATUS_CONFIG[step.status]
          return (
            <div key={step.status} className="flex flex-col gap-2">
              {/* Column header */}
              <div className={`flex items-center justify-between rounded-lg border px-3 py-2 ${cfg.className}`}>
                <span className="text-xs font-semibold">{step.label}</span>
                <span className="text-xs font-bold">{stepActions.length}</span>
              </div>

              {/* Cards */}
              <div className="flex flex-col gap-2 min-h-[60px]">
                {stepActions.map((action) => (
                  <CapaCard
                    key={action.id}
                    action={action}
                    findingId={findingId}
                    showFindingLink={showFindingLinks}
                  />
                ))}
                {stepActions.length === 0 && (
                  <div className="flex items-center justify-center rounded-lg border border-dashed border-[hsl(var(--border))] py-6">
                    <span className="text-[11px] text-[hsl(var(--muted-foreground))]">Vacío</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Cancelled section */}
      {showCancelled && cancelled.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Canceladas</p>
          <div className="grid grid-cols-4 gap-2">
            {cancelled.map((action) => (
              <CapaCard key={action.id} action={action} findingId={findingId} showFindingLink={showFindingLinks} />
            ))}
          </div>
        </div>
      )}

      {/* Add action */}
      {onAddAction && (
        <Button variant="outline" size="sm" className="gap-1.5" onClick={onAddAction}>
          <Plus className="h-3.5 w-3.5" />
          Nueva acción CAPA
        </Button>
      )}
    </div>
  )
}
