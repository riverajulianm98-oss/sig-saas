'use client'

import {
  FileText,
  CheckCircle2,
  Clock,
  Upload,
  Trash2,
  RefreshCw,
  Eye,
  ArrowRight,
} from 'lucide-react'
import { formatDate, formatRelativeTime } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import type { DocumentTimelineEntry } from '@/types/documents'

const ACTION_CONFIG: Record<string, {
  icon: React.ElementType
  label: string
  color: string
  bg: string
}> = {
  created: { icon: FileText, label: 'Creado', color: 'text-blue-500', bg: 'bg-blue-500/10' },
  updated: { icon: RefreshCw, label: 'Actualizado', color: 'text-amber-500', bg: 'bg-amber-500/10' },
  status_changed: { icon: ArrowRight, label: 'Estado cambiado', color: 'text-purple-500', bg: 'bg-purple-500/10' },
  approved: { icon: CheckCircle2, label: 'Aprobado', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  version_added: { icon: Upload, label: 'Nueva versión', color: 'text-blue-500', bg: 'bg-blue-500/10' },
  file_uploaded: { icon: Upload, label: 'Archivo subido', color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  deleted: { icon: Trash2, label: 'Eliminado', color: 'text-red-500', bg: 'bg-red-500/10' },
  viewed: { icon: Eye, label: 'Visualizado', color: 'text-slate-500', bg: 'bg-slate-500/10' },
  downloaded: { icon: FileText, label: 'Descargado', color: 'text-teal-500', bg: 'bg-teal-500/10' },
}

function formatAction(action: string): string {
  return ACTION_CONFIG[action]?.label ?? action.replace(/_/g, ' ')
}

interface DocumentTimelineProps {
  entries: DocumentTimelineEntry[]
  isLoading?: boolean
}

export function DocumentTimeline({ entries, isLoading }: DocumentTimelineProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
            <div className="flex-1 space-y-2 pt-1">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-dashed border-[hsl(var(--border))] py-10 text-sm text-[hsl(var(--muted-foreground))]">
        Sin actividad registrada
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-4 top-8 bottom-0 w-px bg-[hsl(var(--border))]" />

      <div className="space-y-4">
        {entries.map((entry, idx) => {
          const cfg = ACTION_CONFIG[entry.action] ?? ACTION_CONFIG.updated
          const Icon = cfg.icon

          return (
            <div key={entry.id} className="flex gap-4">
              {/* Icon */}
              <div
                className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${cfg.bg}`}
              >
                <Icon className={`h-3.5 w-3.5 ${cfg.color}`} />
              </div>

              {/* Content */}
              <div className={`flex-1 pb-4 ${idx < entries.length - 1 ? '' : ''}`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">
                      {entry.message ?? formatAction(entry.action)}
                    </p>
                    {entry.changes && Object.keys(entry.changes).length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {Object.entries(entry.changes).map(([k]) => (
                          <span
                            key={k}
                            className="rounded-md bg-[hsl(var(--muted))] px-1.5 py-0.5 font-mono text-[10px] text-[hsl(var(--muted-foreground))]"
                          >
                            {k}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <time
                    className="shrink-0 text-xs text-[hsl(var(--muted-foreground))]"
                    title={formatDate(entry.created_at)}
                  >
                    {formatRelativeTime(entry.created_at)}
                  </time>
                </div>
                {entry.ip_address && (
                  <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]/60">
                    {entry.ip_address}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
