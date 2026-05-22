'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { AiInsight } from '@/types/analytics'

const SEVERITY_RING: Record<string, string> = {
  critica:  'border-l-red-500 bg-red-500/5',
  alta:     'border-l-orange-500 bg-orange-500/5',
  media:    'border-l-yellow-500 bg-yellow-500/5',
  baja:     'border-l-green-500 bg-green-500/5',
  positivo: 'border-l-emerald-500 bg-emerald-500/5',
  mejora:   'border-l-blue-500 bg-blue-500/5',
}

const TYPE_LABEL: Record<string, string> = {
  risk:        'Riesgo detectado',
  trend:       'Tendencia',
  action:      'Acción requerida',
  opportunity: 'Oportunidad',
}

interface AiInsightsProps {
  data: AiInsight[] | undefined
  isLoading: boolean
  compact?: boolean
}

export function AiInsights({ data, isLoading, compact = false }: AiInsightsProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
      </div>
    )
  }

  if (!data?.length) return null

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm">✨</span>
        <h3 className="text-sm font-semibold">Insights IA</h3>
        <span className="rounded-full bg-[hsl(var(--primary))]/10 px-2 py-0.5 text-[10px] font-semibold text-[hsl(var(--primary))]">
          BETA
        </span>
      </div>

      {data.map((insight) => (
        <div
          key={insight.id}
          className={cn(
            'rounded-xl border-l-4 p-3.5 space-y-1.5',
            SEVERITY_RING[insight.severity] ?? 'border-l-[hsl(var(--primary))] bg-[hsl(var(--muted))]/20'
          )}
        >
          <div className="flex items-start gap-2">
            <span className="text-base leading-none mt-0.5">{insight.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                  {TYPE_LABEL[insight.type] ?? insight.type}
                </span>
              </div>
              <p className="text-sm font-semibold leading-snug mt-0.5">{insight.title}</p>
              {!compact && (
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 leading-relaxed">{insight.body}</p>
              )}
            </div>
          </div>
        </div>
      ))}

      <p className="text-[10px] text-[hsl(var(--muted-foreground))] text-right pt-1">
        Generado por análisis de datos del sistema · Última actualización: hace 2 min
      </p>
    </div>
  )
}
