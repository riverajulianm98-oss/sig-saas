'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { auditsService } from '@/services/audits.service'
import type {
  AuditSearchParams,
  AuditCreateRequest,
  AuditUpdateRequest,
  AuditStatusChangeRequest,
  ChecklistResponseUpsert,
  FindingCreateRequest,
  FindingUpdateRequest,
  ActionPlanCreateRequest,
  EvidenceDocumentRefRequest,
  EvidenceUrlRequest,
  GenerateSuggestionsRequest,
  ApproveSuggestionRequest,
  DiscardSuggestionRequest,
  ConvertActionRequest,
  AuditFromTemplateRequest,
} from '@/types/audits'

export const AUDITS_KEYS = {
  all: ['audits'] as const,
  lists: () => [...AUDITS_KEYS.all, 'list'] as const,
  list: (params: AuditSearchParams) => [...AUDITS_KEYS.lists(), params] as const,
  details: () => [...AUDITS_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...AUDITS_KEYS.details(), id] as const,
  dashboard: () => [...AUDITS_KEYS.all, 'dashboard'] as const,
  timeline: (id: string) => [...AUDITS_KEYS.all, 'timeline', id] as const,
  checklist: (id: string) => [...AUDITS_KEYS.all, 'checklist', id] as const,
  findings: (id: string) => [...AUDITS_KEYS.all, 'findings', id] as const,
  evidences: (id: string) => [...AUDITS_KEYS.all, 'evidences', id] as const,
  suggestions: (id: string) => [...AUDITS_KEYS.all, 'suggestions', id] as const,
  templates: () => [...AUDITS_KEYS.all, 'templates'] as const,
  compliance: (id: string) => [...AUDITS_KEYS.all, 'compliance', id] as const,
}

export function useAuditDashboard() {
  return useQuery({
    queryKey: AUDITS_KEYS.dashboard(),
    queryFn: () => auditsService.dashboard(),
    staleTime: 60_000,
  })
}

export function useAudits(params: AuditSearchParams = {}) {
  return useQuery({
    queryKey: AUDITS_KEYS.list(params),
    queryFn: () => auditsService.list(params),
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  })
}

export function useAudit(id: string | null) {
  return useQuery({
    queryKey: AUDITS_KEYS.detail(id ?? ''),
    queryFn: () => auditsService.getById(id!),
    enabled: !!id,
  })
}

export function useAuditTimeline(id: string | null) {
  return useQuery({
    queryKey: AUDITS_KEYS.timeline(id ?? ''),
    queryFn: () => auditsService.getTimeline(id!),
    enabled: !!id,
  })
}

export function useAuditChecklist(id: string | null) {
  return useQuery({
    queryKey: AUDITS_KEYS.checklist(id ?? ''),
    queryFn: () => auditsService.listChecklist(id!),
    enabled: !!id,
  })
}

export function useAuditFindings(id: string | null) {
  return useQuery({
    queryKey: AUDITS_KEYS.findings(id ?? ''),
    queryFn: () => auditsService.listFindings(id!),
    enabled: !!id,
  })
}

export function useAuditEvidences(id: string | null) {
  return useQuery({
    queryKey: AUDITS_KEYS.evidences(id ?? ''),
    queryFn: () => auditsService.listEvidences(id!),
    enabled: !!id,
  })
}

export function useAuditSuggestions(id: string | null) {
  return useQuery({
    queryKey: AUDITS_KEYS.suggestions(id ?? ''),
    queryFn: () => auditsService.listSuggestions(id!),
    enabled: !!id,
  })
}

export function useAuditTemplates(params?: { iso?: string }) {
  return useQuery({
    queryKey: [...AUDITS_KEYS.templates(), params],
    queryFn: () => auditsService.listTemplates(params),
    staleTime: 5 * 60_000,
  })
}

export function useComplianceBreakdown(id: string | null) {
  return useQuery({
    queryKey: AUDITS_KEYS.compliance(id ?? ''),
    queryFn: () => auditsService.getComplianceBreakdown(id!),
    enabled: !!id,
  })
}

export function useCreateAudit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: AuditCreateRequest) => auditsService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: AUDITS_KEYS.lists() }),
  })
}

export function useCreateAuditFromTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: AuditFromTemplateRequest) => auditsService.createFromTemplate(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: AUDITS_KEYS.lists() }),
  })
}

export function useUpdateAudit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AuditUpdateRequest }) =>
      auditsService.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: AUDITS_KEYS.detail(id) })
      qc.invalidateQueries({ queryKey: AUDITS_KEYS.lists() })
    },
  })
}

export function useDeleteAudit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => auditsService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: AUDITS_KEYS.lists() }),
  })
}

export function useChangeAuditStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AuditStatusChangeRequest }) =>
      auditsService.changeStatus(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: AUDITS_KEYS.detail(id) })
      qc.invalidateQueries({ queryKey: AUDITS_KEYS.lists() })
      qc.invalidateQueries({ queryKey: AUDITS_KEYS.timeline(id) })
    },
  })
}

export function useRecordChecklistResponse() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      auditId,
      checklistId,
      data,
    }: {
      auditId: string
      checklistId: string
      data: ChecklistResponseUpsert
    }) => auditsService.recordResponse(auditId, checklistId, data),
    onSuccess: (_, { auditId }) => {
      qc.invalidateQueries({ queryKey: AUDITS_KEYS.checklist(auditId) })
      qc.invalidateQueries({ queryKey: AUDITS_KEYS.compliance(auditId) })
      qc.invalidateQueries({ queryKey: AUDITS_KEYS.detail(auditId) })
    },
  })
}

export function useCreateFinding() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ auditId, data }: { auditId: string; data: FindingCreateRequest }) =>
      auditsService.createFinding(auditId, data),
    onSuccess: (_, { auditId }) => {
      qc.invalidateQueries({ queryKey: AUDITS_KEYS.findings(auditId) })
      qc.invalidateQueries({ queryKey: AUDITS_KEYS.detail(auditId) })
    },
  })
}

export function useUpdateFinding() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      auditId,
      findingId,
      data,
    }: {
      auditId: string
      findingId: string
      data: FindingUpdateRequest
    }) => auditsService.updateFinding(auditId, findingId, data),
    onSuccess: (_, { auditId }) =>
      qc.invalidateQueries({ queryKey: AUDITS_KEYS.findings(auditId) }),
  })
}

export function useCreateActionPlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      auditId,
      findingId,
      data,
    }: {
      auditId: string
      findingId: string
      data: ActionPlanCreateRequest
    }) => auditsService.createActionPlan(auditId, findingId, data),
    onSuccess: (_, { auditId }) =>
      qc.invalidateQueries({ queryKey: AUDITS_KEYS.findings(auditId) }),
  })
}

export function useUploadEvidence() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      auditId,
      file,
      findingId,
    }: {
      auditId: string
      file: File
      findingId?: string
    }) => auditsService.uploadEvidence(auditId, file, findingId),
    onSuccess: (_, { auditId }) =>
      qc.invalidateQueries({ queryKey: AUDITS_KEYS.evidences(auditId) }),
  })
}

export function useAddDocumentEvidence() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ auditId, data }: { auditId: string; data: EvidenceDocumentRefRequest }) =>
      auditsService.addDocumentEvidence(auditId, data),
    onSuccess: (_, { auditId }) =>
      qc.invalidateQueries({ queryKey: AUDITS_KEYS.evidences(auditId) }),
  })
}

export function useAddUrlEvidence() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ auditId, data }: { auditId: string; data: EvidenceUrlRequest }) =>
      auditsService.addUrlEvidence(auditId, data),
    onSuccess: (_, { auditId }) =>
      qc.invalidateQueries({ queryKey: AUDITS_KEYS.evidences(auditId) }),
  })
}

export function useGenerateSuggestions() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ auditId, data }: { auditId: string; data: GenerateSuggestionsRequest }) =>
      auditsService.generateSuggestions(auditId, data),
    onSuccess: (_, { auditId }) =>
      qc.invalidateQueries({ queryKey: AUDITS_KEYS.suggestions(auditId) }),
  })
}

export function useApproveSuggestion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      auditId,
      suggestionId,
      data,
    }: {
      auditId: string
      suggestionId: string
      data: ApproveSuggestionRequest
    }) => auditsService.approveSuggestion(auditId, suggestionId, data),
    onSuccess: (_, { auditId }) => {
      qc.invalidateQueries({ queryKey: AUDITS_KEYS.suggestions(auditId) })
      qc.invalidateQueries({ queryKey: AUDITS_KEYS.findings(auditId) })
    },
  })
}

export function useDiscardSuggestion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      auditId,
      suggestionId,
      data,
    }: {
      auditId: string
      suggestionId: string
      data: DiscardSuggestionRequest
    }) => auditsService.discardSuggestion(auditId, suggestionId, data),
    onSuccess: (_, { auditId }) =>
      qc.invalidateQueries({ queryKey: AUDITS_KEYS.suggestions(auditId) }),
  })
}

export function useConvertSuggestion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      auditId,
      suggestionId,
      data,
    }: {
      auditId: string
      suggestionId: string
      data: ConvertActionRequest
    }) => auditsService.convertSuggestion(auditId, suggestionId, data),
    onSuccess: (_, { auditId }) => {
      qc.invalidateQueries({ queryKey: AUDITS_KEYS.suggestions(auditId) })
      qc.invalidateQueries({ queryKey: AUDITS_KEYS.findings(auditId) })
      qc.invalidateQueries({ queryKey: AUDITS_KEYS.detail(auditId) })
    },
  })
}
