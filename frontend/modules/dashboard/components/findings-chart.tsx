'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface FindingsChartProps {
  data: Record<string, number>
  loading?: boolean
}

const SEVERITY_CONFIG: Record<string, { label: string; color: string }> = {
  critica: { label: 'Crítica', color: 'bg-red-500' },
  mayor: { label: 'Mayor', color: 'bg-orange-500' },
  menor: { label: 'Menor', color: 'bg-amber-400' },
  observacion: { label: 'Observación', color: 'bg-blue-400' },
}

export function FindingsChart({ data, loading }: FindingsChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-4 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-6 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  const total = Object.values(data).reduce((a, b) => a + b, 0)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
          Hallazgos por Severidad
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {total === 0 ? (
          <p className="text-sm text-[hsl(var(--muted-foreground))] text-center py-4">
            Sin hallazgos registrados
          </p>
        ) : (
          Object.entries(data).map(([key, count]) => {
            const cfg = SEVERITY_CONFIG[key] ?? { label: key, color: 'bg-gray-400' }
            const pct = total > 0 ? Math.round((count / total) * 100) : 0

            return (
              <div key={key} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className={cn('h-2 w-2 rounded-full', cfg.color)} />
                    {cfg.label}
                  </span>
                  <span className="font-medium">{count}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-[hsl(var(--muted))]">
                  <div
                    className={cn('h-1.5 rounded-full transition-all duration-500', cfg.color)}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
