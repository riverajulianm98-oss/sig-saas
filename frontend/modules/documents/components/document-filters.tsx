'use client'

import { useState } from 'react'
import { X, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import type { DocumentSearchParams, DocumentStatus, DocumentType } from '@/types/documents'

const STATUSES: { value: DocumentStatus; label: string }[] = [
  { value: 'borrador', label: 'Borrador' },
  { value: 'revision', label: 'En revisión' },
  { value: 'aprobado', label: 'Aprobado' },
  { value: 'obsoleto', label: 'Obsoleto' },
]

const TYPES: { value: DocumentType; label: string }[] = [
  { value: 'procedimiento', label: 'Procedimiento' },
  { value: 'formato', label: 'Formato' },
  { value: 'instructivo', label: 'Instructivo' },
  { value: 'politica', label: 'Política' },
  { value: 'manual', label: 'Manual' },
  { value: 'evidencia', label: 'Evidencia' },
]

interface DocumentFiltersProps {
  filters: DocumentSearchParams
  onChange: (filters: DocumentSearchParams) => void
  onReset: () => void
  activeCount: number
}

export function DocumentFilters({ filters, onChange, onReset, activeCount }: DocumentFiltersProps) {
  const [open, setOpen] = useState(false)

  const toggle = (key: keyof DocumentSearchParams, value: string | undefined) => {
    onChange({ ...filters, [key]: filters[key] === value ? undefined : value, skip: 0 })
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(!open)}
        className="gap-2"
      >
        <SlidersHorizontal className="h-3.5 w-3.5" />
        Filtros
        {activeCount > 0 && (
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-[10px] font-semibold text-[hsl(var(--primary-foreground))]">
            {activeCount}
          </span>
        )}
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-10 z-20 w-80 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--popover))] p-4 shadow-lg">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold">Filtros avanzados</span>
              <div className="flex items-center gap-2">
                {activeCount > 0 && (
                  <button
                    onClick={onReset}
                    className="text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                  >
                    Limpiar
                  </button>
                )}
                <button onClick={() => setOpen(false)}>
                  <X className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                </button>
              </div>
            </div>

            <Separator className="mb-4" />

            {/* Estado */}
            <div className="mb-4 space-y-2">
              <Label className="text-xs font-medium uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                Estado
              </Label>
              <div className="flex flex-wrap gap-1.5">
                {STATUSES.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => toggle('status', s.value)}
                    className={cn(
                      'rounded-full border px-2.5 py-0.5 text-xs transition-colors',
                      filters.status === s.value
                        ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]'
                        : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]/50'
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tipo */}
            <div className="mb-4 space-y-2">
              <Label className="text-xs font-medium uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                Tipo documental
              </Label>
              <div className="flex flex-wrap gap-1.5">
                {TYPES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => toggle('type', t.value)}
                    className={cn(
                      'rounded-full border px-2.5 py-0.5 text-xs transition-colors',
                      filters.type === t.value
                        ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]'
                        : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]/50'
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Proceso */}
            <div className="mb-4 space-y-2">
              <Label className="text-xs font-medium uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                Área de proceso
              </Label>
              <Input
                placeholder="Ej. Calidad, HSEQ..."
                value={filters.process_area ?? ''}
                onChange={(e) =>
                  onChange({ ...filters, process_area: e.target.value || undefined, skip: 0 })
                }
                className="h-8 text-sm"
              />
            </div>

            {/* Vencimiento */}
            <div className="mb-4 space-y-2">
              <Label className="text-xs font-medium uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                Vencimiento
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[10px] text-[hsl(var(--muted-foreground))]">Desde</Label>
                  <Input
                    type="date"
                    value={filters.expires_from?.slice(0, 10) ?? ''}
                    onChange={(e) =>
                      onChange({ ...filters, expires_from: e.target.value || undefined, skip: 0 })
                    }
                    className="h-8 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-[10px] text-[hsl(var(--muted-foreground))]">Hasta</Label>
                  <Input
                    type="date"
                    value={filters.expires_to?.slice(0, 10) ?? ''}
                    onChange={(e) =>
                      onChange({ ...filters, expires_to: e.target.value || undefined, skip: 0 })
                    }
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label className="text-xs font-medium uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                Tags (separados por coma)
              </Label>
              <Input
                placeholder="iso9001, calidad, sgsi..."
                value={filters.tags ?? ''}
                onChange={(e) =>
                  onChange({ ...filters, tags: e.target.value || undefined, skip: 0 })
                }
                className="h-8 text-sm"
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
