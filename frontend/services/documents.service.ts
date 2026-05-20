import apiClient from '@/lib/axios'
import type {
  Document,
  DocumentCreateRequest,
  DocumentDetail,
  DocumentListResponse,
  DocumentSearchParams,
  DocumentStatusChangeRequest,
  DocumentTimelineResponse,
  DocumentUpdateRequest,
  DocumentVersionCreateRequest,
  DocumentAlertsResponse,
  DownloadUrlResponse,
} from '@/types/documents'

export const documentsService = {
  async list(params: DocumentSearchParams = {}): Promise<DocumentListResponse> {
    const res = await apiClient.get<DocumentListResponse>('/documents', { params })
    return res.data
  },

  async search(params: DocumentSearchParams = {}): Promise<DocumentListResponse> {
    const res = await apiClient.get<DocumentListResponse>('/documents/search', { params })
    return res.data
  },

  async getById(id: string): Promise<DocumentDetail> {
    const res = await apiClient.get<DocumentDetail>(`/documents/${id}`)
    return res.data
  },

  async create(data: DocumentCreateRequest): Promise<DocumentDetail> {
    const res = await apiClient.post<DocumentDetail>('/documents', data)
    return res.data
  },

  async update(id: string, data: DocumentUpdateRequest): Promise<DocumentDetail> {
    const res = await apiClient.patch<DocumentDetail>(`/documents/${id}`, data)
    return res.data
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/documents/${id}`)
  },

  async changeStatus(id: string, data: DocumentStatusChangeRequest): Promise<DocumentDetail> {
    const res = await apiClient.post<DocumentDetail>(`/documents/${id}/status`, data)
    return res.data
  },

  async addVersion(id: string, data: DocumentVersionCreateRequest): Promise<DocumentDetail> {
    const res = await apiClient.post<DocumentDetail>(`/documents/${id}/versions`, data)
    return res.data
  },

  async uploadFile(
    documentId: string,
    versionId: string,
    file: File,
    onProgress?: (pct: number) => void
  ): Promise<void> {
    const form = new FormData()
    form.append('file', file)
    await apiClient.post(`/documents/${documentId}/versions/${versionId}/upload`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100))
      },
    })
  },

  async getDownloadUrl(documentId: string, versionId: string): Promise<DownloadUrlResponse> {
    const res = await apiClient.get<DownloadUrlResponse>(
      `/documents/${documentId}/versions/${versionId}/download-url`
    )
    return res.data
  },

  async getTimeline(id: string, skip = 0, limit = 50): Promise<DocumentTimelineResponse> {
    const res = await apiClient.get<DocumentTimelineResponse>(`/documents/${id}/timeline`, {
      params: { skip, limit },
    })
    return res.data
  },

  async getAlerts(): Promise<DocumentAlertsResponse> {
    const res = await apiClient.get<DocumentAlertsResponse>('/documents/alerts')
    return res.data
  },
}
