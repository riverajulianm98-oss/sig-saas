import api from '@/lib/axios'
import type {
  ExecutiveSummary,
  AnalyticsTrends,
  ProcessRisk,
  ClauseScore,
  AiInsight,
  ReportGenerateRequest,
} from '@/types/analytics'

export const analyticsService = {
  getExecutiveSummary: () =>
    api.get<ExecutiveSummary>('/analytics/executive').then((r) => r.data),

  getTrends: () =>
    api.get<AnalyticsTrends>('/analytics/trends').then((r) => r.data),

  getProcessHeatmap: () =>
    api.get<ProcessRisk[]>('/analytics/process-heatmap').then((r) => r.data),

  getClauseScores: () =>
    api.get<ClauseScore[]>('/analytics/clause-scores').then((r) => r.data),

  getInsights: () =>
    api.get<AiInsight[]>('/analytics/insights').then((r) => r.data),

  generateReport: (req: ReportGenerateRequest) =>
    api.post<{ url: string; filename: string }>('/reports/generate', req).then((r) => r.data),
}
