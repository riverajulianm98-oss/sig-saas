export type DocumentType =
  | 'procedimiento'
  | 'formato'
  | 'instructivo'
  | 'politica'
  | 'manual'
  | 'evidencia'

export type DocumentStatus = 'borrador' | 'revision' | 'aprobado' | 'obsoleto'

export interface DocumentVersion {
  id: string
  version_number: number
  change_summary: string | null
  file_name: string | null
  storage_key: string | null
  mime_type: string | null
  file_size: number | null
  file_hash_sha256: string | null
  ai_metadata: Record<string, unknown> | null
  created_by_id: string | null
  created_at: string
}

export interface Document {
  id: string
  tenant_id: string
  code: string
  title: string
  description: string | null
  document_type: DocumentType
  status: DocumentStatus
  process_area: string | null
  owner_id: string | null
  current_version_id: string | null
  expires_at: string | null
  tags: string[] | null
  created_at: string
  updated_at: string
}

export interface DocumentDetail extends Document {
  current_version: DocumentVersion | null
  versions: DocumentVersion[]
}

export interface DocumentListResponse {
  items: Document[]
  total: number
  skip: number
  limit: number
}

export interface DocumentSearchParams {
  skip?: number
  limit?: number
  search?: string
  status?: DocumentStatus
  type?: DocumentType
  process_area?: string
  owner_id?: string
  tags?: string
  expires_from?: string
  expires_to?: string
  created_from?: string
  created_to?: string
  has_file?: boolean
}

export interface DocumentCreateRequest {
  code: string
  title: string
  document_type: DocumentType
  description?: string
  process_area?: string
  owner_id?: string
  expires_at?: string
  tags?: string[]
  change_summary?: string
}

export interface DocumentUpdateRequest {
  title?: string
  description?: string
  process_area?: string
  owner_id?: string
  expires_at?: string
  tags?: string[]
}

export interface DocumentStatusChangeRequest {
  status: DocumentStatus
  comment?: string
}

export interface DocumentVersionCreateRequest {
  change_summary: string
}

export interface DocumentTimelineEntry {
  id: string
  action: string
  user_id: string | null
  version_id: string | null
  ip_address: string | null
  changes: Record<string, unknown> | null
  message: string | null
  created_at: string
}

export interface DocumentTimelineResponse {
  items: DocumentTimelineEntry[]
  total: number
  skip: number
  limit: number
}

export interface DocumentAlertItem {
  severity: 'expired' | 'warning' | 'critical'
  document: Document
  expires_at: string | null
}

export interface DocumentAlertsResponse {
  expired: DocumentAlertItem[]
  expiring_soon: DocumentAlertItem[]
  expiring_critical: DocumentAlertItem[]
  settings: Record<string, unknown>
}

export interface DownloadUrlResponse {
  url: string
  expires_in: number | null
  file_name: string | null
}
