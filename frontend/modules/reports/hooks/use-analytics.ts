'use client'

import { useQuery, useMutation } from '@tanstack/react-query'
import { analyticsService } from '@/services/analytics.service'
import type { ReportGenerateRequest } from '@/types/analytics'

export const ANALYTICS_KEYS = {
  all: ['analytics'] as const,
  executive: () => [...ANALYTICS_KEYS.all, 'executive'] as const,
  trends: () => [...ANALYTICS_KEYS.all, 'trends'] as const,
  processHeatmap: () => [...ANALYTICS_KEYS.all, 'process-heatmap'] as const,
  clauseScores: () => [...ANALYTICS_KEYS.all, 'clause-scores'] as const,
  insights: () => [...ANALYTICS_KEYS.all, 'insights'] as const,
}

export function useExecutiveSummary() {
  return useQuery({
    queryKey: ANALYTICS_KEYS.executive(),
    queryFn: analyticsService.getExecutiveSummary,
    staleTime: 60_000,
  })
}

export function useAnalyticsTrends() {
  return useQuery({
    queryKey: ANALYTICS_KEYS.trends(),
    queryFn: analyticsService.getTrends,
    staleTime: 5 * 60_000,
  })
}

export function useProcessHeatmap() {
  return useQuery({
    queryKey: ANALYTICS_KEYS.processHeatmap(),
    queryFn: analyticsService.getProcessHeatmap,
    staleTime: 5 * 60_000,
  })
}

export function useClauseScores() {
  return useQuery({
    queryKey: ANALYTICS_KEYS.clauseScores(),
    queryFn: analyticsService.getClauseScores,
    staleTime: 5 * 60_000,
  })
}

export function useAiInsights() {
  return useQuery({
    queryKey: ANALYTICS_KEYS.insights(),
    queryFn: analyticsService.getInsights,
    staleTime: 5 * 60_000,
  })
}

export function useGenerateReport() {
  return useMutation({
    mutationFn: (req: ReportGenerateRequest) => analyticsService.generateReport(req),
  })
}
