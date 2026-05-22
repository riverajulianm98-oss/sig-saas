'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCreateCapaAction } from '../hooks/use-findings'
import type { CapaActionType } from '@/types/findings'

const ACTION_TYPES: { value: CapaActionType; label: string }[] = [
  { value: 'correctiva',  label: 'Correctiva' },
  { value: 'preventiva',  label: 'Preventiva' },
  { value: 'mejora',      label: 'Mejora' },
]

const DEMO_USERS = [
  { id: 'demo-user-001', name: 'Alejandro Gómez' },
  { id: 'demo-user-002', name: 'María Rodríguez' },
  { id: 'demo-user-003', name: 'Carlos Martínez' },
  { id: 'demo-user-004', name: 'Diana López' },
]

const schema = z.object({
  title:               z.string().min(3, 'Mínimo 3 caracteres'),
  description:         z.string().optional(),
  action_type:         z.enum(['correctiva', 'preventiva', 'mejora'] as const),
  responsible_user_id: z.string().optional(),
  due_date:            z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface CapaFormProps {
  findingId: string
  onClose: () => void
  onSuccess?: () => void
}

export function CapaForm({ findingId, onClose, onSuccess }: CapaFormProps) {
  const [error, setError] = useState<string | null>(null)
  const { mutateAsync, isPending } = useCreateCapaAction(findingId)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { action_type: 'correctiva' },
  })

  const onSubmit = async (values: FormValues) => {
    setError(null)
    try {
      await mutateAsync(values)
      onSuccess?.()
      onClose()
    } catch {
      setError('Error al crear la acción. Inténtalo de nuevo.')
    }
  }

  return (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 space-y-4">
      <h4 className="text-sm font-semibold">Nueva acción correctiva / CAPA</h4>

      {error && (
        <div className="rounded-md bg-[hsl(var(--destructive))]/10 p-3 text-xs text-[hsl(var(--destructive))]">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Tipo */}
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Tipo de acción *</Label>
          <div className="flex gap-2">
            {ACTION_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setValue('action_type', t.value)}
                className={`flex-1 rounded-lg border py-2 text-xs font-medium transition-all ${
                  watch('action_type') === t.value
                    ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]'
                    : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]/40 text-[hsl(var(--muted-foreground))]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Título */}
        <div className="space-y-1.5">
          <Label htmlFor="capa-title">Título *</Label>
          <Input
            id="capa-title"
            placeholder="Describe la acción a implementar..."
            {...register('title')}
          />
          {errors.title && <p className="text-xs text-[hsl(var(--destructive))]">{errors.title.message}</p>}
        </div>

        {/* Descripción */}
        <div className="space-y-1.5">
          <Label htmlFor="capa-desc">Descripción</Label>
          <textarea
            id="capa-desc"
            rows={3}
            placeholder="Detalla el plan de implementación de la acción..."
            className="flex w-full rounded-md border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm placeholder:text-[hsl(var(--muted-foreground))] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[hsl(var(--ring))] resize-none"
            {...register('description')}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Responsable */}
          <div className="space-y-1.5">
            <Label htmlFor="capa-responsible">Responsable</Label>
            <select
              id="capa-responsible"
              className="flex h-9 w-full rounded-md border border-[hsl(var(--border))] bg-transparent px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[hsl(var(--ring))]"
              {...register('responsible_user_id')}
            >
              <option value="">Sin asignar</option>
              {DEMO_USERS.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>

          {/* Fecha compromiso */}
          <div className="space-y-1.5">
            <Label htmlFor="capa-due">Fecha compromiso</Label>
            <Input id="capa-due" type="date" {...register('due_date')} />
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-1 border-t border-[hsl(var(--border))]">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" size="sm" disabled={isPending}>
            {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />}
            Crear acción
          </Button>
        </div>
      </form>
    </div>
  )
}
