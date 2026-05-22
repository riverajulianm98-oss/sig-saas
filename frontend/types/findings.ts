import type { FindingClassification, FindingSeverity, FindingStatus } from './audits'

export type { FindingClassification, FindingSeverity, FindingStatus }

export type FindingSource =
  | 'auditoria'
  | 'inspeccion'
  | 'queja'
  | 'revision_directa'
  | 'mejora_continua'

export type FindingRootCauseCategory =
  | 'proceso'
  | 'persona'
  | 'equipo'
  | 'material'
  | 'ambiente'
  | 'medicion'

export type CapaStatus =
  | 'pendiente'
  | 'en_progreso'
  | 'validacion'
  | 'cerrada'
  | 'cancelada'

export type CapaActionType = 'correctiva' | 'preventiva' | 'mejora'

export interface FindingResponse {
  id: string
  tenant_id: string
  audit_id: string | null
  audit_code: string | null
  audit_title: string | null
  code: string | null
  title: string
  description: string
  classification: FindingClassification
  severity: FindingSeverity
  status: FindingStatus
  source: FindingSource
  requirement_reference: string | null
  process_area: string | null
  responsible_user_id: string | null
  responsible_name: string | null
  due_date: string | null
  root_cause: string | null
  root_cause_category: FindingRootCauseCategory | null
  actions_count: number
  open_actions_count: number
  is_recurrent: boolean
  created_at: string
  updated_at: string
}

export interface FindingDetail extends FindingResponse {
  actions: CapaResponse[]
  timeline: FindingTimelineEntry[]
}

export interface FindingListResponse {
  items: FindingResponse[]
  total: number
  skip: number
  limit: number
}

export interface FindingSearchParams {
  skip?: number
  limit?: number
  search?: string
  classification?: FindingClassification
  severity?: FindingSeverity
  status?: FindingStatus
  source?: FindingSource
  process_area?: string
  audit_id?: string
}

export interface FindingCreateRequest {
  title: string
  description: string
  classification: FindingClassification
  severity: FindingSeverity
  source?: FindingSource
  requirement_reference?: string
  process_area?: string
  responsible_user_id?: string
  due_date?: string
  root_cause?: string
  root_cause_category?: FindingRootCauseCategory
  audit_id?: string
}

export interface FindingUpdateRequest {
  title?: string
  description?: string
  classification?: FindingClassification
  severity?: FindingSeverity
  status?: FindingStatus
  source?: FindingSource
  requirement_reference?: string
  process_area?: string
  responsible_user_id?: string
  due_date?: string
  root_cause?: string
  root_cause_category?: FindingRootCauseCategory
  is_recurrent?: boolean
}

export interface CapaResponse {
  id: string
  tenant_id: string
  finding_id: string
  finding_code: string | null
  finding_title: string
  code: string | null
  title: string
  description: string | null
  status: CapaStatus
  action_type: CapaActionType
  responsible_user_id: string | null
  responsible_name: string | null
  verifier_user_id: string | null
  verifier_name: string | null
  due_date: string | null
  start_date: string | null
  completed_at: string | null
  verified_at: string | null
  effectiveness_score: number | null
  comments_count: number
  created_at: string
  updated_at: string
}

export interface CapaDetail extends CapaResponse {
  comments: CapaComment[]
}

export interface CapaComment {
  id: string
  capa_id: string
  user_id: string
  user_name: string
  content: string
  created_at: string
}

export interface CapaCreateRequest {
  title: string
  description?: string
  action_type: CapaActionType
  responsible_user_id?: string
  due_date?: string
  start_date?: string
}

export interface CapaUpdateRequest {
  title?: string
  description?: string
  action_type?: CapaActionType
  status?: CapaStatus
  responsible_user_id?: string
  verifier_user_id?: string
  due_date?: string
  effectiveness_score?: number
}

export interface CapaStatusChangeRequest {
  status: CapaStatus
  comment?: string
}

export interface CapaCommentRequest {
  content: string
}

export interface CapaDashboardResponse {
  total: number
  pendiente: number
  en_progreso: number
  validacion: number
  cerrada: number
  cancelada: number
  vencidas: number
  reincidencias: number
  avg_close_days: number | null
  by_process: Record<string, number>
  by_action_type: Record<string, number>
}

export interface FindingTimelineEntry {
  id: string
  action: string
  user_name: string | null
  message: string
  created_at: string
}

export interface FindingsDashboardStats {
  total: number
  abiertos: number
  en_seguimiento: number
  cerrados: number
  criticos: number
  vencidos: number
  open_actions: number
}
