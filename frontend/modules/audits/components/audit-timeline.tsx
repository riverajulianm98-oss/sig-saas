'use client'

import {
  Activity, Edit, CheckCircle, XCircle, PlayCircle,
  FileText, User, MessageSquare, Upload, Trash2,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuditTimeline } from '../hooks/use-audits'
import { formatRelativeTime } from '@/lib/utils'
import type { AuditTimelineEntry } from '@/types/audits'

const ACTION_CONFIG: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  created:          { icon: <CheckCircle className="h-3.5 w-3.5" />,   color: 'bg-emerald-500', label: 'Creada' },
  updated:          { icon: <Edit className="h-3.5 w-3.5" />,           color: 'bg-blue-500',    label: 'Actualizada' },
  status_changed:   { icon: <Activity className="h-3.5 w-3.5" />,       color: 'bg-purple-500',  label: 'Estado cambiado' },
  finding_added:    { icon: <FileText className="h-3.5 w-3.5" />,       color: 'bg-amber-500',   label: 'Hallazgo agregado' },
  finding_updated:  { icon: <Edit className="h-3.5 w-3.5" />,           color: 'bg-amber-400',   label: 'Hallazgo actualizado' },
  evidence_added:   { icon: <Upload className="h-3.5 w-3.5" />,         color: 'bg-cyan-500',    label: 'Evidencia subida' },
  deleted:          { icon: <Trash2 className="h-3.5 w-3.5" />,         color: 'bg-red-500',     label: 'Eliminada' },
  response_recorded:{ icon: <CheckCircle className="h-3.5 w-3.5" />,   color: 'bg-emerald-400', label: 'Respuesta registrada' },
  cancelled:        { icon: <XCircle className="h-3.5 w-3.5" />,        color: 'bg-red-500',     label: 'Cancelada' },
  started:          { icon: <PlayCircle className="h-3.5 w-3.5" />,     color: 'bg-indigo-500',  label: 'Iniciada' },
  comment_added:    { icon: <MessageSquare className="h-3.5 w-3.5" />,  color: 'bg-slate-500',   label: 'Comentario' },
  assigned:         { icon: <User className="h-3.5 w-3.5" />,            color: 'bg-pink-500',    label: 'Asignada' },
}

function TimelineEntry({ entry }: { entry: AuditTimelineEntry }) {
  const cfg = ACTION_CONFIG[entry.action] ?? {
    icon: <Activity className="h-3.5 w-3.5" />,
    color: 'bg-[hsl(var(--muted-foreground))]',
    label: entry.action,
  }

  const changes = entry.changes
  const changeKeys = changes ? Object.keys(changes).filter((k) => !['id', 'tenant_id'].includes(k)) : []

  return (
    <div className="relative flex gap-4 pb-6 last:pb-0">
      {/* Connector line */}
      <div className="absolute left-4 top-8 bottom-0 w-px bg-[hsl(var(--border))]" />

      {/* Icon */}
      <div className={`relative z-10 flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full text-white ${cfg.color}`}>
        {cfg.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1 pt-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium">{entry.message ?? cfg.label}</span>
          <span className="flex-shrink-0 text-xs text-[hsl(var(--muted-foreground))]">
            {formatRelativeTime(entry.created_at)}
          </span>
        </div>

        {entry.user_id && (
          <div className="flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))]">
            <User className="h-3 w-3" />
            <span className="font-mono">{entry.user_id.slice(0, 8)}…</span>
          </div>
        )}

        {changeKeys.length > 0 && (
          <div className="mt-2 rounded-lg bg-[hsl(var(--muted))]/40 border border-[hsl(var(--border))] p-2 space-y-1">
            {changeKeys.slice(0, 4).map((key) => {
              const change = changes![key] as { old?: unknown; new?: unknown } | undefined
              return (
                <div key={key} className="flex items-center gap-2 text-[11px]">
                  <span className="font-medium text-[hsl(var(--muted-foreground))] capitalize">{key.replace(/_/g, ' ')}:</span>
                  {change && typeof change === 'object' && 'old' in change ? (
                    <>
                      <span className="line-through text-red-500/80">{String(change.old ?? '—')}</span>
                      <span className="text-[hsl(var(--muted-foreground))]">→</span>
                      <span className="text-emerald-600">{String(change.new ?? '—')}</span>
                    </>
                  ) : (
                    <span>{String(change ?? '—')}</span>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

interface AuditTimelineProps {
  auditId: string
}

export function AuditTimeline({ auditId }: AuditTimelineProps) {
  const { data: timeline, isLoading } = useAuditTimeline(auditId)

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-1.5 pt-1">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!timeline?.items.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[hsl(var(--border))] py-12 text-center">
        <Activity className="h-8 w-8 text-[hsl(var(--muted-foreground))]" />
        <p className="mt-3 text-sm font-medium">Sin actividad registrada</p>
        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
          Las acciones sobre esta auditoría aparecerán aquí
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-[hsl(var(--border))] p-5">
      <div className="space-y-0">
        {timeline.items.map((entry) => (
          <TimelineEntry key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  )
}
