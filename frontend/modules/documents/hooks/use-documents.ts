import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query'
import { documentsService } from '@/services/documents.service'
import type {
  Document,
  DocumentDetail,
  DocumentListResponse,
  DocumentSearchParams,
  DocumentCreateRequest,
  DocumentUpdateRequest,
  DocumentStatusChangeRequest,
  DocumentVersionCreateRequest,
} from '@/types/documents'

export const DOCUMENTS_KEYS = {
  all: ['documents'] as const,
  lists: () => [...DOCUMENTS_KEYS.all, 'list'] as const,
  list: (params: DocumentSearchParams) => [...DOCUMENTS_KEYS.lists(), params] as const,
  details: () => [...DOCUMENTS_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...DOCUMENTS_KEYS.details(), id] as const,
  timeline: (id: string) => [...DOCUMENTS_KEYS.all, 'timeline', id] as const,
  alerts: () => [...DOCUMENTS_KEYS.all, 'alerts'] as const,
}

export function useDocuments(params: DocumentSearchParams = {}) {
  return useQuery({
    queryKey: DOCUMENTS_KEYS.list(params),
    queryFn: () => documentsService.search(params),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60,
  })
}

export function useDocument(id: string | null) {
  return useQuery({
    queryKey: DOCUMENTS_KEYS.detail(id ?? ''),
    queryFn: () => documentsService.getById(id!),
    enabled: !!id,
    staleTime: 1000 * 30,
  })
}

export function useDocumentTimeline(id: string | null) {
  return useQuery({
    queryKey: DOCUMENTS_KEYS.timeline(id ?? ''),
    queryFn: () => documentsService.getTimeline(id!),
    enabled: !!id,
    staleTime: 1000 * 60,
  })
}

export function useDocumentAlerts() {
  return useQuery({
    queryKey: DOCUMENTS_KEYS.alerts(),
    queryFn: documentsService.getAlerts,
    staleTime: 1000 * 60 * 5,
  })
}

export function useCreateDocument() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: DocumentCreateRequest) => documentsService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: DOCUMENTS_KEYS.lists() }),
  })
}

export function useUpdateDocument(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: DocumentUpdateRequest) => documentsService.update(id, data),
    onMutate: async (data) => {
      await qc.cancelQueries({ queryKey: DOCUMENTS_KEYS.detail(id) })
      const previous = qc.getQueryData<DocumentDetail>(DOCUMENTS_KEYS.detail(id))
      if (previous) {
        qc.setQueryData<DocumentDetail>(DOCUMENTS_KEYS.detail(id), { ...previous, ...data })
      }
      return { previous }
    },
    onError: (_err, _data, ctx) => {
      if (ctx?.previous) qc.setQueryData(DOCUMENTS_KEYS.detail(id), ctx.previous)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: DOCUMENTS_KEYS.detail(id) })
      qc.invalidateQueries({ queryKey: DOCUMENTS_KEYS.lists() })
    },
  })
}

export function useDeleteDocument() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => documentsService.delete(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: DOCUMENTS_KEYS.lists() })
      const snapshots = qc.getQueriesData<DocumentListResponse>({ queryKey: DOCUMENTS_KEYS.lists() })
      qc.setQueriesData<DocumentListResponse>({ queryKey: DOCUMENTS_KEYS.lists() }, (old) => {
        if (!old) return old
        return { ...old, items: old.items.filter((d: Document) => d.id !== id), total: old.total - 1 }
      })
      return { snapshots }
    },
    onError: (_err, _id, ctx) => {
      ctx?.snapshots.forEach(([key, data]) => qc.setQueryData(key, data))
    },
    onSettled: () => qc.invalidateQueries({ queryKey: DOCUMENTS_KEYS.lists() }),
  })
}

export function useChangeDocumentStatus(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: DocumentStatusChangeRequest) => documentsService.changeStatus(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: DOCUMENTS_KEYS.detail(id) })
      qc.invalidateQueries({ queryKey: DOCUMENTS_KEYS.lists() })
      qc.invalidateQueries({ queryKey: DOCUMENTS_KEYS.alerts() })
    },
  })
}

export function useAddVersion(documentId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: DocumentVersionCreateRequest) =>
      documentsService.addVersion(documentId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: DOCUMENTS_KEYS.detail(documentId) }),
  })
}
