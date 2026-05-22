'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, RefreshCw, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useFindings, useFindingsDashboard } from '../hooks/use-findings'
import { FindingsTable } from '../components/findings-table'
import { FindingFilters } from '../components/finding-filters'
import {
  SeverityBadge,
  FindingStatusBadge,
} from '../components/finding-severity-badge'
import type { FindingSearchParams } from '@/types/findings'

const DEFAULT_PARAMS: FindingSearchParams = { skip: 0, limit: 20 }

function countActive(p: FindingSearchParams) {
  return [p.classification, p.severity, p.status, p.source, p.process_area, p.audit_id]
    .filter(Boolean).length
}

export function FindingsListView() {
  const [params, setParams] = useState<FindingSearchParams>(DEFAULT_PARAMS)
  const [search, setSearch] = useState('')

  const queryParams: FindingSearchParams = { ...params, search: search || undefined }

  const { data, isLoading, isFetching, refetch } = useFindings(queryParams)
  const { data: dashboard } = useFindingsDashboard()

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    setParams((p) => ({ ...p, skip: 0 }))
  }, [])

  const resetFilters = () => {
    setParams(DEFAULT_PARAMS)
    setSearch('')
  }

  const activeFilters = countActive(params)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Hallazgos</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">
            {data?.total ?? '—'} hallazgos · Gestión de no conformidades y CAPA
          </p>
        </div>
      </div>

      {/* Quick stats */}
      {dashboard && (
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-7">
          {[
            { label: 'Total',           value: dashboard.total,          className: '' },
            { label: 'Abiertos',        value: dashboard.abiertos,       className: 'text-red-600 dark:text-red-400' },
            { label: 'En seguimiento',  value: dashboard.en_seguimiento, className: 'text-yellow-600 dark:text-yellow-400' },
            { label: 'Cerrados',        value: dashboard.cerrados,       className: 'text-green-600 dark:text-green-400' },
            { label: 'Críticos',        value: dashboard.criticos,       className: 'text-red-700 dark:text-red-300 font-bold' },
            { label: 'Vencidos',        value: dashboard.vencidos,       className: 'text-orange-600 dark:text-orange-400' },
            { label: 'Acciones abiertas', value: dashboard.open_actions, className: 'text-blue-600 dark:text-blue-400' },
          ].map((s) => (
            <div key={s.label} className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2.5 text-center">
              <p className={`text-xl font-bold ${s.className}`}>{s.value}</p>
              <p className="text-[10px] text-[hsl(var(--muted-foreground))] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Input
            placeholder="Buscar por código, título..."
            value={search}
            onChange={handleSearch}
            className="h-9 pr-8"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] text-xs"
            >
              ✕
            </button>
          )}
        </div>

        <FindingFilters
          filters={params}
          onChange={setParams}
          onReset={resetFilters}
          activeCount={activeFilters}
        />

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
        </Button>

        {activeFilters > 0 && (
          <Button variant="ghost" size="sm" onClick={resetFilters} className="text-xs h-9">
            Limpiar filtros
          </Button>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-orange-500" />
          Punto naranja = hallazgo reincidente
        </span>
        <span className="mx-2">·</span>
        <span>Borde rojo = severidad crítica · Borde naranja = severidad alta</span>
        <span className="mx-2">·</span>
        <span>Col. CAPA: número azul = acciones abiertas · ✓ verde = todas cerradas</span>
      </div>

      {/* Table */}
      <FindingsTable
        findings={data?.items ?? []}
        total={data?.total ?? 0}
        params={params}
        onParamsChange={setParams}
        isLoading={isLoading}
      />
    </div>
  )
}
