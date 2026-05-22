'use client'

import { Clock, UserCircle, CheckCircle2, Plus, ArrowRight } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate } from '@/lib/utils'
import type { FindingTimelineEntry } from '@/types/findings'

const ACTION_ICONS: Record<string, typeof Clock> = {
  created:       Plus,
  status_change: ArrowRight,
  action_created:CheckCircle2,
  closed:        CheckCircle2,
}

const ACTION_COLORS: Record<string, string> = {
  created:        'bg-blue-500',
  status_change:  'bg-yellow-500',
  action_created: 'bg-purple-500',
  closed:         'bg-green-500',
}

interface FindingTimelineProps {
  entries: FindingTimelineEntry[]
  isLoading?: boolean
}

export function FindingTimeline({ entries, isLoading }: FindingTimelineProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-7 w-7 rounded-full" />
            <div className="space-y-1 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!entries.length) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <Clock className="h-8 w-8 text-[hsl(var(--muted-foreground))]" />
        <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">Sin eventos en el historial</p>
      </div>
    )
  }

  return (
    <div className="relative space-y-0">
      {/* Vertical line */}
      <div className="absolute left-3.5 top-7 bottom-7 w-px bg-[hsl(var(--border))]" />

      {entries.map((entry, idx) => {
        const Icon = ACTION_ICONS[entry.action] ?? Clock
        const color = ACTION_COLORS[entry.action] ?? 'bg-slate-500'
        return (
          <div key={entry.id} className="relative flex gap-4 pb-6 last:pb-0">
            <div className={`relative z-10 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full ${color}`}>
              <Icon className="h-3.5 w-3.5 text-white" />
            </div>
            <div className="flex-1 pt-0.5 min-w-0">
              <p className="text-sm font-medium text-[hsl(var(--foreground))]">{entry.message}</p>
              <div className="mt-1 flex items-center gap-3 text-xs text-[hsl(var(--muted-foreground))]">
                {entry.user_name && (
                  <span className="flex items-center gap-1">
                    <UserCircle className="h-3 w-3" />
                    {entry.user_name}
                  </span>
                )}
                <span>{formatDate(entry.created_at)}</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
