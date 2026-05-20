'use client'

import { useState } from 'react'
import { Plus, Loader2, AlertTriangle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { SeverityBadge, ClassificationBadge } from './audit-status-badge'
import { useAuditFindings, useCreateFinding } from '../hooks/use-audits'
import { formatDate } from '@/lib/utils'
import type { FindingClassification, FindingSeverity, FindingStatus } from '@/types/audits'

const CLASSIFICATIONS: { value: FindingClassification; label: string }[] = [
  { value: 'no_conformidad',     label: 'No conformidad' },
  { value: 'observacion',        label: 'Observación' },
  { value: 'oportunidad_mejora', label: 'Oportunidad de mejora' },
  { value: 'fortaleza',          label: 'Fortaleza' },
]

const SEVERITIES: { value: FindingSeverity; label: string }[] = [
  { value: 'baja',   label: 'Baja' },
  { value: 'media',  label: 'Media' },
  { value: 'alta',   label: 'Alta' },
  { value: 'critica',label: 'Crítica' },
]

const STATUS_LABELS: Record<FindingStatus, string> = {
  abierto:        'Abierto',
  en_seguimiento: 'En seguimiento',
  cerrado:        'Cerrado',
}

const schema = z.object({
  title: z.string().min(2, 'Mínimo 2 caracteres').max(500),
  description: z.string().min(5, 'Descripción requerida'),
  classification: z.enum(['no_conformidad', 'observacion', 'oportunidad_mejora', 'fortaleza'] as const),
  severity: z.enum(['baja', 'media', 'alta', 'critica'] as const),
  requirement_reference: z.string().optional(),
  process_area: z.string().optional(),
  due_date: z.string().optional(),
  root_cause: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface FindingsPanelProps {
  auditId: string
  canCreate: boolean
}

export function FindingsPanel({ auditId, canCreate }: FindingsPanelProps) {
  const { data: findings, isLoading } = useAuditFindings(auditId)
  const { mutateAsync, isPending } = useCreateFinding()
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { classification: 'no_conformidad', severity: 'media' },
  })

  const onSubmit = async (values: FormValues) => {
    setError(null)
    try {
      await mutateAsync({ auditId, data: values })
      reset()
      setShowForm(false)
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Error al crear el hallazgo')
    }
  }

  if (isLoading) {
    return <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}</div>
  }

  return (
    <div className="space-y-4">
      {canCreate && (
        <div className="flex justify-end">
          <Button size="sm" onClick={() => setShowForm((s) => !s)} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            Nuevo hallazgo
          </Button>
        </div>
      )}

      {showForm && (
        <div className="rounded-xl border border-[hsl(var(--border))] p-5 space-y-4 bg-[hsl(var(--card))]">
          <h4 className="text-sm font-semibold">Registrar hallazgo</h4>
          {error && (
            <div className="rounded-md bg-[hsl(var(--destructive))]/10 p-3 text-xs text-[hsl(var(--destructive))]">{error}</div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Classification */}
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Clasificación *</Label>
              <div className="flex flex-wrap gap-2">
                {CLASSIFICATIONS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setValue('classification', c.value)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                      watch('classification') === c.value
                        ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]'
                        : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]/40'
                    }`}
                  >{c.label}</button>
                ))}
              </div>
            </div>

            {/* Severity */}
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Severidad *</Label>
              <div className="flex flex-wrap gap-2">
                {SEVERITIES.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setValue('severity', s.value)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                      watch('severity') === s.value
                        ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]'
                        : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]/40'
                    }`}
                  >{s.label}</button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="f-title">Título *</Label>
              <Input id="f-title" placeholder="Describe el hallazgo brevemente..." {...register('title')} />
              {errors.title && <p className="text-xs text-[hsl(var(--destructive))]">{errors.title.message}</p>}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="f-desc">Descripción *</Label>
              <textarea
                id="f-desc"
                rows={3}
                placeholder="Descripción detallada del hallazgo..."
                className="flex w-full rounded-md border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm placeholder:text-[hsl(var(--muted-foreground))] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[hsl(var(--ring))] resize-none"
                {...register('description')}
              />
              {errors.description && <p className="text-xs text-[hsl(var(--destructive))]">{errors.description.message}</p>}
            </div>

            {/* Reference + Process area + Due date */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="f-ref">Referencia norma</Label>
                <Input id="f-ref" placeholder="ISO 9001 §8.1" {...register('requirement_reference')} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="f-area">Área de proceso</Label>
                <Input id="f-area" placeholder="Producción..." {...register('process_area')} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="f-due">Fecha límite</Label>
                <Input id="f-due" type="date" {...register('due_date')} />
              </div>
            </div>

            {/* Root cause */}
            <div className="space-y-1.5">
              <Label htmlFor="f-root">Causa raíz (opcional)</Label>
              <textarea
                id="f-root"
                rows={2}
                placeholder="Análisis de causa raíz..."
                className="flex w-full rounded-md border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm placeholder:text-[hsl(var(--muted-foreground))] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[hsl(var(--ring))] resize-none"
                {...register('root_cause')}
              />
            </div>

            <div className="flex gap-2 justify-end pt-1 border-t border-[hsl(var(--border))]">
              <Button type="button" variant="outline" size="sm" onClick={() => { setShowForm(false); reset() }}>
                Cancelar
              </Button>
              <Button type="submit" size="sm" disabled={isPending}>
                {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Registrar hallazgo
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Findings list */}
      {!findings?.length ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[hsl(var(--border))] py-12 text-center">
          <AlertTriangle className="h-8 w-8 text-[hsl(var(--muted-foreground))]" />
          <p className="mt-3 text-sm font-medium">Sin hallazgos registrados</p>
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
            Los hallazgos aparecerán aquí una vez registrados o generados por IA
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {findings.map((finding) => (
            <div
              key={finding.id}
              className={`rounded-xl border p-4 space-y-2 ${
                finding.severity === 'critica' ? 'border-l-4 border-l-red-500 border-red-500/20 bg-red-500/5' :
                finding.severity === 'alta' ? 'border-l-4 border-l-orange-500 border-orange-500/10' :
                'border-[hsl(var(--border))]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {finding.code && (
                    <span className="font-mono text-xs font-semibold text-[hsl(var(--muted-foreground))]">
                      {finding.code}
                    </span>
                  )}
                  <SeverityBadge severity={finding.severity} />
                  <ClassificationBadge classification={finding.classification} />
                </div>
                <span className="flex-shrink-0 rounded-full border border-[hsl(var(--border))] px-2 py-0.5 text-[10px] text-[hsl(var(--muted-foreground))]">
                  {STATUS_LABELS[finding.status]}
                </span>
              </div>

              <p className="text-sm font-medium">{finding.title}</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))] line-clamp-2">{finding.description}</p>

              <div className="flex items-center gap-4 text-xs text-[hsl(var(--muted-foreground))]">
                {finding.requirement_reference && <span>Ref: {finding.requirement_reference}</span>}
                {finding.process_area && <span>{finding.process_area}</span>}
                {finding.due_date && <span>Límite: {formatDate(finding.due_date)}</span>}
                <span>{formatDate(finding.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
