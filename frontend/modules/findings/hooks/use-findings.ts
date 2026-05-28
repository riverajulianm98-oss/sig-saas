'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { findingsService } from '@/services/findings.service'
import type {
  FindingResponse,
  FindingDetail,
  FindingListResponse,
  FindingSearchParams,
  FindingCreateRequest,
  FindingUpdateRequest,
  CapaCreateRequest,
  CapaUpdateRequest,
  CapaStatusChangeRequest,
  CapaCommentRequest,
} from '@/types/findings'

export const FINDINGS_KEYS = {
  all: ['findings'] as const,
  lists: () => [...FINDINGS_KEYS.all, 'list'] as const,
  list: (params: FindingSearchParams) => [...FINDINGS_KEYS.lists(), params] as const,
  details: () => [...FINDINGS_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...FINDINGS_KEYS.details(), id] as const,
  dashboard: () => [...FINDINGS_KEYS.all, 'dashboard'] as const,
  timeline: (id: string) => [...FINDINGS_KEYS.all, 'timeline', id] as const,
  actions: (id: string) => [...FINDINGS_KEYS.all, 'actions', id] as const,
  capa: ['capa'] as const,
  capaDashboard: () => [...FINDINGS_KEYS.capa, 'dashboard'] as const,
  capaAll: (params?: object) => [...FINDINGS_KEYS.capa, 'actions', params] as const,
}

export function useFindingsDashboard() {
  return useQuery({
    queryKey: FINDINGS_KEYS.dashboard(),
    queryFn: () => findingsService.getDashboard(),
    staleTime: 60_000,
  })
}

export function useFindings(params: FindingSearchParams = {}) {
  return useQuery({
    queryKey: FINDINGS_KEYS.list(params),
    queryFn: () => findingsService.list(params),
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  })
}

export function useFinding(id: string | null) {
  return useQuery({
    queryKey: FINDINGS_KEYS.detail(id ?? ''),
    queryFn: () => findingsService.getById(id!),
    enabled: !!id,
  })
}

export function useFindingTimeline(id: string | null) {
  return useQuery({
    queryKey: FINDINGS_KEYS.timeline(id ?? ''),
    queryFn: () => findingsService.getTimeline(id!),
    enabled: !!id,
    staleTime: 30_000,
  })
}

export function useFindingActions(findingId: string | null) {
  return useQuery({
    queryKey: FINDINGS_KEYS.actions(findingId ?? ''),
    queryFn: () => findingsService.listActions(findingId!),
    enabled: !!findingId,
    staleTime: 30_000,
  })
}

export function useCapaDashboard() {
  return useQuery({
    queryKey: FINDINGS_KEYS.capaDashboard(),
    queryFn: () => findingsService.getCapaDashboard(),
    staleTime: 60_000,
  })
}

export function useAllCapaActions(params?: { status?: string; skip?: number; limit?: number }) {
  return useQuery({
    queryKey: FINDINGS_KEYS.capaAll(params),
    queryFn: () => findingsService.listAllActions(params),
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  })
}

export function useCreateFinding() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: FindingCreateRequest) => findingsService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: FINDINGS_KEYS.lists() })
      qc.invalidateQueries({ queryKey: FINDINGS_KEYS.dashboard() })
    },
  })
}

export function useUpdateFinding(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: FindingUpdateRequest) => findingsService.update(id, data),
    onMutate: async (data) => {
      await qc.cancelQueries({ queryKey: FINDINGS_KEYS.detail(id) })
      const previous = qc.getQueryData<FindingDetail>(FINDINGS_KEYS.detail(id))
      if (previous) {
        qc.setQueryData<FindingDetail>(FINDINGS_KEYS.detail(id), { ...previous, ...data })
      }
      return { previous }
    },
    onError: (_err, _data, ctx) => {
      if (ctx?.previous) qc.setQueryData(FINDINGS_KEYS.detail(id), ctx.previous)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: FINDINGS_KEYS.detail(id) })
      qc.invalidateQueries({ queryKey: FINDINGS_KEYS.lists() })
      qc.invalidateQueries({ queryKey: FINDINGS_KEYS.dashboard() })
    },
  })
}

export function useDeleteFinding() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => findingsService.delete(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: FINDINGS_KEYS.lists() })
      const snapshots = qc.getQueriesData<FindingListResponse>({ queryKey: FINDINGS_KEYS.lists() })
      qc.setQueriesData<FindingListResponse>({ queryKey: FINDINGS_KEYS.lists() }, (old) => {
        if (!old) return old
        return { ...old, items: old.items.filter((f: FindingResponse) => f.id !== id), total: old.total - 1 }
      })
      return { snapshots }
    },
    onError: (_err, _id, ctx) => {
      ctx?.snapshots.forEach(([key, data]) => qc.setQueryData(key, data))
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: FINDINGS_KEYS.lists() })
      qc.invalidateQueries({ queryKey: FINDINGS_KEYS.dashboard() })
    },
  })
}

export function useCreateCapaAction(findingId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CapaCreateRequest) => findingsService.createAction(findingId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: FINDINGS_KEYS.actions(findingId) })
      qc.invalidateQueries({ queryKey: FINDINGS_KEYS.detail(findingId) })
      qc.invalidateQueries({ queryKey: FINDINGS_KEYS.capaDashboard() })
      qc.invalidateQueries({ queryKey: FINDINGS_KEYS.dashboard() })
    },
  })
}

export function useUpdateCapaAction(findingId: string, actionId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CapaUpdateRequest) =>
      findingsService.updateAction(findingId, actionId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: FINDINGS_KEYS.actions(findingId) })
      qc.invalidateQueries({ queryKey: FINDINGS_KEYS.capaDashboard() })
    },
  })
}

export function useChangeCapaStatus(findingId: string, actionId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CapaStatusChangeRequest) =>
      findingsService.changeActionStatus(findingId, actionId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: FINDINGS_KEYS.actions(findingId) })
      qc.invalidateQueries({ queryKey: FINDINGS_KEYS.detail(findingId) })
      qc.invalidateQueries({ queryKey: FINDINGS_KEYS.capaDashboard() })
      qc.invalidateQueries({ queryKey: FINDINGS_KEYS.capaAll() })
      qc.invalidateQueries({ queryKey: FINDINGS_KEYS.dashboard() })
    },
  })
}

export function useAddCapaComment(findingId: string, actionId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CapaCommentRequest) =>
      findingsService.addComment(findingId, actionId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: FINDINGS_KEYS.actions(findingId) })
    },
  })
}
