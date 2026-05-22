'use client'

import { useState } from 'react'
import Link from 'next/link'
import { RefreshCw, LayoutGrid } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CapaDashboardWidgets } from '../components/capa-dashboard'
import { CapaFlow } from '../components/capa-flow'
import { useCapaDashboard, useAllCapaActions } from '../hooks/use-findings'
import type { CapaStatus } from '@/types/findings'

const STATUS_FILTER_OPTIONS: { value: CapaStatus | ''; label: string }[] = [
  { value: '',            label: 'Todas' },
  { value: 'pendiente',   label: 'Pendiente' },
  { value: 'en_progreso', label: 'En progreso' },
  { value: 'validacion',  label: 'Validación' },
  { value: 'cerrada',     label: 'Cerrada' },
]

export function CapaDashboardView() {
  const [statusFilter, setStatusFilter] = useState<CapaStatus | ''>('')

  const { data: dashboard, isLoading: dashLoading, refetch } = useCapaDashboard()
  const { data: actionsData, isLoading: actionsLoading, isFetching } = useAllCapaActions(
    statusFilter ? { status: statusFilter } : undefined
  )

  const allActions = actionsData?.items ?? []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">CAPA</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">
            Acciones Correctivas, Preventivas y de Mejora · {actionsData?.total ?? '—'} acciones
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
          <Link href="/findings">
            <Button variant="outline" size="sm" className="gap-1.5">
              <LayoutGrid className="h-4 w-4" />
              Ver hallazgos
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI dashboard */}
      <CapaDashboardWidgets data={dashboard} isLoading={dashLoading} />

      {/* All CAPA board */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-base font-semibold">Tablero CAPA</h2>

          {/* Status quick filter */}
          <div className="flex items-center gap-1.5">
            {STATUS_FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                  statusFilter === opt.value
                    ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]'
                    : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--primary))]/40'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <CapaFlow
          actions={allActions}
          findingId="__all__"
          isLoading={actionsLoading}
          showFindingLinks={true}
        />
      </div>

      {/* Quick stats note */}
      <p className="text-xs text-[hsl(var(--muted-foreground))] text-center">
        Haz clic en "↗ HLL-xxx" en cada tarjeta para ir al hallazgo correspondiente ·
        Usa el botón "→" para avanzar el estado de cada acción
      </p>
    </div>
  )
}
