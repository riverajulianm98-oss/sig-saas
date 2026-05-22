'use client'

import { cn } from '@/lib/utils'
import type {
  FindingClassification,
  FindingSeverity,
  FindingStatus,
  FindingSource,
  CapaStatus,
  CapaActionType,
} from '@/types/findings'

export const SEVERITY_CONFIG: Record<
  FindingSeverity,
  { label: string; className: string }
> = {
  baja:   { label: 'Baja',    className: 'bg-green-500/10 text-green-700 border-green-500/20 dark:text-green-400' },
  media:  { label: 'Media',   className: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20 dark:text-yellow-400' },
  alta:   { label: 'Alta',    className: 'bg-orange-500/10 text-orange-700 border-orange-500/20 dark:text-orange-400' },
  critica:{ label: 'Crítica', className: 'bg-red-500/10 text-red-700 border-red-500/20 dark:text-red-400' },
}

export const CLASSIFICATION_CONFIG: Record<
  FindingClassification,
  { label: string; className: string }
> = {
  no_conformidad:     { label: 'No conformidad',      className: 'bg-red-500/10 text-red-700 border-red-500/20 dark:text-red-400' },
  observacion:        { label: 'Observación',          className: 'bg-blue-500/10 text-blue-700 border-blue-500/20 dark:text-blue-400' },
  oportunidad_mejora: { label: 'Oportunidad de mejora', className: 'bg-purple-500/10 text-purple-700 border-purple-500/20 dark:text-purple-400' },
  fortaleza:          { label: 'Fortaleza',            className: 'bg-green-500/10 text-green-700 border-green-500/20 dark:text-green-400' },
}

export const STATUS_CONFIG: Record<
  FindingStatus,
  { label: string; className: string }
> = {
  abierto:        { label: 'Abierto',         className: 'bg-red-500/10 text-red-700 border-red-500/20 dark:text-red-400' },
  en_seguimiento: { label: 'En seguimiento',  className: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20 dark:text-yellow-400' },
  cerrado:        { label: 'Cerrado',         className: 'bg-green-500/10 text-green-700 border-green-500/20 dark:text-green-400' },
}

export const SOURCE_CONFIG: Record<
  FindingSource,
  { label: string }
> = {
  auditoria:       { label: 'Auditoría' },
  inspeccion:      { label: 'Inspección' },
  queja:           { label: 'Queja cliente' },
  revision_directa:{ label: 'Revisión directa' },
  mejora_continua: { label: 'Mejora continua' },
}

export const CAPA_STATUS_CONFIG: Record<
  CapaStatus,
  { label: string; className: string; step: number }
> = {
  pendiente:   { label: 'Pendiente',    className: 'bg-slate-500/10 text-slate-700 border-slate-500/20 dark:text-slate-300', step: 1 },
  en_progreso: { label: 'En progreso',  className: 'bg-blue-500/10 text-blue-700 border-blue-500/20 dark:text-blue-400', step: 2 },
  validacion:  { label: 'Validación',   className: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20 dark:text-yellow-400', step: 3 },
  cerrada:     { label: 'Cerrada',      className: 'bg-green-500/10 text-green-700 border-green-500/20 dark:text-green-400', step: 4 },
  cancelada:   { label: 'Cancelada',    className: 'bg-red-500/10 text-red-700 border-red-500/20 dark:text-red-400', step: 0 },
}

export const CAPA_TYPE_CONFIG: Record<
  CapaActionType,
  { label: string; className: string }
> = {
  correctiva:  { label: 'Correctiva',  className: 'bg-orange-500/10 text-orange-700 border-orange-500/20 dark:text-orange-400' },
  preventiva:  { label: 'Preventiva',  className: 'bg-blue-500/10 text-blue-700 border-blue-500/20 dark:text-blue-400' },
  mejora:      { label: 'Mejora',      className: 'bg-purple-500/10 text-purple-700 border-purple-500/20 dark:text-purple-400' },
}

interface BadgeProps { className?: string }

export function SeverityBadge({ severity, className }: { severity: FindingSeverity } & BadgeProps) {
  const cfg = SEVERITY_CONFIG[severity]
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold', cfg.className, className)}>
      {cfg.label}
    </span>
  )
}

export function ClassificationBadge({ classification, className }: { classification: FindingClassification } & BadgeProps) {
  const cfg = CLASSIFICATION_CONFIG[classification]
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium', cfg.className, className)}>
      {cfg.label}
    </span>
  )
}

export function FindingStatusBadge({ status, className }: { status: FindingStatus } & BadgeProps) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium', cfg.className, className)}>
      {cfg.label}
    </span>
  )
}

export function CapaStatusBadge({ status, className }: { status: CapaStatus } & BadgeProps) {
  const cfg = CAPA_STATUS_CONFIG[status]
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium', cfg.className, className)}>
      {cfg.label}
    </span>
  )
}

export function CapaTypeBadge({ type, className }: { type: CapaActionType } & BadgeProps) {
  const cfg = CAPA_TYPE_CONFIG[type]
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium', cfg.className, className)}>
      {cfg.label}
    </span>
  )
}
