'use client'

import { Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import type { FindingSearchParams, FindingClassification, FindingSeverity, FindingStatus, FindingSource } from '@/types/findings'

const CLASSIFICATIONS: { value: FindingClassification; label: string }[] = [
  { value: 'no_conformidad',     label: 'No conformidad' },
  { value: 'observacion',        label: 'Observación' },
  { value: 'oportunidad_mejora', label: 'Oportunidad' },
  { value: 'fortaleza',          label: 'Fortaleza' },
]

const SEVERITIES: { value: FindingSeverity; label: string }[] = [
  { value: 'baja',    label: 'Baja' },
  { value: 'media',   label: 'Media' },
  { value: 'alta',    label: 'Alta' },
  { value: 'critica', label: 'Crítica' },
]

const STATUSES: { value: FindingStatus; label: string }[] = [
  { value: 'abierto',        label: 'Abierto' },
  { value: 'en_seguimiento', label: 'En seguimiento' },
  { value: 'cerrado',        label: 'Cerrado' },
]

const SOURCES: { value: FindingSource; label: string }[] = [
  { value: 'auditoria',        label: 'Auditoría' },
  { value: 'inspeccion',       label: 'Inspección' },
  { value: 'queja',            label: 'Queja cliente' },
  { value: 'revision_directa', label: 'Revisión directa' },
  { value: 'mejora_continua',  label: 'Mejora continua' },
]

const PROCESS_AREAS = [
  'Calidad', 'Producción', 'HSEQ', 'Medio Ambiente', 'Compras',
  'Logística', 'Comercial', 'Recursos Humanos', 'TI', 'Dirección', 'Operaciones',
]

interface FindingFiltersProps {
  filters: FindingSearchParams
  onChange: (f: FindingSearchParams) => void
  onReset: () => void
  activeCount: number
}

export function FindingFilters({ filters, onChange, onReset, activeCount }: FindingFiltersProps) {
  const [open, setOpen] = useState(false)

  const set = (key: keyof FindingSearchParams, val: string | undefined) =>
    onChange({ ...filters, [key]: val, skip: 0 })

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        className="gap-2 h-9"
        onClick={() => setOpen((v) => !v)}
      >
        <Filter className="h-3.5 w-3.5" />
        Filtros
        {activeCount > 0 && (
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-[10px] font-bold text-[hsl(var(--primary-foreground))]">
            {activeCount}
          </span>
        )}
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-10 z-20 w-[520px] rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--popover))] p-4 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Filtros</span>
              <button onClick={onReset} className="text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
                Limpiar todo
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Clasificación */}
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Clasificación</p>
                <div className="flex flex-wrap gap-1.5">
                  {CLASSIFICATIONS.map((c) => (
                    <FilterChip
                      key={c.value}
                      label={c.label}
                      active={filters.classification === c.value}
                      onClick={() => set('classification', filters.classification === c.value ? undefined : c.value)}
                    />
                  ))}
                </div>
              </div>

              {/* Severidad */}
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Severidad</p>
                <div className="flex flex-wrap gap-1.5">
                  {SEVERITIES.map((s) => (
                    <FilterChip
                      key={s.value}
                      label={s.label}
                      active={filters.severity === s.value}
                      onClick={() => set('severity', filters.severity === s.value ? undefined : s.value)}
                    />
                  ))}
                </div>
              </div>

              {/* Estado */}
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Estado</p>
                <div className="flex flex-wrap gap-1.5">
                  {STATUSES.map((s) => (
                    <FilterChip
                      key={s.value}
                      label={s.label}
                      active={filters.status === s.value}
                      onClick={() => set('status', filters.status === s.value ? undefined : s.value)}
                    />
                  ))}
                </div>
              </div>

              {/* Origen */}
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Origen</p>
                <div className="flex flex-wrap gap-1.5">
                  {SOURCES.map((s) => (
                    <FilterChip
                      key={s.value}
                      label={s.label}
                      active={filters.source === s.value}
                      onClick={() => set('source', filters.source === s.value ? undefined : s.value)}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Área */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Área de proceso</p>
              <div className="flex flex-wrap gap-1.5">
                {PROCESS_AREAS.map((a) => (
                  <FilterChip
                    key={a}
                    label={a}
                    active={filters.process_area === a}
                    onClick={() => set('process_area', filters.process_area === a ? undefined : a)}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-end border-t border-[hsl(var(--border))] pt-3">
              <Button size="sm" onClick={() => setOpen(false)}>Aplicar</Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-all ${
        active
          ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]'
          : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]/40 text-[hsl(var(--muted-foreground))]'
      }`}
    >
      {label}
    </button>
  )
}
