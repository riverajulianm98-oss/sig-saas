import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '@/services/dashboard.service'

export function useAuditDashboard() {
  return useQuery({
    queryKey: ['audit-dashboard'],
    queryFn: dashboardService.getAuditDashboard,
    staleTime: 1000 * 60 * 5,
  })
}
