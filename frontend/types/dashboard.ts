export interface DashboardStats {
  total_audits: number
  open_audits: number
  completed_audits: number
  critical_findings: number
  open_findings: number
  compliance_score: number
  expired_documents: number
  expiring_documents: number
}

export interface AuditDashboardResponse {
  total_audits: number
  open_audits: number
  in_progress: number
  completed: number
  closed: number
  critical_findings: number
  open_findings: number
  avg_compliance_score: number | null
  audits_by_type: Record<string, number>
  findings_by_severity: Record<string, number>
}
