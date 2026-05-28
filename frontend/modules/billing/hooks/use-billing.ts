'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { BillingService } from '../services/billing.service'
import { PlanId, BillingCycle } from '../types'

export const BILLING_KEYS = {
  subscription: ['billing-subscription'] as const,
  usage: ['billing-usage'] as const,
  history: ['billing-history'] as const,
  plans: ['billing-plans'] as const,
}

export function usePlans() {
  return useQuery({
    queryKey: BILLING_KEYS.plans,
    queryFn: () => BillingService.getPlans(),
    staleTime: Infinity,
  })
}

export function useSubscription() {
  return useQuery({
    queryKey: BILLING_KEYS.subscription,
    queryFn: () => BillingService.getSubscription(),
    staleTime: 0,
  })
}

export function useUsage() {
  return useQuery({
    queryKey: BILLING_KEYS.usage,
    queryFn: () => BillingService.getUsage(),
    staleTime: 30_000,
  })
}

export function useUsageHistory() {
  return useQuery({
    queryKey: BILLING_KEYS.history,
    queryFn: () => BillingService.getUsageHistory(),
    staleTime: Infinity,
  })
}

export function useChangePlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ planId, cycle }: { planId: PlanId; cycle: BillingCycle }) =>
      BillingService.changePlan(planId, cycle),
    onSuccess: () => qc.invalidateQueries({ queryKey: BILLING_KEYS.subscription }),
  })
}

export function useCancelSubscription() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => BillingService.cancelSubscription(),
    onSuccess: () => qc.invalidateQueries({ queryKey: BILLING_KEYS.subscription }),
  })
}
