export type IsoStandard = 'iso_9001' | 'iso_14001' | 'iso_45001'
export type AuditType = 'interna' | 'externa' | 'seguimiento' | 'certificacion' | 'extraordinaria'
export type AuditStatus = 'planeada' | 'en_proceso' | 'finalizada' | 'cerrada' | 'cancelada'
export type FindingClassification = 'no_conformidad' | 'observacion' | 'oportunidad_mejora' | 'fortaleza'
export type FindingSeverity = 'baja' | 'media' | 'alta' | 'critica'
export type FindingStatus = 'abierto' | 'en_seguimiento' | 'cerrado'
export type SuggestionStatus =
  | 'sugerido'
  | 'pendiente_validacion'
  | 'aprobado'
  | 'descartado'
  | 'convertido_accion'
export type ChecklistCompliance = 'cumple' | 'no_cumple' | 'parcial' | 'no_aplica' | 'pendiente'
export type EvidenceType = 'document_reference' | 'file_upload' | 'external_url'
export type ActionPlanStatus = 'pendiente' | 'en_progreso' | 'completada' | 'vencida' | 'cancelada'

// --- Audit ---
export interface AuditResponse {
  id: string
  tenant_id: string
  audit_plan_id: string | null
  code: string
  title: string
  description: string | null
  audit_type: AuditType
  status: AuditStatus
  iso_standards: string[] | null
  process_area: string | null
  scope: string | null
  objectives: string | null
  location: string | null
  planned_start_date: string | null
  planned_end_date: string | null
  actual_start_date: string | null
  actual_end_date: string | null
  lead_auditor_id: string | null
  compliance_score: number | null
  created_at: string
  updated_at: string
}

export interface AuditDetailResponse extends AuditResponse {
  findings_count: number
  open_findings_count: number
  critical_findings_count: number
  checklist_items_count: number
}

export interface AuditListResponse {
  items: AuditResponse[]
  total: number
  skip: number
  limit: number
}

export interface AuditSearchParams {
  skip?: number
  limit?: number
  search?: string
  status?: AuditStatus
  type?: AuditType
  process_area?: string
}

export interface AuditCreateRequest {
  code: string
  title: string
  audit_type: AuditType
  description?: string
  audit_plan_id?: string
  iso_standards?: IsoStandard[]
  process_area?: string
  scope?: string
  objectives?: string
  location?: string
  planned_start_date?: string
  planned_end_date?: string
  lead_auditor_id?: string
  team_member_ids?: string[]
}

export interface AuditUpdateRequest {
  title?: string
  description?: string
  process_area?: string
  scope?: string
  objectives?: string
  location?: string
  planned_start_date?: string
  planned_end_date?: string
  actual_start_date?: string
  actual_end_date?: string
  lead_auditor_id?: string
  team_member_ids?: string[]
  iso_standards?: IsoStandard[]
}

export interface AuditStatusChangeRequest {
  status: AuditStatus
  comment?: string
}

// --- Checklist ---
export interface AuditChecklistResponse {
  id: string
  audit_id: string
  iso_standard: string
  clause_code: string
  requirement_text: string
  question_text: string
  sort_order: number
  weight: number
  section_title: string | null
  chapter_code: string | null
  process_area: string | null
  criticality: string | null
  response_type: string | null
  evidence_required: boolean
  compliance_criteria: string | null
  compliance_status: ChecklistCompliance | null
  score: number | null
  text_value: string | null
  numeric_value: number | null
  observations: string | null
}

export interface ChecklistResponseUpsert {
  compliance_status?: ChecklistCompliance
  score?: number
  text_value?: string
  numeric_value?: number
  observations?: string
}

// --- Findings ---
export interface AuditFindingResponse {
  id: string
  audit_id: string
  tenant_id: string
  code: string | null
  title: string
  description: string
  classification: FindingClassification
  severity: FindingSeverity
  status: FindingStatus
  requirement_reference: string | null
  process_area: string | null
  responsible_user_id: string | null
  due_date: string | null
  created_at: string
}

export interface FindingCreateRequest {
  title: string
  description: string
  classification: FindingClassification
  severity: FindingSeverity
  requirement_reference?: string
  process_area?: string
  responsible_user_id?: string
  due_date?: string
  root_cause?: string
}

export interface FindingUpdateRequest {
  title?: string
  description?: string
  classification?: FindingClassification
  severity?: FindingSeverity
  status?: FindingStatus
  requirement_reference?: string
  process_area?: string
  responsible_user_id?: string
  due_date?: string
  root_cause?: string
}

// --- Action Plans ---
export interface ActionPlanResponse {
  id: string
  finding_id: string
  title: string
  description: string | null
  status: ActionPlanStatus
  responsible_user_id: string | null
  due_date: string | null
  completed_at: string | null
  created_at: string
}

export interface ActionPlanCreateRequest {
  title: string
  description?: string
  responsible_user_id?: string
  due_date?: string
}

// --- Evidence ---
export interface AuditEvidenceResponse {
  id: string
  audit_id: string
  finding_id: string | null
  checklist_id: string | null
  evidence_type: EvidenceType
  description: string | null
  document_id: string | null
  document_version_id: string | null
  external_url: string | null
  file_name: string | null
  file_hash_sha256: string | null
  created_at: string
}

export interface EvidenceDocumentRefRequest {
  document_id: string
  document_version_id?: string
  description?: string
}

export interface EvidenceUrlRequest {
  external_url: string
  description?: string
  finding_id?: string
  checklist_id?: string
}

// --- Suggestions (AI) ---
export interface AuditSuggestionResponse {
  id: string
  audit_id: string
  checklist_item_id: string
  status: SuggestionStatus
  classification: FindingClassification
  severity: FindingSeverity
  title: string
  description: string
  requirement_reference: string | null
  process_area: string | null
  potential_impact: string | null
  initial_recommendation: string | null
  confidence_score: number
  converted_finding_id: string | null
  reviewed_by_id: string | null
  reviewed_at: string | null
  discard_reason: string | null
  created_at: string
  updated_at: string
}

export interface GenerateSuggestionsRequest {
  sensitivity?: 'baja' | 'media' | 'alta'
  checklist_item_ids?: string[]
}

export interface GenerateSuggestionsResponse {
  generated: number
  suggestions: AuditSuggestionResponse[]
}

export interface ApproveSuggestionRequest {
  notes?: string
}

export interface DiscardSuggestionRequest {
  reason: string
}

export interface ConvertActionRequest {
  due_date?: string
  responsible_user_id?: string
}

// --- Timeline ---
export interface AuditTimelineEntry {
  id: string
  action: string
  user_id: string | null
  entity_type: string | null
  entity_id: string | null
  ip_address: string | null
  changes: Record<string, unknown> | null
  message: string | null
  created_at: string
}

export interface AuditTimelineResponse {
  items: AuditTimelineEntry[]
  total: number
  skip: number
  limit: number
}

// --- Dashboard ---
export interface AuditDashboardResponse {
  open_audits: number
  critical_findings: number
  open_findings: number
  compliance_score_avg: number | null
  findings_by_process: Record<string, number>
  findings_by_classification: Record<string, number>
  action_plans_by_status: Record<string, number>
  audits_by_status: Record<string, number>
}

// --- Templates ---
export interface TemplateSummary {
  id: string
  code: string
  name: string
  iso_standard: IsoStandard
  description: string | null
  is_active: boolean
  question_count: number
  created_at: string
}

export interface TemplateListResponse {
  items: TemplateSummary[]
  total: number
}

export interface AuditFromTemplateRequest {
  template_id: string
  code: string
  title: string
  audit_type: AuditType
  process_area?: string
  planned_start_date?: string
  planned_end_date?: string
  lead_auditor_id?: string
}

// --- Compliance ---
export interface ComplianceClause {
  clause_code: string
  clause_title: string | null
  total: number
  cumple: number
  no_cumple: number
  parcial: number
  no_aplica: number
  pendiente: number
  score: number | null
}

export interface ComplianceBreakdown {
  audit_id: string
  overall_score: number | null
  total_items: number
  responded_items: number
  clauses: ComplianceClause[]
}
