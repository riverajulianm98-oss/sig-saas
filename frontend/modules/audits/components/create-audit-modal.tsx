'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Plus, Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCreateAudit, useCreateAuditFromTemplate, useAuditTemplates } from '../hooks/use-audits'
import type { AuditType, IsoStandard } from '@/types/audits'

const AUDIT_TYPES: { value: AuditType; label: string }[] = [
  { value: 'interna',        label: 'Interna' },
  { value: 'externa',        label: 'Externa' },
  { value: 'seguimiento',    label: 'Seguimiento' },
  { value: 'certificacion',  label: 'Certificación' },
  { value: 'extraordinaria', label: 'Extraordinaria' },
]

const ISO_STANDARDS: { value: IsoStandard; label: string }[] = [
  { value: 'iso_9001',  label: 'ISO 9001' },
  { value: 'iso_14001', label: 'ISO 14001' },
  { value: 'iso_45001', label: 'ISO 45001' },
]

const schema = z.object({
  code: z.string().min(2, 'Mínimo 2 caracteres').max(50),
  title: z.string().min(2, 'Mínimo 2 caracteres').max(500),
  audit_type: z.enum(['interna', 'externa', 'seguimiento', 'certificacion', 'extraordinaria'] as const),
  template_id: z.string().optional(),
  description: z.string().optional(),
  process_area: z.string().optional(),
  planned_start_date: z.string().optional(),
  planned_end_date: z.string().optional(),
  location: z.string().optional(),
  objectives: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface CreateAuditModalProps {
  onClose: () => void
  onSuccess?: (auditId: string) => void
}

export function CreateAuditModal({ onClose, onSuccess }: CreateAuditModalProps) {
  const [mode, setMode] = useState<'manual' | 'template'>('template')
  const [selectedIso, setSelectedIso] = useState<IsoStandard[]>([])
  const [apiError, setApiError] = useState<string | null>(null)

  const { mutateAsync: createManual, isPending: pendingManual } = useCreateAudit()
  const { mutateAsync: createFromTemplate, isPending: pendingTemplate } = useCreateAuditFromTemplate()
  const { data: templates } = useAuditTemplates()

  const isPending = pendingManual || pendingTemplate

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { audit_type: 'interna' },
  })

  const toggleIso = (std: IsoStandard) => {
    setSelectedIso((prev) =>
      prev.includes(std) ? prev.filter((s) => s !== std) : [...prev, std]
    )
  }

  const onSubmit = async (values: FormValues) => {
    setApiError(null)
    if (mode === 'template' && !values.template_id) {
      setError('template_id', { message: 'Selecciona un template' })
      return
    }
    try {
      let audit
      if (mode === 'template' && values.template_id) {
        audit = await createFromTemplate({
          template_id: values.template_id,
          code: values.code,
          title: values.title,
          audit_type: values.audit_type,
          process_area: values.process_area || undefined,
          planned_start_date: values.planned_start_date || undefined,
          planned_end_date: values.planned_end_date || undefined,
        })
      } else {
        audit = await createManual({
          code: values.code,
          title: values.title,
          audit_type: values.audit_type,
          description: values.description || undefined,
          process_area: values.process_area || undefined,
          planned_start_date: values.planned_start_date || undefined,
          planned_end_date: values.planned_end_date || undefined,
          location: values.location || undefined,
          objectives: values.objectives || undefined,
          iso_standards: selectedIso.length ? selectedIso : undefined,
        })
      }
      onSuccess?.(audit.id)
      onClose()
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setApiError(typeof detail === 'string' ? detail : 'Error al crear la auditoría')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[hsl(var(--border))] px-6 py-4">
          <div>
            <h2 className="text-base font-semibold">Nueva auditoría</h2>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              Crea una auditoría ISO con checklist automático o manual
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 hover:bg-[hsl(var(--accent))] text-[hsl(var(--muted-foreground))]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          {apiError && (
            <div className="rounded-md bg-[hsl(var(--destructive))]/10 p-3 text-sm text-[hsl(var(--destructive))]">
              {apiError}
            </div>
          )}

          {/* Mode toggle */}
          <div className="flex gap-2 rounded-xl border border-[hsl(var(--border))] p-1 bg-[hsl(var(--muted))]/30">
            <button
              type="button"
              onClick={() => setMode('template')}
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-all ${
                mode === 'template'
                  ? 'bg-[hsl(var(--card))] shadow text-[hsl(var(--foreground))]'
                  : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Desde template ISO
            </button>
            <button
              type="button"
              onClick={() => setMode('manual')}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
                mode === 'manual'
                  ? 'bg-[hsl(var(--card))] shadow text-[hsl(var(--foreground))]'
                  : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
              }`}
            >
              Manual
            </button>
          </div>

          {/* Template selector */}
          {mode === 'template' && (
            <div className="space-y-2">
              <Label className="text-xs font-medium uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                Template ISO *
              </Label>
              {templates?.items.length ? (
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                  {templates.items.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setValue('template_id', t.id)}
                      className={`rounded-lg border p-3 text-left text-xs transition-all ${
                        watch('template_id') === t.id
                          ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10'
                          : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]/40'
                      }`}
                    >
                      <div className="font-medium text-sm">{t.name}</div>
                      <div className="text-[hsl(var(--muted-foreground))] mt-0.5">
                        {t.iso_standard.toUpperCase().replace('_', ' ')} · {t.question_count} preguntas
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-[hsl(var(--border))] p-4 text-center text-xs text-[hsl(var(--muted-foreground))]">
                  No hay templates disponibles. Se creará checklist vacío.
                </div>
              )}
              {errors.template_id && (
                <p className="text-xs text-[hsl(var(--destructive))]">{errors.template_id.message}</p>
              )}
            </div>
          )}

          {/* Audit type */}
          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
              Tipo de auditoría *
            </Label>
            <div className="flex flex-wrap gap-2">
              {AUDIT_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setValue('audit_type', t.value)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                    watch('audit_type') === t.value
                      ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]'
                      : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]/40'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Code + Title */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="code">Código *</Label>
              <Input id="code" placeholder="AUD-2025-001" {...register('code')} />
              {errors.code && <p className="text-xs text-[hsl(var(--destructive))]">{errors.code.message}</p>}
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="title">Título *</Label>
              <Input id="title" placeholder="Auditoría interna ISO 9001 – Q2 2025" {...register('title')} />
              {errors.title && <p className="text-xs text-[hsl(var(--destructive))]">{errors.title.message}</p>}
            </div>
          </div>

          {/* Process area + Location */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="process_area">Área de proceso</Label>
              <Input id="process_area" placeholder="Calidad, Producción..." {...register('process_area')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="location">Ubicación</Label>
              <Input id="location" placeholder="Planta principal..." {...register('location')} />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="planned_start_date">Fecha inicio planeada</Label>
              <Input id="planned_start_date" type="date" {...register('planned_start_date')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="planned_end_date">Fecha fin planeada</Label>
              <Input id="planned_end_date" type="date" {...register('planned_end_date')} />
            </div>
          </div>

          {/* ISO standards (manual mode) */}
          {mode === 'manual' && (
            <div className="space-y-2">
              <Label className="text-xs font-medium uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                Normas ISO
              </Label>
              <div className="flex gap-2">
                {ISO_STANDARDS.map((std) => (
                  <button
                    key={std.value}
                    type="button"
                    onClick={() => toggleIso(std.value)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                      selectedIso.includes(std.value)
                        ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]'
                        : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]/40'
                    }`}
                  >
                    {std.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Objectives */}
          {mode === 'manual' && (
            <div className="space-y-1.5">
              <Label htmlFor="objectives">Objetivos</Label>
              <textarea
                id="objectives"
                rows={2}
                placeholder="Objetivos de la auditoría..."
                className="flex w-full rounded-md border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm placeholder:text-[hsl(var(--muted-foreground))] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[hsl(var(--ring))] resize-none"
                {...register('objectives')}
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-[hsl(var(--border))]">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isPending ? 'Creando...' : 'Crear auditoría'}
              {!isPending && <Plus className="h-4 w-4" />}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
