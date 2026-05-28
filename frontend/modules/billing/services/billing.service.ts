'use client'

import { PlanDef, PlanId, Subscription, UsagePeriod, UsageHistory, BillingCycle } from '../types'

export const PLANS: PlanDef[] = [
  {
    id: 'starter',
    name: 'Starter',
    tagline: 'Para empresas que comienzan su transformación digital',
    priceMonthly: 49,
    priceAnnual: 470,
    currency: 'USD',
    limits: {
      users: 5,
      storageMb: 2048,
      automations: 3,
      documents: 200,
      reports: 5,
      auditTemplates: 3,
      apiAccess: false,
      sso: false,
      supportLevel: 'email',
    },
    features: [
      'Hasta 5 usuarios',
      'Gestión documental básica',
      'Auditorías internas (ISO 9001)',
      'Hasta 3 automatizaciones',
      'Hasta 200 documentos',
      '5 reportes/mes',
      'Soporte por email',
    ],
    notIncluded: ['API access', 'SSO/LDAP', 'Multi-norma', 'Soporte prioritario'],
  },
  {
    id: 'professional',
    name: 'Professional',
    tagline: 'Para equipos SIG que necesitan potencia y flexibilidad',
    priceMonthly: 149,
    priceAnnual: 1430,
    currency: 'USD',
    highlighted: true,
    limits: {
      users: 25,
      storageMb: 20480,
      automations: 20,
      documents: 2000,
      reports: 50,
      auditTemplates: 20,
      apiAccess: true,
      sso: false,
      supportLevel: 'priority',
    },
    features: [
      'Hasta 25 usuarios',
      'Gestión documental avanzada',
      'Multi-norma (ISO 9001, 14001, 45001)',
      'Hasta 20 automatizaciones',
      'Hasta 2.000 documentos',
      '50 reportes/mes',
      'Hallazgos y CAPA avanzados',
      'Analytics y dashboards',
      'API REST acceso completo',
      'Soporte prioritario (< 4h)',
    ],
    notIncluded: ['SSO/LDAP', 'SLA garantizado'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    tagline: 'Para organizaciones que exigen control total y escala ilimitada',
    priceMonthly: 399,
    priceAnnual: 3830,
    currency: 'USD',
    limits: {
      users: -1,
      storageMb: 204800,
      automations: -1,
      documents: -1,
      reports: -1,
      auditTemplates: -1,
      apiAccess: true,
      sso: true,
      supportLevel: 'dedicated',
    },
    features: [
      'Usuarios ilimitados',
      'Storage 200 GB',
      'Automatizaciones ilimitadas',
      'Documentos ilimitados',
      'Reportes ilimitados',
      'Multi-norma completo',
      'SSO / LDAP / Active Directory',
      'API REST + Webhooks',
      'Onboarding dedicado',
      'Soporte 24/7 con SLA garantizado',
      'Custom branding',
    ],
  },
]

export function getPlan(id: PlanId): PlanDef {
  return PLANS.find((p) => p.id === id) ?? PLANS[1]
}

export function getPrice(plan: PlanDef, cycle: BillingCycle): number {
  return cycle === 'annual' ? plan.priceAnnual : plan.priceMonthly * 12
}

export function getMonthlyEquivalent(plan: PlanDef, cycle: BillingCycle): number {
  return cycle === 'annual'
    ? Math.round(plan.priceAnnual / 12)
    : plan.priceMonthly
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const SUBSCRIPTION_KEY = 'sig_subscription'
const USAGE_KEY = 'sig_usage'

const MOCK_SUBSCRIPTION: Subscription = {
  id: 'sub_demo001',
  planId: 'professional',
  status: 'active',
  billingCycle: 'monthly',
  currentPeriodStart: '2026-05-01T00:00:00Z',
  currentPeriodEnd: '2026-06-01T00:00:00Z',
  cancelAtPeriodEnd: false,
  lastFour: '4242',
  cardBrand: 'Visa',
}

const MOCK_USAGE: UsagePeriod = {
  periodStart: '2026-05-01T00:00:00Z',
  periodEnd: '2026-06-01T00:00:00Z',
  usersCount: 8,
  documentsCount: 247,
  auditsCount: 11,
  automationRuns: 143,
  reportsGenerated: 12,
  storageUsedMb: 4800,
}

const MOCK_HISTORY: UsageHistory[] = [
  { month: 'Dic 2025', documents: 180, audits: 7, storageGb: 2.1, automations: 95 },
  { month: 'Ene 2026', documents: 198, audits: 9, storageGb: 2.8, automations: 108 },
  { month: 'Feb 2026', documents: 210, audits: 8, storageGb: 3.2, automations: 121 },
  { month: 'Mar 2026', documents: 223, audits: 11, storageGb: 3.8, automations: 134 },
  { month: 'Abr 2026', documents: 237, audits: 10, storageGb: 4.4, automations: 139 },
  { month: 'May 2026', documents: 247, audits: 11, storageGb: 4.7, automations: 143 },
]

export const BillingService = {
  getPlans: () => PLANS,

  getSubscription(): Subscription {
    if (typeof window === 'undefined') return MOCK_SUBSCRIPTION
    try {
      const raw = localStorage.getItem(SUBSCRIPTION_KEY)
      return raw ? JSON.parse(raw) : MOCK_SUBSCRIPTION
    } catch { return MOCK_SUBSCRIPTION }
  },

  setSubscription(sub: Subscription): void {
    if (typeof window !== 'undefined') localStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(sub))
  },

  changePlan(planId: PlanId, cycle: BillingCycle): Subscription {
    const current = this.getSubscription()
    const updated: Subscription = { ...current, planId, billingCycle: cycle }
    this.setSubscription(updated)
    return updated
  },

  cancelSubscription(): Subscription {
    const current = this.getSubscription()
    const updated: Subscription = { ...current, cancelAtPeriodEnd: true }
    this.setSubscription(updated)
    return updated
  },

  getUsage(): UsagePeriod {
    if (typeof window === 'undefined') return MOCK_USAGE
    try {
      const raw = localStorage.getItem(USAGE_KEY)
      return raw ? JSON.parse(raw) : MOCK_USAGE
    } catch { return MOCK_USAGE }
  },

  getUsageHistory(): UsageHistory[] {
    return MOCK_HISTORY
  },

  getLimits(planId: PlanId): PlanDef['limits'] {
    return getPlan(planId).limits
  },

  checkLimit(planId: PlanId, resource: keyof UsagePeriod, current: number): {
    limit: number; pct: number; exceeded: boolean; warning: boolean
  } {
    const limits = this.getLimits(planId)
    const limitMap: Partial<Record<keyof UsagePeriod, number>> = {
      usersCount: limits.users,
      documentsCount: limits.documents,
      automationRuns: limits.automations,
      reportsGenerated: limits.reports,
      storageUsedMb: limits.storageMb,
    }
    const limit = limitMap[resource] ?? -1
    if (limit === -1) return { limit: -1, pct: 0, exceeded: false, warning: false }
    const pct = Math.round((current / limit) * 100)
    return { limit, pct, exceeded: pct >= 100, warning: pct >= 80 }
  },
}
