'use client'

import { useState } from 'react'
import { FileDown, Loader2, CheckCircle2, FileText, BarChart2, ClipboardCheck, AlertTriangle, CheckSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useGenerateReport } from '../hooks/use-analytics'
import type { ReportGenerateRequest } from '@/types/analytics'

const MODULES = [
  { id: 'executive', label: 'Resumen ejecutivo', icon: BarChart2 },
  { id: 'audits',    label: 'Auditorías',        icon: ClipboardCheck },
  { id: 'findings',  label: 'Hallazgos',         icon: AlertTriangle },
  { id: 'capa',      label: 'CAPA',              icon: CheckSquare },
  { id: 'documents', label: 'Documentos',        icon: FileText },
]

const PROCESSES = [
  'Calidad', 'Producción', 'HSEQ', 'Medio Ambiente', 'Compras', 'Logística', 'Comercial', 'TI', 'Dirección',
]

function todayStr() {
  return new Date().toISOString().split('T')[0]
}
function monthAgoStr() {
  const d = new Date()
  d.setMonth(d.getMonth() - 1)
  return d.toISOString().split('T')[0]
}

export function ReportBuilder() {
  const [dateFrom, setDateFrom] = useState(monthAgoStr())
  const [dateTo, setDateTo] = useState(todayStr())
  const [selectedModules, setSelectedModules] = useState<string[]>(['executive', 'audits', 'findings'])
  const [selectedProcesses, setSelectedProcesses] = useState<string[]>([])
  const [format, setFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf')
  const [success, setSuccess] = useState(false)

  const { mutateAsync, isPending } = useGenerateReport()

  const toggleModule = (id: string) =>
    setSelectedModules((prev) => prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id])

  const toggleProcess = (p: string) =>
    setSelectedProcesses((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p])

  const handleGenerate = async () => {
    setSuccess(false)
    try {
      await mutateAsync({
        report_type: 'custom',
        date_from: dateFrom,
        date_to: dateTo,
        modules: selectedModules,
        processes: selectedProcesses,
        format,
      } as ReportGenerateRequest)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 4000)

      // Simulate file download for PDF
      if (format === 'pdf') {
        const report = buildReportContent(dateFrom, dateTo, selectedModules)
        const blob = new Blob([report], { type: 'text/html' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `reporte_sigcya_${todayStr()}.html`
        a.click()
        URL.revokeObjectURL(url)
      } else if (format === 'csv' || format === 'excel') {
        const csv = buildCsvContent(selectedModules)
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `reporte_sigcya_${todayStr()}.csv`
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch { /* ignore */ }
  }

  return (
    <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 space-y-5">
      <div>
        <h2 className="text-base font-bold">Generador de reportes</h2>
        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">Personaliza y exporta reportes del sistema</p>
      </div>

      <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
        {/* Date range */}
        <div className="space-y-1.5">
          <Label className="text-xs">Desde</Label>
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-9" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Hasta</Label>
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-9" />
        </div>

        {/* Format */}
        <div className="space-y-1.5">
          <Label className="text-xs">Formato</Label>
          <div className="flex gap-1.5">
            {(['pdf', 'excel', 'csv'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                className={`flex-1 rounded-lg border py-2 text-xs font-bold uppercase transition-all ${
                  format === f
                    ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]'
                    : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]'
                }`}
              >{f}</button>
            ))}
          </div>
        </div>

        {/* Generate button */}
        <div className="flex items-end">
          <Button
            onClick={handleGenerate}
            disabled={isPending || selectedModules.length === 0}
            className="w-full gap-2 h-9"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : success ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            ) : (
              <FileDown className="h-4 w-4" />
            )}
            {isPending ? 'Generando...' : success ? '¡Descargado!' : 'Generar reporte'}
          </Button>
        </div>
      </div>

      {/* Modules */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Módulos a incluir</Label>
        <div className="flex flex-wrap gap-2">
          {MODULES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => toggleModule(id)}
              className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                selectedModules.includes(id)
                  ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]'
                  : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--primary))]/40'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Processes */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
          Filtrar por proceso{selectedProcesses.length > 0 ? ` (${selectedProcesses.length} seleccionados)` : ' (todos)'}
        </Label>
        <div className="flex flex-wrap gap-2">
          {PROCESSES.map((p) => (
            <button
              key={p}
              onClick={() => toggleProcess(p)}
              className={`rounded-full border px-2.5 py-1 text-xs transition-all ${
                selectedProcesses.includes(p)
                  ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]'
                  : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--primary))]/40'
              }`}
            >{p}</button>
          ))}
        </div>
      </div>

      {success && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-sm font-medium text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-4 w-4" />
          Reporte generado y descargado exitosamente
        </div>
      )}
    </div>
  )
}

function buildReportContent(from: string, to: string, modules: string[]): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Reporte SIG — SIGCYA Consulting S.A.S.</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; color: #1e293b; background: #fff; padding: 40px; }
    header { border-bottom: 3px solid #6366f1; padding-bottom: 24px; margin-bottom: 32px; }
    h1 { font-size: 28px; font-weight: 900; color: #1e293b; }
    .subtitle { color: #64748b; font-size: 14px; margin-top: 4px; }
    .kpi-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; margin-bottom: 32px; }
    .kpi-card { border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; }
    .kpi-value { font-size: 32px; font-weight: 900; color: #6366f1; }
    .kpi-label { font-size: 12px; color: #64748b; margin-top: 4px; }
    section { margin-bottom: 32px; }
    h2 { font-size: 18px; font-weight: 700; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #e2e8f0; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #f1f5f9; }
    th { background: #f8fafc; font-weight: 700; color: #475569; text-transform: uppercase; font-size: 11px; letter-spacing: 0.05em; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 600; }
    .critica { background: #fee2e2; color: #dc2626; }
    .alta { background: #ffedd5; color: #ea580c; }
    .media { background: #fef9c3; color: #ca8a04; }
    footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center; }
  </style>
</head>
<body>
  <header>
    <h1>🛡 Reporte del Sistema Integrado de Gestión</h1>
    <p class="subtitle">SIGCYA Consulting S.A.S. · Período: ${from} — ${to} · Módulos: ${modules.join(', ')}</p>
  </header>

  <div class="kpi-grid">
    <div class="kpi-card"><div class="kpi-value">87%</div><div class="kpi-label">Compliance global</div></div>
    <div class="kpi-card"><div class="kpi-value">10</div><div class="kpi-label">Hallazgos abiertos</div></div>
    <div class="kpi-card"><div class="kpi-value">5</div><div class="kpi-label">CAPA vencidas</div></div>
    <div class="kpi-card"><div class="kpi-value">3</div><div class="kpi-label">Auditorías activas</div></div>
    <div class="kpi-card"><div class="kpi-value">MEDIO</div><div class="kpi-label">Riesgo global</div></div>
  </div>

  <section>
    <h2>Hallazgos por Severidad</h2>
    <table>
      <thead><tr><th>Código</th><th>Título</th><th>Clasificación</th><th>Severidad</th><th>Estado</th><th>Área</th></tr></thead>
      <tbody>
        <tr><td>HLL-002</td><td>Checklist de calibración desactualizado P-204</td><td>No conformidad</td><td><span class="badge critica">Crítica</span></td><td>Abierto</td><td>Producción</td></tr>
        <tr><td>HLL-007</td><td>Gestión inadecuada de residuos peligrosos</td><td>No conformidad</td><td><span class="badge critica">Crítica</span></td><td>Abierto</td><td>Operaciones</td></tr>
        <tr><td>HLL-009</td><td>EPP no disponible para 4 trabajadores</td><td>No conformidad</td><td><span class="badge critica">Crítica</span></td><td>Abierto</td><td>Producción</td></tr>
        <tr><td>HLL-001</td><td>Ausencia de registros revisión por dirección</td><td>No conformidad</td><td><span class="badge alta">Alta</span></td><td>En seguimiento</td><td>Dirección</td></tr>
        <tr><td>HLL-006</td><td>Plan ambiental sin metas CO2</td><td>No conformidad</td><td><span class="badge alta">Alta</span></td><td>Abierto</td><td>Medio Ambiente</td></tr>
      </tbody>
    </table>
  </section>

  <section>
    <h2>Estado CAPA</h2>
    <table>
      <thead><tr><th>Código</th><th>Acción</th><th>Tipo</th><th>Estado</th><th>Responsable</th><th>Vencimiento</th></tr></thead>
      <tbody>
        <tr><td>ACC-001</td><td>Implementar formato revisión por dirección</td><td>Correctiva</td><td>En progreso</td><td>Alejandro Gómez</td><td>Vencido</td></tr>
        <tr><td>ACC-003</td><td>Calibrar equipo P-204</td><td>Correctiva</td><td>Validación</td><td>Carlos Martínez</td><td>Vigente</td></tr>
        <tr><td>ACC-004</td><td>Actualizar perfiles de cargo</td><td>Correctiva</td><td>Cerrada</td><td>Diana López</td><td>Completado</td></tr>
      </tbody>
    </table>
  </section>

  <footer>
    Generado por SIG SaaS · SIGCYA Consulting S.A.S. · ${new Date().toLocaleString('es-CO')} · Confidencial
  </footer>
</body>
</html>`
}

function buildCsvContent(modules: string[]): string {
  const rows = [
    ['Código', 'Título', 'Clasificación', 'Severidad', 'Estado', 'Área', 'Responsable', 'Vencimiento'],
    ['HLL-002', 'Checklist calibración P-204', 'No conformidad', 'Crítica', 'Abierto', 'Producción', 'Carlos Martínez', '2025-05-15'],
    ['HLL-007', 'Residuos peligrosos', 'No conformidad', 'Crítica', 'Abierto', 'Operaciones', 'Diana López', '2025-05-19'],
    ['HLL-001', 'Revisión por dirección', 'No conformidad', 'Alta', 'En seguimiento', 'Dirección', 'Alejandro Gómez', '2025-05-07'],
    ['HLL-006', 'Plan ambiental CO2', 'No conformidad', 'Alta', 'Abierto', 'Medio Ambiente', 'María Rodríguez', '2025-05-12'],
  ]
  return rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')
}
