import { cn } from '@/lib/utils'
import type { DocumentStatus, DocumentType } from '@/types/documents'

// ── Status badge ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<DocumentStatus, { label: string; classes: string }> = {
  borrador: {
    label: 'Borrador',
    classes: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  },
  revision: {
    label: 'En revisión',
    classes: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  },
  aprobado: {
    label: 'Aprobado',
    classes: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  },
  obsoleto: {
    label: 'Obsoleto',
    classes: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  },
}

export function StatusBadge({
  status,
  className,
}: {
  status: DocumentStatus
  className?: string
}) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, classes: 'bg-gray-100 text-gray-600' }
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        cfg.classes,
        className
      )}
    >
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          status === 'borrador' && 'bg-slate-400',
          status === 'revision' && 'bg-amber-500',
          status === 'aprobado' && 'bg-emerald-500',
          status === 'obsoleto' && 'bg-red-500'
        )}
      />
      {cfg.label}
    </span>
  )
}

// ── Type badge ────────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<DocumentType, { label: string; short: string }> = {
  procedimiento: { label: 'Procedimiento', short: 'PROC' },
  formato: { label: 'Formato', short: 'FMT' },
  instructivo: { label: 'Instructivo', short: 'INS' },
  politica: { label: 'Política', short: 'POL' },
  manual: { label: 'Manual', short: 'MAN' },
  evidencia: { label: 'Evidencia', short: 'EVD' },
}

export function TypeBadge({
  type,
  className,
}: {
  type: DocumentType
  className?: string
}) {
  const cfg = TYPE_CONFIG[type] ?? { label: type, short: type.slice(0, 3).toUpperCase() }
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-2 py-0.5 font-mono text-[11px] font-medium text-[hsl(var(--muted-foreground))]',
        className
      )}
    >
      {cfg.short}
    </span>
  )
}

export function TypeLabel({ type }: { type: DocumentType }) {
  return TYPE_CONFIG[type]?.label ?? type
}

export { STATUS_CONFIG, TYPE_CONFIG }
