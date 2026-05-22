'use client'

import { FileText, BarChart2, ClipboardCheck, AlertTriangle, CheckSquare, Download, Clock, TrendingUp } from 'lucide-react'
import { ReportBuilder } from '../components/report-builder'

const REPORT_TYPES = [
  {
    id: 'executive',
    label: 'Resumen Ejecutivo',
    icon: BarChart2,
    description: 'KPIs del SIG, score de compliance, riesgo global y estado de indicadores clave.',
    frequency: 'Mensual',
    color: 'text-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10',
  },
  {
    id: 'audits',
    label: 'Informe de Auditorías',
    icon: ClipboardCheck,
    description: 'Resultados, hallazgos por auditoría, compliance por proceso y lista de chequeo.',
    frequency: 'Por auditoría',
    color: 'text-blue-600 bg-blue-500/10',
  },
  {
    id: 'findings',
    label: 'Reporte de Hallazgos',
    icon: AlertTriangle,
    description: 'Hallazgos por severidad, clasificación, estado y área. Incluye análisis de causa raíz.',
    frequency: 'Semanal',
    color: 'text-red-600 bg-red-500/10',
  },
  {
    id: 'capa',
    label: 'Seguimiento CAPA',
    icon: CheckSquare,
    description: 'Estado de acciones correctivas, eficacia, indicadores de vencimiento y recurrencia.',
    frequency: 'Quincenal',
    color: 'text-emerald-600 bg-emerald-500/10',
  },
  {
    id: 'documents',
    label: 'Gestión Documental',
    icon: FileText,
    description: 'Documentos vigentes, próximos a vencer, vencidos y trazabilidad de versiones.',
    frequency: 'Mensual',
    color: 'text-purple-600 bg-purple-500/10',
  },
  {
    id: 'trends',
    label: 'Análisis de Tendencias',
    icon: TrendingUp,
    description: 'Evolución de indicadores en el tiempo, comparativo de períodos y proyecciones.',
    frequency: 'Trimestral',
    color: 'text-amber-600 bg-amber-500/10',
  },
]

const RECENT_REPORTS = [
  { name: 'Resumen Ejecutivo — Abril 2025', date: '2025-05-01', format: 'PDF', modules: 'Executive, Hallazgos' },
  { name: 'Seguimiento CAPA — Semana 18', date: '2025-05-05', format: 'Excel', modules: 'CAPA' },
  { name: 'Informe auditorías Q1 2025', date: '2025-04-15', format: 'PDF', modules: 'Auditorías, Hallazgos, CAPA' },
  { name: 'Exportación hallazgos Producción', date: '2025-04-10', format: 'CSV', modules: 'Hallazgos' },
]

export function ReportsView() {
  return (
    <div className="space-y-8 max-w-7xl">

      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--primary))]/10">
            <Download className="h-4 w-4 text-[hsl(var(--primary))]" />
          </div>
          <h1 className="text-2xl font-black tracking-tight">Reportes</h1>
        </div>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Genera y descarga reportes del sistema en PDF, Excel o CSV
        </p>
      </div>

      {/* Report builder */}
      <ReportBuilder />

      {/* Report types catalog */}
      <section>
        <h2 className="text-sm font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-4">
          Tipos de reporte disponibles
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {REPORT_TYPES.map((r) => (
            <div
              key={r.id}
              className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 space-y-3"
            >
              <div className="flex items-start gap-3">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${r.color}`}>
                  <r.icon className="h-4.5 w-4.5 h-[18px] w-[18px]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold leading-tight">{r.label}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Clock className="h-3 w-3 text-[hsl(var(--muted-foreground))]" />
                    <span className="text-[10px] text-[hsl(var(--muted-foreground))] font-medium">{r.frequency}</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-[hsl(var(--muted-foreground))] leading-relaxed">{r.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recent reports */}
      <section>
        <h2 className="text-sm font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-4">
          Reportes recientes
        </h2>
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] divide-y divide-[hsl(var(--border))]">
          {RECENT_REPORTS.map((r, i) => (
            <div key={i} className="flex items-center justify-between gap-4 px-5 py-3.5">
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="h-4 w-4 shrink-0 text-[hsl(var(--muted-foreground))]" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{r.name}</p>
                  <p className="text-[11px] text-[hsl(var(--muted-foreground))]">{r.modules}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs text-[hsl(var(--muted-foreground))]">{r.date}</span>
                <span className="rounded-full border border-[hsl(var(--border))] px-2 py-0.5 text-[10px] font-bold uppercase text-[hsl(var(--muted-foreground))]">
                  {r.format}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}
