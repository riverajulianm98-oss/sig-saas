'use client'

import { useState } from 'react'
import { Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { AuditStatus, AuditType } from '@/types/audits'

const STATUS_OPTIONS: { value: AuditStatus; label: string }[] = [
  { value: 'planeada',   label: 'Planeada' },
  { value: 'en_proceso', label: 'En proceso' },
  { value: 'finalizada', label: 'Finalizada' },
  { value: 'cerrada',    label: 'Cerrada' },
  { value: 'cancelada',  label: 'Cancelada' },
]

const TYPE_OPTIONS: { value: AuditType; label: string }[] = [
  { value: 'interna',        label: 'Interna' },
  { value: 'externa',        label: 'Externa' },
  { value: 'seguimiento',    label: 'Seguimiento' },
  { value: 'certificacion',  label: 'Certificación' },
  { value: 'extraordinaria', label: 'Extraordinaria' },
]

export interface AuditFiltersState {
  status?: AuditStatus
  type?: AuditType
  process_area?: string
}

interface AuditFiltersProps {
  value: AuditFiltersState
  onChange: (filters: AuditFiltersState) => void
  onReset: () => void
}

export function AuditFilters({ value, onChange, onReset }: AuditFiltersProps) {
  const [open, setOpen] = useState(false)
  const activeCount = Object.values(value).filter(Boolean).length

  return (
    <div className="relative">
      <Button variant="outline" size="sm" onClick={() => setOpen((o) => !o)} className="gap-2">
        <Filter className="h-3.5 w-3.5" />
        Filtros
        {activeCount > 0 && (
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-[10px] font-bold text-white">
            {activeCount}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute left-0 top-10 z-30 w-72 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Filtros</span>
            <button onClick={() => setOpen(false)} className="rounded p-0.5 hover:bg-[hsl(var(--accent))]">
              <X className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
            </button>
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Estado</Label>
            <div className="flex flex-wrap gap-1.5">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() =>
                    onChange({ ...value, status: value.status === opt.value ? undefined : opt.value })
                  }
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                    value.status === opt.value
                      ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]'
                      : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]/40 text-[hsl(var(--muted-foreground))]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Tipo</Label>
            <div className="flex flex-wrap gap-1.5">
              {TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() =>
                    onChange({ ...value, type: value.type === opt.value ? undefined : opt.value })
                  }
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                    value.type === opt.value
                      ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]'
                      : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]/40 text-[hsl(var(--muted-foreground))]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Área de proceso</Label>
            <Input
              placeholder="Calidad, HSEQ..."
              value={value.process_area ?? ''}
              onChange={(e) => onChange({ ...value, process_area: e.target.value || undefined })}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-1 border-t border-[hsl(var(--border))]">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { onReset(); setOpen(false) }}
              className="text-[hsl(var(--muted-foreground))]"
            >
              Limpiar
            </Button>
            <Button size="sm" onClick={() => setOpen(false)}>
              Aplicar
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
