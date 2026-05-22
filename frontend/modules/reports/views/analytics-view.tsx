'use client'

import { useState } from 'react'
import { BarChart2, TrendingUp, Shield, Presentation, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ExecutiveKPIs } from '../components/executive-kpis'
import { TrendChart } from '../components/trend-chart'
import { RiskGauge } from '../components/risk-gauge'
import { ProcessHeatmap, ClauseScoresChart } from '../components/process-heatmap'
import { AiInsights } from '../components/ai-insights'
import { ExecutiveMode } from '../components/executive-mode'
import {
  useExecutiveSummary,
  useAnalyticsTrends,
  useProcessHeatmap,
  useClauseScores,
  useAiInsights,
} from '../hooks/use-analytics'

export function AnalyticsView() {
  const [execMode, setExecMode] = useState(false)

  const { data: summary, isLoading: loadingSummary, refetch: refetchSummary } = useExecutiveSummary()
  const { data: trends, isLoading: loadingTrends } = useAnalyticsTrends()
  const { data: heatmap, isLoading: loadingHeatmap } = useProcessHeatmap()
  const { data: clauses, isLoading: loadingClauses } = useClauseScores()
  const { data: insights, isLoading: loadingInsights } = useAiInsights()

  return (
    <>
      {execMode && (
        <ExecutiveMode
          summary={summary}
          trends={trends}
          onClose={() => setExecMode(false)}
        />
      )}

      <div className="space-y-8 max-w-7xl">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--primary))]/10">
                <BarChart2 className="h-4 w-4 text-[hsl(var(--primary))]" />
              </div>
              <h1 className="text-2xl font-black tracking-tight">Centro Ejecutivo</h1>
            </div>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              SIGCYA Consulting S.A.S. · Indicadores del Sistema Integrado de Gestión
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchSummary()}
              className="gap-2"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Actualizar
            </Button>
            <Button
              size="sm"
              onClick={() => setExecMode(true)}
              className="gap-2"
            >
              <Presentation className="h-3.5 w-3.5" />
              Presentación
            </Button>
          </div>
        </div>

        {/* Executive KPIs */}
        <section>
          <ExecutiveKPIs data={summary} isLoading={loadingSummary} />
        </section>

        {/* Trend chart */}
        <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="h-4 w-4 text-[hsl(var(--primary))]" />
            <h2 className="text-sm font-bold">Tendencias — últimos 12 meses</h2>
          </div>
          <TrendChart data={trends} isLoading={loadingTrends} />
        </section>

        {/* Risk gauge + AI insights */}
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
            <div className="flex items-center gap-2 mb-6">
              <Shield className="h-4 w-4 text-[hsl(var(--primary))]" />
              <h2 className="text-sm font-bold">Gauge de riesgo global</h2>
            </div>
            <RiskGauge data={summary} isLoading={loadingSummary} />
          </section>

          <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
            <AiInsights data={insights} isLoading={loadingInsights} />
          </section>
        </div>

        {/* Process heatmap + clause scores */}
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
            <h2 className="text-sm font-bold mb-4">Mapa de calor por proceso</h2>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mb-4">Distribución de hallazgos por severidad y área</p>
            <ProcessHeatmap data={heatmap} isLoading={loadingHeatmap} />
          </section>

          <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
            <h2 className="text-sm font-bold mb-1">Cumplimiento por cláusula ISO</h2>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mb-4">Puntuación por requisito de la norma</p>
            <ClauseScoresChart data={clauses} isLoading={loadingClauses} />
          </section>
        </div>

      </div>
    </>
  )
}
