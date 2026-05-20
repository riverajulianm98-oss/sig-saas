import apiClient from '@/lib/axios'
import type {
  AuditListResponse,
  AuditDetailResponse,
  AuditSearchParams,
  AuditCreateRequest,
  AuditUpdateRequest,
  AuditStatusChangeRequest,
  AuditChecklistResponse,
  ChecklistResponseUpsert,
  AuditFindingResponse,
  FindingCreateRequest,
  FindingUpdateRequest,
  ActionPlanResponse,
  ActionPlanCreateRequest,
  AuditEvidenceResponse,
  EvidenceDocumentRefRequest,
  EvidenceUrlRequest,
  AuditSuggestionResponse,
  GenerateSuggestionsRequest,
  GenerateSuggestionsResponse,
  ApproveSuggestionRequest,
  DiscardSuggestionRequest,
  ConvertActionRequest,
  AuditTimelineResponse,
  AuditDashboardResponse,
  TemplateListResponse,
  AuditFromTemplateRequest,
  ComplianceBreakdown,
} from '@/types/audits'

export const auditsService = {
  async dashboard(): Promise<AuditDashboardResponse> {
    const res = await apiClient.get<AuditDashboardResponse>('/audits/dashboard')
    return res.data
  },

  async list(params: AuditSearchParams = {}): Promise<AuditListResponse> {
    const res = await apiClient.get<AuditListResponse>('/audits', { params })
    return res.data
  },

  async getById(id: string): Promise<AuditDetailResponse> {
    const res = await apiClient.get<AuditDetailResponse>(`/audits/${id}`)
    return res.data
  },

  async create(data: AuditCreateRequest): Promise<AuditDetailResponse> {
    const res = await apiClient.post<AuditDetailResponse>('/audits', data)
    return res.data
  },

  async update(id: string, data: AuditUpdateRequest): Promise<AuditDetailResponse> {
    const res = await apiClient.patch<AuditDetailResponse>(`/audits/${id}`, data)
    return res.data
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/audits/${id}`)
  },

  async changeStatus(id: string, data: AuditStatusChangeRequest): Promise<AuditDetailResponse> {
    const res = await apiClient.post<AuditDetailResponse>(`/audits/${id}/status`, data)
    return res.data
  },

  async getTimeline(id: string, skip = 0, limit = 50): Promise<AuditTimelineResponse> {
    const res = await apiClient.get<AuditTimelineResponse>(`/audits/${id}/timeline`, {
      params: { skip, limit },
    })
    return res.data
  },

  // Checklist
  async listChecklist(auditId: string): Promise<AuditChecklistResponse[]> {
    const res = await apiClient.get<AuditChecklistResponse[]>(`/audits/${auditId}/checklists`)
    return res.data
  },

  async recordResponse(
    auditId: string,
    checklistId: string,
    data: ChecklistResponseUpsert
  ): Promise<AuditChecklistResponse> {
    const res = await apiClient.put<AuditChecklistResponse>(
      `/audits/${auditId}/checklists/${checklistId}/response`,
      data
    )
    return res.data
  },

  // Findings
  async listFindings(auditId: string): Promise<AuditFindingResponse[]> {
    const res = await apiClient.get<AuditFindingResponse[]>(`/audits/${auditId}/findings`)
    return res.data
  },

  async createFinding(auditId: string, data: FindingCreateRequest): Promise<AuditFindingResponse> {
    const res = await apiClient.post<AuditFindingResponse>(`/audits/${auditId}/findings`, data)
    return res.data
  },

  async updateFinding(
    auditId: string,
    findingId: string,
    data: FindingUpdateRequest
  ): Promise<AuditFindingResponse> {
    const res = await apiClient.patch<AuditFindingResponse>(
      `/audits/${auditId}/findings/${findingId}`,
      data
    )
    return res.data
  },

  async createActionPlan(
    auditId: string,
    findingId: string,
    data: ActionPlanCreateRequest
  ): Promise<ActionPlanResponse> {
    const res = await apiClient.post<ActionPlanResponse>(
      `/audits/${auditId}/findings/${findingId}/action-plans`,
      data
    )
    return res.data
  },

  // Evidence
  async listEvidences(auditId: string): Promise<AuditEvidenceResponse[]> {
    const res = await apiClient.get<AuditEvidenceResponse[]>(`/audits/${auditId}/evidences`)
    return res.data
  },

  async addDocumentEvidence(
    auditId: string,
    data: EvidenceDocumentRefRequest
  ): Promise<AuditEvidenceResponse> {
    const res = await apiClient.post<AuditEvidenceResponse>(
      `/audits/${auditId}/evidences/document`,
      data
    )
    return res.data
  },

  async addUrlEvidence(
    auditId: string,
    data: EvidenceUrlRequest
  ): Promise<AuditEvidenceResponse> {
    const res = await apiClient.post<AuditEvidenceResponse>(
      `/audits/${auditId}/evidences/url`,
      data
    )
    return res.data
  },

  async uploadEvidence(
    auditId: string,
    file: File,
    findingId?: string,
    onProgress?: (pct: number) => void
  ): Promise<AuditEvidenceResponse> {
    const form = new FormData()
    form.append('file', file)
    if (findingId) form.append('finding_id', findingId)
    const res = await apiClient.post<AuditEvidenceResponse>(
      `/audits/${auditId}/evidences/upload`,
      form,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100))
        },
      }
    )
    return res.data
  },

  // AI Suggestions
  async listSuggestions(auditId: string, status?: string): Promise<AuditSuggestionResponse[]> {
    const res = await apiClient.get<AuditSuggestionResponse[]>(
      `/audits/${auditId}/finding-suggestions`,
      { params: status ? { status } : {} }
    )
    return res.data
  },

  async generateSuggestions(
    auditId: string,
    data: GenerateSuggestionsRequest
  ): Promise<GenerateSuggestionsResponse> {
    const res = await apiClient.post<GenerateSuggestionsResponse>(
      `/audits/${auditId}/finding-suggestions/generate`,
      data
    )
    return res.data
  },

  async approveSuggestion(
    auditId: string,
    suggestionId: string,
    data: ApproveSuggestionRequest
  ): Promise<AuditSuggestionResponse> {
    const res = await apiClient.post<AuditSuggestionResponse>(
      `/audits/${auditId}/finding-suggestions/${suggestionId}/approve`,
      data
    )
    return res.data
  },

  async discardSuggestion(
    auditId: string,
    suggestionId: string,
    data: DiscardSuggestionRequest
  ): Promise<AuditSuggestionResponse> {
    const res = await apiClient.post<AuditSuggestionResponse>(
      `/audits/${auditId}/finding-suggestions/${suggestionId}/discard`,
      data
    )
    return res.data
  },

  async convertSuggestion(
    auditId: string,
    suggestionId: string,
    data: ConvertActionRequest
  ): Promise<AuditSuggestionResponse> {
    const res = await apiClient.post<AuditSuggestionResponse>(
      `/audits/${auditId}/finding-suggestions/${suggestionId}/convert-action`,
      data
    )
    return res.data
  },

  // Templates
  async listTemplates(params?: { iso?: string; active_only?: boolean }): Promise<TemplateListResponse> {
    const res = await apiClient.get<TemplateListResponse>('/audit-templates', { params })
    return res.data
  },

  async createFromTemplate(data: AuditFromTemplateRequest): Promise<AuditDetailResponse> {
    const res = await apiClient.post<AuditDetailResponse>(
      '/audit-templates/audits/from-template',
      data
    )
    return res.data
  },

  async getComplianceBreakdown(auditId: string): Promise<ComplianceBreakdown> {
    const res = await apiClient.get<ComplianceBreakdown>(
      `/audit-templates/audits/${auditId}/compliance`
    )
    return res.data
  },
}
