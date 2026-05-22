'use client'

import { useEffect } from 'react'
import { X, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ExecutiveKPIs } from './executive-kpis'
import { TrendChart } from './trend-chart'
import { RiskGauge } from './risk-gauge'
import type { ExecutiveSummary, AnalyticsTrends } from '@/types/analytics'

interface ExecutiveModeProps {
  summary: ExecutiveSummary | undefined
  trends: AnalyticsTrends | undefined
  onClose: () => void
}

export function ExecutiveMode({ summary, trends, onClose }: ExecutiveModeProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const score = summary?.compliance_score ?? 0
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444'
  const r = 72
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#080c14] text-white overflow-auto">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-white/10 px-8 py-4">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-[#6366f1]" />
          <div>
            <span className="text-base font-black tracking-tight">SIGCYA Consulting S.A.S.</span>
            <span className="ml-3 text-xs text-white/40 font-medium">Sistema Integrado de Gestión · Vista Ejecutiva</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-white/40">Presiona ESC para salir</span>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white/60 hover:text-white hover:bg-white/10">
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 p-8 space-y-8 max-w-7xl mx-auto w-full">

        {/* Hero section */}
        <div className="grid grid-cols-[auto_1fr] gap-10 items-center">
          {/* Score ring */}
          <div className="flex flex-col items-center gap-3">
            <svg width="200" height="200" viewBox="0 0 200 200">
              {/* Glow */}
              <circle cx="100" cy="100" r={r + 16} fill="none" stroke={color} strokeWidth="1" opacity="0.15" />
              {/* Track */}
              <circle cx="100" cy="100" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="14" />
              {/* Value */}
              <circle
                cx="100" cy="100" r={r} fill="none"
                stroke={color} strokeWidth="14" strokeLinecap="round"
                strokeDasharray={circ} strokeDashoffset={offset}
                transform="rotate(-90 100 100)"
                style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1)', filter: `drop-shadow(0 0 8px ${color})` }}
              />
              <text x="100" y="94" textAnchor="middle" fontSize="36" fontWeight="900" fill="white">{score}%</text>
              <text x="100" y="116" textAnchor="middle" fontSize="11" fill="rgba(255,255,255,0.5)" fontWeight="600">COMPLIANCE</text>
            </svg>
            <div className="text-center">
              <p className="text-sm font-bold" style={{ color }}>
                {score >= 80 ? 'Nivel Excelente' : score >= 60 ? 'Nivel Aceptable' : 'Requiere Atención'}
              </p>
              <p className="text-xs text-white/40 mt-0.5">Score global del SIG</p>
            </div>
          </div>

          {/* Right: KPI grid */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-black tracking-tight">Resumen Ejecutivo</h1>
              <p className="text-white/40 text-sm mt-1">
                Sistema Integrado de Gestión · {new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            {/* Mini KPI strip */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'Hallazgos abiertos', value: summary?.open_findings ?? '—', alert: (summary?.open_findings ?? 0) > 5 },
                { label: 'CAPA vencidas',       value: summary?.overdue_capa ?? '—',  alert: (summary?.overdue_capa ?? 0) > 0 },
                { label: 'Auditorías activas',  value: summary?.active_audits ?? '—', alert: false },
                { label: 'Docs. a vencer',      value: summary?.docs_expiring ?? '—', alert: (summary?.docs_expiring ?? 0) > 0 },
              ].map((kpi) => (
                <div key={kpi.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                  <p className={`text-4xl font-black tabular-nums ${kpi.alert ? 'text-red-400' : 'text-white'}`}>{kpi.value}</p>
                  <p className="text-xs text-white/50 mt-2 font-medium">{kpi.label}</p>
                </div>
              ))}
            </div>

            {/* Risk */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-white/50">Riesgo global:</span>
              <span className={`text-sm font-bold px-3 py-1 rounded-full border ${
                summary?.risk_level === 'alto' ? 'border-red-500/40 bg-red-500/10 text-red-400' :
                summary?.risk_level === 'medio' ? 'border-yellow-500/40 bg-yellow-500/10 text-yellow-400' :
                'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
              }`}>
                {summary?.risk_level === 'alto' ? '⚠ ALTO' : summary?.risk_level === 'medio' ? '● MEDIO' : '✓ BAJO'}
              </span>
              <div className="flex gap-2 ml-2">
                {[
                  { label: 'Bajo', pct: summary?.risk_by_area.bajo ?? 0, color: '#10b981' },
                  { label: 'Medio', pct: summary?.risk_by_area.medio ?? 0, color: '#f59e0b' },
                  { label: 'Alto', pct: summary?.risk_by_area.alto ?? 0, color: '#ef4444' },
                ].map((z) => (
                  <div key={z.label} className="flex items-center gap-1.5 text-xs text-white/50">
                    <span className="h-2 w-2 rounded-full" style={{ background: z.color }} />
                    {z.pct}% {z.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Trend chart */}
        {trends && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <h3 className="text-sm font-bold text-white/70 uppercase tracking-wider mb-4">Tendencias — 12 meses</h3>
            <div className="[&_text]:fill-white/40 [&_line]:stroke-white/10">
              <TrendChart data={trends} isLoading={false} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
