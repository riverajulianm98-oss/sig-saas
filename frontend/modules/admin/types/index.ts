export type PlanType = 'starter' | 'professional' | 'enterprise'
export type CompanyStatus = 'active' | 'trial' | 'inactive' | 'suspended'
export type UserStatus = 'active' | 'inactive'
export type LogLevel = 'info' | 'warning' | 'error'
export type BillingStatus = 'paid' | 'pending' | 'failed' | 'refunded'

export interface Company {
  id: string
  name: string
  slug: string
  plan: PlanType
  status: CompanyStatus
  adminEmail: string
  adminName: string
  industry: string
  country: string
  userCount: number
  documentCount: number
  auditCount: number
  automationCount: number
  storageUsedMb: number
  createdAt: string
  lastActiveAt: string
  trialEndsAt?: string
}

export interface Plan {
  id: PlanType
  name: string
  priceMonthly: number
  priceAnnual: number
  currency: 'USD'
  limits: {
    users: number
    storageMb: number
    automations: number
    documents: number
  }
  features: string[]
  highlighted?: boolean
}

export interface AdminUser {
  id: string
  name: string
  email: string
  role: string
  companyId: string
  companyName: string
  status: UserStatus
  lastLoginAt: string
  createdAt: string
}

export interface BillingRecord {
  id: string
  companyId: string
  companyName: string
  plan: PlanType
  amount: number
  currency: 'USD'
  status: BillingStatus
  period: string
  invoiceDate: string
  dueDate: string
}

export interface SystemLog {
  id: string
  level: LogLevel
  action: string
  entity: string
  companyId?: string
  companyName?: string
  userId?: string
  userName?: string
  message: string
  timestamp: string
}

export interface GlobalStats {
  totalCompanies: number
  activeCompanies: number
  trialCompanies: number
  suspendedCompanies: number
  totalUsers: number
  totalDocuments: number
  totalAudits: number
  totalStorageGb: number
  mrrUsd: number
  arrUsd: number
  newCompaniesThisMonth: number
  companiesByPlan: Record<PlanType, number>
}

export interface CompanyFormData {
  name: string
  adminName: string
  adminEmail: string
  plan: PlanType
  industry: string
  country: string
}
