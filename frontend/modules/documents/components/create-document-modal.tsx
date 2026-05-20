'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCreateDocument } from '../hooks/use-documents'
import type { DocumentType } from '@/types/documents'

const DOCUMENT_TYPES: { value: DocumentType; label: string }[] = [
  { value: 'procedimiento', label: 'Procedimiento' },
  { value: 'formato', label: 'Formato' },
  { value: 'instructivo', label: 'Instructivo' },
  { value: 'politica', label: 'Política' },
  { value: 'manual', label: 'Manual' },
  { value: 'evidencia', label: 'Evidencia' },
]

const schema = z.object({
  code: z.string().min(2, 'Mínimo 2 caracteres').max(50),
  title: z.string().min(2, 'Mínimo 2 caracteres').max(500),
  document_type: z.enum([
    'procedimiento', 'formato', 'instructivo', 'politica', 'manual', 'evidencia',
  ] as const),
  description: z.string().optional(),
  process_area: z.string().optional(),
  expires_at: z.string().optional(),
  tags_raw: z.string().optional(),
  change_summary: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface CreateDocumentModalProps {
  onClose: () => void
  onSuccess?: (docId: string) => void
}

export function CreateDocumentModal({ onClose, onSuccess }: CreateDocumentModalProps) {
  const { mutateAsync, isPending } = useCreateDocument()
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      document_type: 'procedimiento',
      change_summary: 'Versión inicial',
    },
  })

  const onSubmit = async (values: FormValues) => {
    setError(null)
    try {
      const tags = values.tags_raw
        ? values.tags_raw.split(',').map((t) => t.trim()).filter(Boolean)
        : []
      const doc = await mutateAsync({
        code: values.code,
        title: values.title,
        document_type: values.document_type,
        description: values.description || undefined,
        process_area: values.process_area || undefined,
        expires_at: values.expires_at ? new Date(values.expires_at).toISOString() : undefined,
        tags,
        change_summary: values.change_summary || 'Versión inicial',
      })
      onSuccess?.(doc.id)
      onClose()
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Error al crear el documento')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[hsl(var(--border))] px-6 py-4">
          <div>
            <h2 className="text-base font-semibold">Nuevo documento</h2>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              Crea un documento controlado ISO
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 hover:bg-[hsl(var(--accent))] text-[hsl(var(--muted-foreground))]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {error && (
            <div className="rounded-md bg-[hsl(var(--destructive))]/10 p-3 text-sm text-[hsl(var(--destructive))]">
              {error}
            </div>
          )}

          {/* Type selector */}
          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
              Tipo documental *
            </Label>
            <div className="flex flex-wrap gap-2">
              {DOCUMENT_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setValue('document_type', t.value)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                    watch('document_type') === t.value
                      ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]'
                      : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]/40'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            {errors.document_type && (
              <p className="text-xs text-[hsl(var(--destructive))]">{errors.document_type.message}</p>
            )}
          </div>

          {/* Code + Title row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="code">Código *</Label>
              <Input id="code" placeholder="PRO-001" {...register('code')} />
              {errors.code && (
                <p className="text-xs text-[hsl(var(--destructive))]">{errors.code.message}</p>
              )}
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="title">Título *</Label>
              <Input id="title" placeholder="Nombre del documento" {...register('title')} />
              {errors.title && (
                <p className="text-xs text-[hsl(var(--destructive))]">{errors.title.message}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description">Descripción</Label>
            <textarea
              id="description"
              rows={2}
              placeholder="Describe el propósito del documento..."
              className="flex w-full rounded-md border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm placeholder:text-[hsl(var(--muted-foreground))] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[hsl(var(--ring))] resize-none"
              {...register('description')}
            />
          </div>

          {/* Process area + Expiry */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="process_area">Área de proceso</Label>
              <Input id="process_area" placeholder="Calidad, HSEQ..." {...register('process_area')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="expires_at">Fecha de vencimiento</Label>
              <Input id="expires_at" type="date" {...register('expires_at')} />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <Label htmlFor="tags_raw">Tags (separados por coma)</Label>
            <Input id="tags_raw" placeholder="iso9001, calidad, proceso..." {...register('tags_raw')} />
          </div>

          {/* Change summary */}
          <div className="space-y-1.5">
            <Label htmlFor="change_summary">Resumen del cambio</Label>
            <Input id="change_summary" placeholder="Versión inicial" {...register('change_summary')} />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isPending ? 'Creando...' : 'Crear documento'}
              {!isPending && <Plus className="h-4 w-4" />}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
