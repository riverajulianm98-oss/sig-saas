'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AdminService } from '../services/admin.service'
import { Company, CompanyFormData } from '../types'

export const ADMIN_KEYS = {
  companies: ['admin-companies'] as const,
  company: (id: string) => ['admin-company', id] as const,
  users: (companyId?: string) => ['admin-users', companyId ?? 'all'] as const,
  plans: ['admin-plans'] as const,
  billing: (companyId?: string) => ['admin-billing', companyId ?? 'all'] as const,
  logs: (level?: string, companyId?: string) => ['admin-logs', level ?? 'all', companyId ?? 'all'] as const,
  stats: ['admin-stats'] as const,
}

export function useAdminStats() {
  return useQuery({
    queryKey: ADMIN_KEYS.stats,
    queryFn: () => AdminService.getStats(),
    staleTime: 30_000,
  })
}

export function useCompanies() {
  return useQuery({
    queryKey: ADMIN_KEYS.companies,
    queryFn: () => AdminService.getCompanies(),
    staleTime: 0,
  })
}

export function useCompany(id: string) {
  return useQuery({
    queryKey: ADMIN_KEYS.company(id),
    queryFn: () => AdminService.getCompany(id),
  })
}

export function useCreateCompany() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: CompanyFormData) => AdminService.createCompany(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ADMIN_KEYS.companies })
      qc.invalidateQueries({ queryKey: ADMIN_KEYS.stats })
      qc.invalidateQueries({ queryKey: ADMIN_KEYS.users() })
      qc.invalidateQueries({ queryKey: ADMIN_KEYS.logs() })
    },
  })
}

export function useUpdateCompany() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Company> }) =>
      AdminService.updateCompany(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ADMIN_KEYS.companies })
      qc.invalidateQueries({ queryKey: ADMIN_KEYS.stats })
    },
  })
}

export function useSetCompanyStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Company['status'] }) =>
      AdminService.setCompanyStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ADMIN_KEYS.companies })
      qc.invalidateQueries({ queryKey: ADMIN_KEYS.stats })
      qc.invalidateQueries({ queryKey: ADMIN_KEYS.logs() })
    },
  })
}

export function useDeleteCompany() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => AdminService.deleteCompany(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ADMIN_KEYS.companies })
      qc.invalidateQueries({ queryKey: ADMIN_KEYS.users() })
      qc.invalidateQueries({ queryKey: ADMIN_KEYS.stats })
    },
  })
}

export function useAdminUsers(companyId?: string) {
  return useQuery({
    queryKey: ADMIN_KEYS.users(companyId),
    queryFn: () => AdminService.getUsers(companyId),
    staleTime: 0,
  })
}

export function useToggleUserStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => AdminService.toggleUserStatus(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ADMIN_KEYS.users() })
    },
  })
}

export function useAdminPlans() {
  return useQuery({
    queryKey: ADMIN_KEYS.plans,
    queryFn: () => AdminService.getPlans(),
    staleTime: Infinity,
  })
}

export function useAdminBilling(companyId?: string) {
  return useQuery({
    queryKey: ADMIN_KEYS.billing(companyId),
    queryFn: () => AdminService.getBilling(companyId),
    staleTime: 30_000,
  })
}

export function useSystemLogs(level?: string, companyId?: string) {
  return useQuery({
    queryKey: ADMIN_KEYS.logs(level, companyId),
    queryFn: () => AdminService.getLogs(level, companyId),
    staleTime: 15_000,
    refetchInterval: 30_000,
  })
}
