'use client'

import { useMemo } from 'react'
import { useSubscription, useUsage } from './use-billing'
import { BillingService, getPlan } from '../services/billing.service'
import { PlanId } from '../types'

export interface LimitCheck {
  limit: number
  used: number
  pct: number
  exceeded: boolean
  warning: boolean
  unlimited: boolean
}

export interface PlanLimits {
  users: LimitCheck
  documents: LimitCheck
  automations: LimitCheck
  reports: LimitCheck
  storage: LimitCheck
  canAccessApi: boolean
  canAccessSso: boolean
  planId: PlanId | null
  isLoading: boolean
}

function makeLimitCheck(used: number, limit: number): LimitCheck {
  if (limit === -1) return { limit, used, pct: 0, exceeded: false, warning: false, unlimited: true }
  const pct = Math.min(100, Math.round((used / limit) * 100))
  return { limit, used, pct, exceeded: pct >= 100, warning: pct >= 80, unlimited: false }
}

export function usePlanLimits(): PlanLimits {
  const { data: sub, isLoading: subLoading } = useSubscription()
  const { data: usage, isLoading: usageLoading } = useUsage()

  return useMemo(() => {
    const isLoading = subLoading || usageLoading
    if (!sub || !usage) {
      return {
        users: makeLimitCheck(0, 0),
        documents: makeLimitCheck(0, 0),
        automations: makeLimitCheck(0, 0),
        reports: makeLimitCheck(0, 0),
        storage: makeLimitCheck(0, 0),
        canAccessApi: false,
        canAccessSso: false,
        planId: null,
        isLoading,
      }
    }
    const plan = getPlan(sub.planId)
    const lim = plan.limits
    return {
      users: makeLimitCheck(usage.usersCount, lim.users),
      documents: makeLimitCheck(usage.documentsCount, lim.documents),
      automations: makeLimitCheck(usage.automationRuns, lim.automations),
      reports: makeLimitCheck(usage.reportsGenerated, lim.reports),
      storage: makeLimitCheck(usage.storageUsedMb, lim.storageMb),
      canAccessApi: lim.apiAccess,
      canAccessSso: lim.sso,
      planId: sub.planId,
      isLoading,
    }
  }, [sub, usage, subLoading, usageLoading])
}
