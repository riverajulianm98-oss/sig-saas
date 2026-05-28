export type PlanId = 'starter' | 'professional' | 'enterprise'
export type BillingCycle = 'monthly' | 'annual'
export type SubscriptionStatus = 'active' | 'trial' | 'past_due' | 'canceled'

export interface PlanDef {
  id: PlanId
  name: string
  tagline: string
  priceMonthly: number
  priceAnnual: number
  currency: 'USD'
  highlighted?: boolean
  limits: PlanLimits
  features: string[]
  notIncluded?: string[]
}

export interface PlanLimits {
  users: number          // -1 = unlimited
  storageMb: number
  automations: number    // -1 = unlimited
  documents: number      // -1 = unlimited
  reports: number        // per month
  auditTemplates: number
  apiAccess: boolean
  sso: boolean
  supportLevel: 'email' | 'priority' | 'dedicated'
}

export interface Subscription {
  id: string
  planId: PlanId
  status: SubscriptionStatus
  billingCycle: BillingCycle
  currentPeriodStart: string
  currentPeriodEnd: string
  trialEndsAt?: string
  cancelAtPeriodEnd: boolean
  lastFour?: string
  cardBrand?: string
}

export interface UsagePeriod {
  periodStart: string
  periodEnd: string
  usersCount: number
  documentsCount: number
  auditsCount: number
  automationRuns: number
  reportsGenerated: number
  storageUsedMb: number
}

export interface UsageHistory {
  month: string
  documents: number
  audits: number
  storageGb: number
  automations: number
}

export interface CheckoutState {
  planId: PlanId
  billingCycle: BillingCycle
  companyName: string
  adminName: string
  adminEmail: string
  password: string
  industry: string
  country: string
  cardNumber: string
  cardName: string
  cardExpiry: string
  cardCvc: string
}
