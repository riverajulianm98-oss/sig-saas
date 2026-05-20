'use client'

import { cn } from '@/lib/utils'
import type { AuditStatus, AuditType, FindingSeverity, FindingClassification, ChecklistCompliance } from '@/types/audits'

const STATUS_CONFIG: Record<AuditStatus, { label: string; classes: string }> = {
  planeada:   { label: 'Planeada',    classes: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
  en_proceso: { label: 'En proceso',  classes: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  finalizada: { label: 'Finalizada',  classes: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  cerrada:    { label: 'Cerrada',     classes: 'bg-[hsl(var(--muted-foreground))]/10 text-[hsl(var(--muted-foreground))] border-[hsl(var(--border))]' },
  cancelada:  { label: 'Cancelada',   classes: 'bg-red-500/10 text-red-600 border-red-500/20' },
}

const TYPE_CONFIG: Record<AuditType, { label: string; classes: string }> = {
  interna:        { label: 'Interna',        classes: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20' },
  externa:        { label: 'Externa',        classes: 'bg-purple-500/10 text-purple-600 border-purple-500/20' },
  seguimiento:    { label: 'Seguimiento',    classes: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20' },
  certificacion:  { label: 'Certificación',  classes: 'bg-rose-500/10 text-rose-600 border-rose-500/20' },
  extraordinaria: { label: 'Extraordinaria', classes: 'bg-orange-500/10 text-orange-600 border-orange-500/20' },
}

const SEVERITY_CONFIG: Record<FindingSeverity, { label: string; dot: string; classes: string }> = {
  baja:   { label: 'Baja',    dot: 'bg-emerald-500', classes: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' },
  media:  { label: 'Media',   dot: 'bg-amber-500',   classes: 'bg-amber-500/10 text-amber-700 border-amber-500/20' },
  alta:   { label: 'Alta',    dot: 'bg-orange-500',  classes: 'bg-orange-500/10 text-orange-700 border-orange-500/20' },
  critica:{ label: 'Crítica', dot: 'bg-red-500',     classes: 'bg-red-500/10 text-red-700 border-red-500/20' },
}

const CLASSIFICATION_CONFIG: Record<FindingClassification, { label: string; classes: string }> = {
  no_conformidad:     { label: 'No conformidad',      classes: 'bg-red-500/10 text-red-700 border-red-500/20' },
  observacion:        { label: 'Observación',          classes: 'bg-amber-500/10 text-amber-700 border-amber-500/20' },
  oportunidad_mejora: { label: 'Oportunidad de mejora',classes: 'bg-blue-500/10 text-blue-700 border-blue-500/20' },
  fortaleza:          { label: 'Fortaleza',             classes: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' },
}

const COMPLIANCE_CONFIG: Record<ChecklistCompliance, { label: string; classes: string }> = {
  cumple:    { label: 'Cumple',    classes: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' },
  no_cumple: { label: 'No cumple', classes: 'bg-red-500/10 text-red-700 border-red-500/20' },
  parcial:   { label: 'Parcial',   classes: 'bg-amber-500/10 text-amber-700 border-amber-500/20' },
  no_aplica: { label: 'No aplica', classes: 'bg-[hsl(var(--muted-foreground))]/10 text-[hsl(var(--muted-foreground))] border-[hsl(var(--border))]' },
  pendiente: { label: 'Pendiente', classes: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
}

const base = 'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium'

export function AuditStatusBadge({ status }: { status: AuditStatus }) {
  const cfg = STATUS_CONFIG[status]
  return <span className={cn(base, cfg.classes)}>{cfg.label}</span>
}

export function AuditTypeBadge({ type }: { type: AuditType }) {
  const cfg = TYPE_CONFIG[type]
  return <span className={cn(base, cfg.classes)}>{cfg.label}</span>
}

export function SeverityBadge({ severity }: { severity: FindingSeverity }) {
  const cfg = SEVERITY_CONFIG[severity]
  return (
    <span className={cn(base, cfg.classes)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', cfg.dot)} />
      {cfg.label}
    </span>
  )
}

export function ClassificationBadge({ classification }: { classification: FindingClassification }) {
  const cfg = CLASSIFICATION_CONFIG[classification]
  return <span className={cn(base, cfg.classes)}>{cfg.label}</span>
}

export function ComplianceBadge({ compliance }: { compliance: ChecklistCompliance }) {
  const cfg = COMPLIANCE_CONFIG[compliance]
  return <span className={cn(base, cfg.classes)}>{cfg.label}</span>
}

export function IsoStandardBadge({ standard }: { standard: string }) {
  const labels: Record<string, string> = {
    iso_9001: 'ISO 9001',
    iso_14001: 'ISO 14001',
    iso_45001: 'ISO 45001',
  }
  return (
    <span className={cn(base, 'bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] border-[hsl(var(--primary))]/20')}>
      {labels[standard] ?? standard}
    </span>
  )
}
