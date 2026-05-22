import api from '@/lib/axios'
import type {
  FindingListResponse,
  FindingResponse,
  FindingDetail,
  FindingSearchParams,
  FindingCreateRequest,
  FindingUpdateRequest,
  CapaResponse,
  CapaCreateRequest,
  CapaUpdateRequest,
  CapaStatusChangeRequest,
  CapaCommentRequest,
  CapaComment,
  CapaDashboardResponse,
  FindingTimelineEntry,
  FindingsDashboardStats,
} from '@/types/findings'

export const findingsService = {
  getDashboard: () =>
    api.get<FindingsDashboardStats>('/findings/dashboard').then((r) => r.data),

  list: (params?: FindingSearchParams) =>
    api.get<FindingListResponse>('/findings', { params }).then((r) => r.data),

  getById: (id: string) =>
    api.get<FindingDetail>(`/findings/${id}`).then((r) => r.data),

  create: (data: FindingCreateRequest) =>
    api.post<FindingResponse>('/findings', data).then((r) => r.data),

  update: (id: string, data: FindingUpdateRequest) =>
    api.patch<FindingResponse>(`/findings/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    api.delete(`/findings/${id}`).then((r) => r.data),

  getTimeline: (id: string) =>
    api.get<FindingTimelineEntry[]>(`/findings/${id}/timeline`).then((r) => r.data),

  listActions: (findingId: string) =>
    api.get<CapaResponse[]>(`/findings/${findingId}/actions`).then((r) => r.data),

  createAction: (findingId: string, data: CapaCreateRequest) =>
    api.post<CapaResponse>(`/findings/${findingId}/actions`, data).then((r) => r.data),

  updateAction: (findingId: string, actionId: string, data: CapaUpdateRequest) =>
    api
      .patch<CapaResponse>(`/findings/${findingId}/actions/${actionId}`, data)
      .then((r) => r.data),

  changeActionStatus: (
    findingId: string,
    actionId: string,
    data: CapaStatusChangeRequest,
  ) =>
    api
      .patch<CapaResponse>(`/findings/${findingId}/actions/${actionId}/status`, data)
      .then((r) => r.data),

  addComment: (findingId: string, actionId: string, data: CapaCommentRequest) =>
    api
      .post<CapaComment>(`/findings/${findingId}/actions/${actionId}/comments`, data)
      .then((r) => r.data),

  getCapaDashboard: () =>
    api.get<CapaDashboardResponse>('/capa/dashboard').then((r) => r.data),

  listAllActions: (params?: { status?: string; skip?: number; limit?: number }) =>
    api
      .get<{ items: CapaResponse[]; total: number }>('/capa/actions', { params })
      .then((r) => r.data),
}
