'use client'

import { cn } from '@/lib/utils'
import { X, ChevronDown, ChevronUp, GripVertical } from 'lucide-react'
import { ReactNode, useState } from 'react'

interface WorkflowBlockProps {
  type: 'trigger' | 'condition' | 'action'
  icon: string
  title: string
  subtitle: string
  color: string
  children?: ReactNode
  onRemove?: () => void
  removable?: boolean
  defaultOpen?: boolean
  badge?: string
}

const TYPE_STYLES = {
  trigger: {
    border: 'border-blue-200 dark:border-blue-800',
    header: 'bg-blue-50 dark:bg-blue-950',
    label: 'text-blue-700 dark:text-blue-300',
    dot: 'bg-blue-500',
    tag: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  },
  condition: {
    border: 'border-amber-200 dark:border-amber-800',
    header: 'bg-amber-50 dark:bg-amber-950',
    label: 'text-amber-700 dark:text-amber-300',
    dot: 'bg-amber-500',
    tag: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  },
  action: {
    border: 'border-emerald-200 dark:border-emerald-800',
    header: 'bg-emerald-50 dark:bg-emerald-950',
    label: 'text-emerald-700 dark:text-emerald-300',
    dot: 'bg-emerald-500',
    tag: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
  },
}

const TYPE_LABELS = { trigger: 'DISPARO', condition: 'CONDICIÓN', action: 'ACCIÓN' }

export function WorkflowBlock({
  type, icon, title, subtitle, color, children, onRemove, removable = false, defaultOpen = false, badge,
}: WorkflowBlockProps) {
  const [open, setOpen] = useState(defaultOpen)
  const s = TYPE_STYLES[type]

  return (
    <div className={cn('rounded-xl border-2 overflow-hidden shadow-sm transition-all', s.border)}>
      {/* Header */}
      <div className={cn('flex items-center gap-3 px-4 py-3', s.header)}>
        <GripVertical className="h-4 w-4 text-[hsl(var(--muted-foreground))] opacity-50 shrink-0" />

        {/* Icon circle */}
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg shadow-sm"
          style={{ background: color + '22', border: `1.5px solid ${color}44` }}
        >
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={cn('text-[10px] font-bold tracking-widest uppercase', s.label)}>
              {TYPE_LABELS[type]}
            </span>
            {badge && (
              <span className={cn('rounded-full px-1.5 py-0.5 text-[10px] font-semibold', s.tag)}>
                {badge}
              </span>
            )}
          </div>
          <p className="truncate text-sm font-semibold text-[hsl(var(--foreground))]">{title}</p>
          <p className="truncate text-xs text-[hsl(var(--muted-foreground))]">{subtitle}</p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {children && (
            <button
              onClick={() => setOpen((v) => !v)}
              className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-[hsl(var(--accent))] transition-colors"
            >
              {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
          )}
          {removable && onRemove && (
            <button
              onClick={onRemove}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-[hsl(var(--muted-foreground))] hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Expandable config panel */}
      {children && open && (
        <div className="border-t border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
          {children}
        </div>
      )}
    </div>
  )
}

// Connector arrow between blocks
export function BlockConnector({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center py-1">
      <div className="h-4 w-px bg-[hsl(var(--border))]" />
      {label && (
        <span className="rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
          {label}
        </span>
      )}
      {label && <div className="h-4 w-px bg-[hsl(var(--border))]" />}
    </div>
  )
}
