export interface ExecutiveSummary {
  compliance_score: number
  compliance_trend: number
  open_findings: number
  findings_trend: number
  overdue_capa: number
  capa_trend: number
  active_audits: number
  docs_expiring: number
  risk_level: 'bajo' | 'medio' | 'alto'
  risk_by_area: { bajo: number; medio: number; alto: number }
  last_updated: string
}

export interface TrendSeries {
  name: string
  key: string
  color: string
  data: number[]
}

export interface AnalyticsTrends {
  months: string[]
  compliance: number[]
  capa_completion: number[]
  findings_open: number[]
  recurrence_rate: number[]
  audits_count: number[]
}

export interface ProcessRisk {
  process: string
  critica: number
  alta: number
  media: number
  baja: number
  risk_score: number
}

export interface ClauseScore {
  clause: string
  label: string
  score: number
}

export interface AiInsight {
  id: string
  type: 'risk' | 'trend' | 'action' | 'opportunity'
  title: string
  body: string
  icon: string
  severity: 'critica' | 'alta' | 'media' | 'baja' | 'positivo' | 'mejora'
  created_at: string
}

export interface ReportDefinition {
  id: string
  title: string
  description: string
  icon: string
  modules: string[]
  last_generated: string | null
}

export interface ReportGenerateRequest {
  report_type: string
  date_from: string
  date_to: string
  modules: string[]
  processes: string[]
  format: 'pdf' | 'excel' | 'csv'
}
