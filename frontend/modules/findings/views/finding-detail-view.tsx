'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, ExternalLink, AlertTriangle, Calendar, User, Tag,
  FileText, BookOpen, Paperclip, CheckCircle2, History, Plus,
  Circle, ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  SeverityBadge,
  ClassificationBadge,
  FindingStatusBadge,
  SOURCE_CONFIG,
  CAPA_STATUS_CONFIG,
} from '../components/finding-severity-badge'
import { CapaFlow } from '../components/capa-flow'
import { CapaForm } from '../components/capa-form'
import { FindingTimeline } from '../components/finding-timeline'
import { useFinding, useFindingTimeline, useFindingActions, useUpdateFinding } from '../hooks/use-findings'
import { formatDate } from '@/lib/utils'
import type { CapaStatus } from '@/types/findings'

const ROOT_CAUSE_CATEGORIES = [
  { value: 'proceso',  label: 'Proceso',   emoji: '⚙️' },
  { value: 'persona',  label: 'Persona',   emoji: '👤' },
  { value: 'equipo',   label: 'Equipo',    emoji: '🔧' },
  { value: 'material', label: 'Material',  emoji: '📦' },
  { value: 'ambiente', label: 'Ambiente',  emoji: '🌿' },
  { value: 'medicion', label: 'Medición',  emoji: '📏' },
]

const TABS = [
  { id: 'resumen',    label: 'Resumen',     icon: BookOpen },
  { id: 'causa',      label: 'Causa raíz',  icon: AlertTriangle },
  { id: 'evidencias', label: 'Evidencias',  icon: Paperclip },
  { id: 'acciones',   label: 'Acciones',    icon: CheckCircle2 },
  { id: 'historial',  label: 'Historial',   icon: History },
]

// Mini CAPA status pipeline at the top of the finding detail
function CapaPipeline({ actions }: { actions: { status: CapaStatus }[] }) {
  const steps: CapaStatus[] = ['pendiente', 'en_progreso', 'validacion', 'cerrada']
  const counts = steps.reduce((acc, s) => ({ ...acc, [s]: actions.filter((a) => a.status === s).length }), {} as Record<CapaStatus, number>)
  const maxStep = actions.length > 0
    ? Math.max(...actions.map((a) => CAPA_STATUS_CONFIG[a.status]?.step ?? 0))
    : 0

  return (
    <div className="flex items-center gap-1">
      {steps.map((s, i) => {
        const cfg = CAPA_STATUS_CONFIG[s]
        const active = maxStep >= cfg.step && actions.length > 0
        return (
          <div key={s} className="flex items-center gap-1">
            {i > 0 && <ArrowRight className={`h-3 w-3 ${active ? 'text-[hsl(var(--primary))]' : 'text-[hsl(var(--muted-foreground))]'}`} />}
            <div className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${active ? cfg.className : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]'}`}>
              {cfg.label}
              {counts[s] > 0 && <span className="font-bold">({counts[s]})</span>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

interface FindingDetailViewProps {
  id: string
}

export function FindingDetailView({ id }: FindingDetailViewProps) {
  const router = useRouter()
  const [tab, setTab] = useState('resumen')
  const [showCapaForm, setShowCapaForm] = useState(false)

  const { data: finding, isLoading } = useFinding(id)
  const { data: timeline, isLoading: tlLoading } = useFindingTimeline(id)
  const { data: actions, isLoading: actionsLoading } = useFindingActions(id)
  const { mutateAsync: update } = useUpdateFinding(id)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-36 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    )
  }

  if (!finding) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertTriangle className="h-10 w-10 text-[hsl(var(--muted-foreground))]" />
        <p className="mt-3 text-sm font-medium">Hallazgo no encontrado</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => router.push('/findings')}>
          Volver a hallazgos
        </Button>
      </div>
    )
  }

  const isOverdue = finding.due_date && new Date(finding.due_date) < new Date() && finding.status !== 'cerrado'
  const allActions = actions ?? []

  return (
    <div className="space-y-5">
      {/* Back navigation */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" className="gap-1.5 -ml-2" onClick={() => router.push('/findings')}>
          <ArrowLeft className="h-4 w-4" />
          Hallazgos
        </Button>
        {finding.audit_id && (
          <>
            <span className="text-[hsl(var(--muted-foreground))]">/</span>
            <Link
              href={`/audits/${finding.audit_id}`}
              className="text-sm text-[hsl(var(--primary))] hover:underline flex items-center gap-1"
            >
              {finding.audit_code ?? 'Auditoría'}
              <ExternalLink className="h-3 w-3" />
            </Link>
          </>
        )}
      </div>

      {/* Header card */}
      <div className={`rounded-xl border bg-[hsl(var(--card))] p-5 space-y-3 ${
        finding.severity === 'critica' ? 'border-l-4 border-l-red-500' :
        finding.severity === 'alta' ? 'border-l-4 border-l-orange-500' : 'border-[hsl(var(--border))]'
      }`}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {finding.code && (
              <span className="font-mono text-xs font-bold text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted))]/40 px-2 py-0.5 rounded">
                {finding.code}
              </span>
            )}
            <SeverityBadge severity={finding.severity} />
            <ClassificationBadge classification={finding.classification} />
            <FindingStatusBadge status={finding.status} />
            {finding.is_recurrent && (
              <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-2 py-0.5 text-[10px] font-semibold text-orange-700 dark:text-orange-400">
                ⚠ Reincidente
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {finding.status === 'abierto' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => update({ status: 'en_seguimiento' })}
              >
                Iniciar seguimiento
              </Button>
            )}
            {finding.status === 'en_seguimiento' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => update({ status: 'cerrado' })}
              >
                Marcar cerrado
              </Button>
            )}
          </div>
        </div>

        <h1 className="text-xl font-bold leading-tight">{finding.title}</h1>

        {/* Meta row */}
        <div className="flex flex-wrap gap-4 text-sm text-[hsl(var(--muted-foreground))]">
          {finding.process_area && (
            <span className="flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5" />
              {finding.process_area}
            </span>
          )}
          {finding.source && (
            <span className="flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              {SOURCE_CONFIG[finding.source]?.label}
            </span>
          )}
          {finding.responsible_name && (
            <span className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              {finding.responsible_name}
            </span>
          )}
          {finding.due_date && (
            <span className={`flex items-center gap-1.5 font-medium ${isOverdue ? 'text-red-600 dark:text-red-400' : ''}`}>
              <Calendar className="h-3.5 w-3.5" />
              {isOverdue ? '⚠ Vencido: ' : 'Límite: '}{formatDate(finding.due_date)}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            Registrado: {formatDate(finding.created_at)}
          </span>
        </div>

        {/* CAPA pipeline */}
        {allActions.length > 0 && (
          <div className="pt-1">
            <p className="text-[11px] font-medium text-[hsl(var(--muted-foreground))] mb-1.5 uppercase tracking-wider">Flujo CAPA</p>
            <CapaPipeline actions={allActions} />
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-[hsl(var(--border))]">
        <div className="flex gap-1 -mb-px overflow-x-auto">
          {TABS.map((t) => {
            const Icon = t.icon
            const isActions = t.id === 'acciones'
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${
                  tab === t.id
                    ? 'border-[hsl(var(--primary))] text-[hsl(var(--primary))]'
                    : 'border-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {t.label}
                {isActions && allActions.length > 0 && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[hsl(var(--primary))]/10 text-[10px] font-bold text-[hsl(var(--primary))]">
                    {allActions.length}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab content */}
      <div className="min-h-[300px]">
        {/* RESUMEN */}
        {tab === 'resumen' && (
          <div className="grid grid-cols-3 gap-5">
            <div className="col-span-2 space-y-4">
              <section className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
                <h3 className="text-sm font-semibold mb-3">Descripción</h3>
                <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">{finding.description}</p>
              </section>

              {finding.requirement_reference && (
                <section className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
                  <h3 className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-2">Referencia normativa</h3>
                  <p className="text-sm font-mono">{finding.requirement_reference}</p>
                </section>
              )}

              {finding.audit_id && (
                <section className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
                  <h3 className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-2">Origen: Auditoría</h3>
                  <Link
                    href={`/audits/${finding.audit_id}`}
                    className="flex items-center gap-2 text-sm text-[hsl(var(--primary))] hover:underline"
                  >
                    <FileText className="h-4 w-4" />
                    {finding.audit_code} — {finding.audit_title}
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </section>
              )}
            </div>

            <div className="space-y-3">
              <InfoCard label="Clasificación"><ClassificationBadge classification={finding.classification} /></InfoCard>
              <InfoCard label="Severidad"><SeverityBadge severity={finding.severity} /></InfoCard>
              <InfoCard label="Estado"><FindingStatusBadge status={finding.status} /></InfoCard>
              <InfoCard label="Origen">{SOURCE_CONFIG[finding.source]?.label ?? finding.source}</InfoCard>
              <InfoCard label="Área de proceso">{finding.process_area ?? '—'}</InfoCard>
              <InfoCard label="Responsable">{finding.responsible_name ?? 'Sin asignar'}</InfoCard>
              <InfoCard label="Fecha límite">
                <span className={isOverdue ? 'text-red-600 dark:text-red-400 font-semibold' : ''}>
                  {finding.due_date ? formatDate(finding.due_date) : '—'}
                </span>
              </InfoCard>
              <InfoCard label="Acciones CAPA">
                <span>{allActions.length} total · {finding.open_actions_count} abiertas</span>
              </InfoCard>
            </div>
          </div>
        )}

        {/* CAUSA RAÍZ */}
        {tab === 'causa' && (
          <div className="space-y-5">
            <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 space-y-4">
              <h3 className="text-sm font-semibold">Categoría de causa raíz (6M)</h3>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                {ROOT_CAUSE_CATEGORIES.map((cat) => (
                  <div
                    key={cat.value}
                    className={`rounded-lg border p-3 text-center transition-all ${
                      finding.root_cause_category === cat.value
                        ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10'
                        : 'border-[hsl(var(--border))] opacity-50'
                    }`}
                  >
                    <div className="text-xl">{cat.emoji}</div>
                    <p className="text-xs font-medium mt-1">{cat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
              <h3 className="text-sm font-semibold mb-3">Análisis de causa raíz</h3>
              {finding.root_cause ? (
                <p className="text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">{finding.root_cause}</p>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <AlertTriangle className="h-8 w-8 text-[hsl(var(--muted-foreground))]" />
                  <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">No se ha registrado causa raíz</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                    Identifica la causa raíz usando la metodología 5 Por Qués o diagrama de Ishikawa
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* EVIDENCIAS */}
        {tab === 'evidencias' && (
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">Evidencias</h3>
              <Button size="sm" variant="outline" className="gap-1.5" disabled>
                <Plus className="h-3.5 w-3.5" />
                Agregar evidencia
              </Button>
            </div>
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Paperclip className="h-8 w-8 text-[hsl(var(--muted-foreground))]" />
              <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">Sin evidencias adjuntas</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                Puedes agregar archivos, URLs o referencias a documentos del sistema
              </p>
            </div>
          </div>
        )}

        {/* ACCIONES CAPA */}
        {tab === 'acciones' && (
          <div className="space-y-4">
            {showCapaForm ? (
              <CapaForm
                findingId={id}
                onClose={() => setShowCapaForm(false)}
              />
            ) : (
              <div className="flex justify-end">
                <Button size="sm" className="gap-1.5" onClick={() => setShowCapaForm(true)}>
                  <Plus className="h-3.5 w-3.5" />
                  Nueva acción CAPA
                </Button>
              </div>
            )}

            {actionsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
              </div>
            ) : allActions.length === 0 && !showCapaForm ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[hsl(var(--border))] py-12 text-center">
                <CheckCircle2 className="h-8 w-8 text-[hsl(var(--muted-foreground))]" />
                <p className="mt-3 text-sm font-medium">Sin acciones CAPA creadas</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                  Crea una acción correctiva, preventiva o de mejora para abordar este hallazgo
                </p>
              </div>
            ) : (
              <CapaFlow
                actions={allActions}
                findingId={id}
                isLoading={actionsLoading}
                onAddAction={() => setShowCapaForm(true)}
              />
            )}
          </div>
        )}

        {/* HISTORIAL */}
        {tab === 'historial' && (
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
            <h3 className="text-sm font-semibold mb-4">Historial de cambios</h3>
            <FindingTimeline entries={timeline ?? []} isLoading={tlLoading} />
          </div>
        )}
      </div>
    </div>
  )
}

function InfoCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-1">{label}</p>
      <div className="text-sm">{children}</div>
    </div>
  )
}
