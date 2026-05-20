'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, CheckCircle2, XCircle, MinusCircle, AlertCircle, Loader2, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ComplianceBadge } from './audit-status-badge'
import { useAuditChecklist, useRecordChecklistResponse } from '../hooks/use-audits'
import type { AuditChecklistResponse, ChecklistCompliance } from '@/types/audits'

const COMPLIANCE_OPTIONS: { value: ChecklistCompliance; label: string; icon: React.ReactNode; classes: string }[] = [
  { value: 'cumple',    label: 'Cumple',    icon: <CheckCircle2 className="h-4 w-4" />, classes: 'border-emerald-500 bg-emerald-500/10 text-emerald-700' },
  { value: 'parcial',  label: 'Parcial',   icon: <AlertCircle className="h-4 w-4" />,  classes: 'border-amber-500 bg-amber-500/10 text-amber-700' },
  { value: 'no_cumple',label: 'No cumple', icon: <XCircle className="h-4 w-4" />,      classes: 'border-red-500 bg-red-500/10 text-red-700' },
  { value: 'no_aplica',label: 'No aplica', icon: <MinusCircle className="h-4 w-4" />,  classes: 'border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40 text-[hsl(var(--muted-foreground))]' },
]

interface ChecklistItemRowProps {
  item: AuditChecklistResponse
  auditId: string
  canRespond: boolean
}

function ChecklistItemRow({ item, auditId, canRespond }: ChecklistItemRowProps) {
  const [expanded, setExpanded] = useState(false)
  const [observations, setObservations] = useState(item.observations ?? '')
  const { mutateAsync, isPending } = useRecordChecklistResponse()

  const handleResponse = async (compliance: ChecklistCompliance) => {
    await mutateAsync({
      auditId,
      checklistId: item.id,
      data: {
        compliance_status: compliance,
        observations: observations || undefined,
      },
    })
  }

  const saveObservations = async () => {
    if (!item.compliance_status) return
    await mutateAsync({
      auditId,
      checklistId: item.id,
      data: { compliance_status: item.compliance_status, observations },
    })
  }

  return (
    <div className={`border border-[hsl(var(--border))] rounded-xl transition-all ${
      item.compliance_status === 'cumple' ? 'border-l-4 border-l-emerald-500' :
      item.compliance_status === 'no_cumple' ? 'border-l-4 border-l-red-500' :
      item.compliance_status === 'parcial' ? 'border-l-4 border-l-amber-500' :
      item.compliance_status === 'no_aplica' ? 'border-l-4 border-l-[hsl(var(--border))]' :
      'border-l-4 border-l-transparent'
    }`}>
      <div
        className="flex items-start gap-3 p-4 cursor-pointer select-none"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="mt-0.5 text-[hsl(var(--muted-foreground))]">
          {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </div>

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs font-semibold text-[hsl(var(--primary))]">
              {item.clause_code}
            </span>
            {item.section_title && (
              <span className="text-xs text-[hsl(var(--muted-foreground))]">{item.section_title}</span>
            )}
            {item.criticality === 'critica' && (
              <span className="rounded-full bg-red-500/10 border border-red-500/20 text-red-700 px-2 py-0.5 text-[10px] font-semibold">
                Crítico
              </span>
            )}
            {item.evidence_required && (
              <span className="rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-700 px-2 py-0.5 text-[10px]">
                Evidencia requerida
              </span>
            )}
          </div>
          <p className="text-sm font-medium leading-snug">{item.question_text}</p>
        </div>

        <div className="flex-shrink-0">
          {item.compliance_status ? (
            <ComplianceBadge compliance={item.compliance_status} />
          ) : (
            <span className="text-xs text-[hsl(var(--muted-foreground))]">Sin responder</span>
          )}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-[hsl(var(--border))] px-4 pb-4 pt-3 space-y-3 bg-[hsl(var(--muted))]/20 rounded-b-xl">
          {item.requirement_text && (
            <div className="text-xs text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted))]/50 rounded-lg p-3">
              <span className="font-medium text-[hsl(var(--foreground))]">Requisito: </span>
              {item.requirement_text}
            </div>
          )}

          {item.compliance_criteria && (
            <div className="text-xs text-[hsl(var(--muted-foreground))] bg-blue-500/5 rounded-lg p-3 border border-blue-500/10">
              <span className="font-medium text-blue-700">Criterio: </span>
              {item.compliance_criteria}
            </div>
          )}

          {canRespond && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                {COMPLIANCE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    disabled={isPending}
                    onClick={(e) => { e.stopPropagation(); handleResponse(opt.value) }}
                    className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                      item.compliance_status === opt.value
                        ? opt.classes
                        : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]/40 text-[hsl(var(--muted-foreground))]'
                    }`}
                  >
                    {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : opt.icon}
                    {opt.label}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 items-end">
                <div className="flex-1 space-y-1">
                  <label className="flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))]">
                    <MessageSquare className="h-3 w-3" /> Observaciones
                  </label>
                  <textarea
                    rows={2}
                    value={observations}
                    onChange={(e) => setObservations(e.target.value)}
                    placeholder="Observaciones, evidencias encontradas..."
                    className="flex w-full rounded-md border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-xs placeholder:text-[hsl(var(--muted-foreground))] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[hsl(var(--ring))] resize-none"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                {item.compliance_status && observations !== (item.observations ?? '') && (
                  <Button size="sm" onClick={(e) => { e.stopPropagation(); saveObservations() }} disabled={isPending}>
                    Guardar
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

interface ChecklistViewProps {
  auditId: string
  canRespond: boolean
}

export function ChecklistView({ auditId, canRespond }: ChecklistViewProps) {
  const { data: items, isLoading } = useAuditChecklist(auditId)
  const [filter, setFilter] = useState<ChecklistCompliance | 'all'>('all')

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  if (!items?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center rounded-xl border border-dashed border-[hsl(var(--border))]">
        <p className="text-sm font-medium">Sin ítems de checklist</p>
        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
          Aplica un template ISO para generar el checklist automáticamente
        </p>
      </div>
    )
  }

  // Group by section
  const sections = items.reduce<Record<string, AuditChecklistResponse[]>>((acc, item) => {
    const key = item.section_title ?? item.iso_standard
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {})

  const responded = items.filter((i) => i.compliance_status && i.compliance_status !== 'pendiente').length
  const progress = Math.round((responded / items.length) * 100)

  const filteredItems = (list: AuditChecklistResponse[]) =>
    filter === 'all' ? list : list.filter((i) => i.compliance_status === filter)

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="rounded-xl border border-[hsl(var(--border))] p-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Progreso checklist</span>
          <span className="font-semibold tabular-nums">{responded}/{items.length} respondidos</span>
        </div>
        <div className="h-2 rounded-full bg-[hsl(var(--muted))]">
          <div
            className="h-2 rounded-full bg-[hsl(var(--primary))] transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center gap-4 text-xs text-[hsl(var(--muted-foreground))]">
          {(['all', 'cumple', 'parcial', 'no_cumple', 'no_aplica', 'pendiente'] as const).map((s) => {
            const count = s === 'all' ? items.length : items.filter((i) => (i.compliance_status ?? 'pendiente') === s).length
            return (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`transition-colors ${filter === s ? 'font-semibold text-[hsl(var(--foreground))]' : 'hover:text-[hsl(var(--foreground))]'}`}
              >
                {s === 'all' ? `Todos (${count})` :
                 s === 'cumple' ? `Cumple (${count})` :
                 s === 'parcial' ? `Parcial (${count})` :
                 s === 'no_cumple' ? `No cumple (${count})` :
                 s === 'no_aplica' ? `No aplica (${count})` :
                 `Pendiente (${count})`}
              </button>
            )
          })}
        </div>
      </div>

      {/* Checklist items grouped by section */}
      {Object.entries(sections).map(([section, sectionItems]) => {
        const filtered = filteredItems(sectionItems)
        if (!filtered.length) return null
        return (
          <div key={section} className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))] px-1">
              {section}
            </h4>
            {filtered.map((item) => (
              <ChecklistItemRow
                key={item.id}
                item={item}
                auditId={auditId}
                canRespond={canRespond}
              />
            ))}
          </div>
        )
      })}
    </div>
  )
}
