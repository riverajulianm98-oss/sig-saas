import apiClient from '@/lib/axios'
import type { AuditDashboardResponse } from '@/types/dashboard'

export const dashboardService = {
  async getAuditDashboard(): Promise<AuditDashboardResponse> {
    const res = await apiClient.get<AuditDashboardResponse>('/audits/dashboard')
    return res.data
  },
}
