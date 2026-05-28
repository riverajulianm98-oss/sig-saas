'use client'

import {
  Company, Plan, AdminUser, BillingRecord, SystemLog, GlobalStats,
  CompanyFormData, PlanType,
} from '../types'

const COMPANIES_KEY = 'sig_admin_companies'
const USERS_KEY = 'sig_admin_users'
const BILLING_KEY = 'sig_admin_billing'
const LOGS_KEY = 'sig_admin_logs'

function randomId() {
  return Math.random().toString(36).slice(2, 10)
}

// ── Plans (static) ────────────────────────────────────────────────────────────

export const PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    priceMonthly: 49,
    priceAnnual: 470,
    currency: 'USD',
    limits: { users: 5, storageMb: 2048, automations: 3, documents: 200 },
    features: [
      'Hasta 5 usuarios',
      'Gestión documental básica',
      'Auditorías internas',
      'Hasta 3 automatizaciones',
      'Soporte por email',
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    priceMonthly: 149,
    priceAnnual: 1430,
    currency: 'USD',
    highlighted: true,
    limits: { users: 25, storageMb: 20480, automations: 20, documents: 2000 },
    features: [
      'Hasta 25 usuarios',
      'Gestión documental avanzada',
      'Auditorías internas y externas',
      'Hasta 20 automatizaciones',
      'Hallazgos y CAPA',
      'Analytics y reportes',
      'Soporte prioritario',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    priceMonthly: 399,
    priceAnnual: 3830,
    currency: 'USD',
    limits: { users: 999, storageMb: 204800, automations: 999, documents: 99999 },
    features: [
      'Usuarios ilimitados',
      'Almacenamiento 200 GB',
      'Automatizaciones ilimitadas',
      'Multi-norma (ISO 9001, 14001, 45001)',
      'API acceso completo',
      'SSO / LDAP',
      'Soporte dedicado 24/7',
      'SLA garantizado',
    ],
  },
]

// ── Demo data ─────────────────────────────────────────────────────────────────

const DEMO_COMPANIES: Company[] = [
  {
    id: 'co-001',
    name: 'Constructora Andina SAS',
    slug: 'constructora-andina',
    plan: 'enterprise',
    status: 'active',
    adminEmail: 'admin@constructoraandina.com',
    adminName: 'Carlos Mora',
    industry: 'Construccion',
    country: 'Colombia',
    userCount: 45,
    documentCount: 312,
    auditCount: 28,
    automationCount: 14,
    storageUsedMb: 18400,
    createdAt: '2024-03-15T09:00:00Z',
    lastActiveAt: '2026-05-22T08:30:00Z',
  },
  {
    id: 'co-002',
    name: 'Lacteos del Valle SA',
    slug: 'lacteos-del-valle',
    plan: 'professional',
    status: 'active',
    adminEmail: 'admin@lacteosvalle.com',
    adminName: 'Maria Jimenez',
    industry: 'Alimentos y Bebidas',
    country: 'Colombia',
    userCount: 18,
    documentCount: 145,
    auditCount: 11,
    automationCount: 7,
    storageUsedMb: 5200,
    createdAt: '2024-06-01T10:00:00Z',
    lastActiveAt: '2026-05-22T07:15:00Z',
  },
  {
    id: 'co-003',
    name: 'Servicios HSEQ Colombia',
    slug: 'hseq-colombia',
    plan: 'starter',
    status: 'trial',
    adminEmail: 'admin@hseqcolombia.com',
    adminName: 'Andres Perez',
    industry: 'Consultoria',
    country: 'Colombia',
    userCount: 4,
    documentCount: 23,
    auditCount: 2,
    automationCount: 1,
    storageUsedMb: 320,
    createdAt: '2026-05-14T11:00:00Z',
    lastActiveAt: '2026-05-21T16:45:00Z',
    trialEndsAt: '2026-05-30T23:59:59Z',
  },
  {
    id: 'co-004',
    name: 'Textiles Medellin SAS',
    slug: 'textiles-medellin',
    plan: 'professional',
    status: 'active',
    adminEmail: 'admin@textilesmedellin.com',
    adminName: 'Laura Gomez',
    industry: 'Manufactura',
    country: 'Colombia',
    userCount: 22,
    documentCount: 198,
    auditCount: 17,
    automationCount: 9,
    storageUsedMb: 8750,
    createdAt: '2024-09-10T08:00:00Z',
    lastActiveAt: '2026-05-22T06:00:00Z',
  },
  {
    id: 'co-005',
    name: 'Farmaceutica Colombia SA',
    slug: 'farmacol',
    plan: 'enterprise',
    status: 'active',
    adminEmail: 'admin@farmacol.com',
    adminName: 'Roberto Diaz',
    industry: 'Farmaceutica',
    country: 'Colombia',
    userCount: 87,
    documentCount: 1240,
    auditCount: 64,
    automationCount: 31,
    storageUsedMb: 98600,
    createdAt: '2023-11-01T09:00:00Z',
    lastActiveAt: '2026-05-22T09:00:00Z',
  },
]

const DEMO_USERS: AdminUser[] = [
  { id: 'u-001', name: 'Carlos Mora', email: 'admin@constructoraandina.com', role: 'admin_empresa', companyId: 'co-001', companyName: 'Constructora Andina SAS', status: 'active', lastLoginAt: '2026-05-22T08:30:00Z', createdAt: '2024-03-15T09:00:00Z' },
  { id: 'u-002', name: 'Sofia Ruiz', email: 'sofia.ruiz@constructoraandina.com', role: 'coordinador_sig', companyId: 'co-001', companyName: 'Constructora Andina SAS', status: 'active', lastLoginAt: '2026-05-22T07:00:00Z', createdAt: '2024-03-16T10:00:00Z' },
  { id: 'u-003', name: 'Maria Jimenez', email: 'admin@lacteosvalle.com', role: 'admin_empresa', companyId: 'co-002', companyName: 'Lacteos del Valle SA', status: 'active', lastLoginAt: '2026-05-22T07:15:00Z', createdAt: '2024-06-01T10:00:00Z' },
  { id: 'u-004', name: 'Jorge Castillo', email: 'jorge@lacteosvalle.com', role: 'lider_proceso', companyId: 'co-002', companyName: 'Lacteos del Valle SA', status: 'active', lastLoginAt: '2026-05-21T14:00:00Z', createdAt: '2024-06-05T09:00:00Z' },
  { id: 'u-005', name: 'Andres Perez', email: 'admin@hseqcolombia.com', role: 'admin_empresa', companyId: 'co-003', companyName: 'Servicios HSEQ Colombia', status: 'active', lastLoginAt: '2026-05-21T16:45:00Z', createdAt: '2026-05-14T11:00:00Z' },
  { id: 'u-006', name: 'Laura Gomez', email: 'admin@textilesmedellin.com', role: 'admin_empresa', companyId: 'co-004', companyName: 'Textiles Medellin SAS', status: 'active', lastLoginAt: '2026-05-22T06:00:00Z', createdAt: '2024-09-10T08:00:00Z' },
  { id: 'u-007', name: 'Pedro Herrera', email: 'pedro@textilesmedellin.com', role: 'coordinador_sig', companyId: 'co-004', companyName: 'Textiles Medellin SAS', status: 'inactive', lastLoginAt: '2026-04-15T10:00:00Z', createdAt: '2024-09-12T09:00:00Z' },
  { id: 'u-008', name: 'Roberto Diaz', email: 'admin@farmacol.com', role: 'admin_empresa', companyId: 'co-005', companyName: 'Farmaceutica Colombia SA', status: 'active', lastLoginAt: '2026-05-22T09:00:00Z', createdAt: '2023-11-01T09:00:00Z' },
  { id: 'u-009', name: 'Ana Martinez', email: 'ana@farmacol.com', role: 'coordinador_sig', companyId: 'co-005', companyName: 'Farmaceutica Colombia SA', status: 'active', lastLoginAt: '2026-05-22T08:00:00Z', createdAt: '2023-11-05T10:00:00Z' },
]

const DEMO_BILLING: BillingRecord[] = [
  { id: 'inv-001', companyId: 'co-001', companyName: 'Constructora Andina SAS', plan: 'enterprise', amount: 399, currency: 'USD', status: 'paid', period: 'Mayo 2026', invoiceDate: '2026-05-01', dueDate: '2026-05-08' },
  { id: 'inv-002', companyId: 'co-002', companyName: 'Lacteos del Valle SA', plan: 'professional', amount: 149, currency: 'USD', status: 'paid', period: 'Mayo 2026', invoiceDate: '2026-05-01', dueDate: '2026-05-08' },
  { id: 'inv-003', companyId: 'co-004', companyName: 'Textiles Medellin SAS', plan: 'professional', amount: 149, currency: 'USD', status: 'pending', period: 'Mayo 2026', invoiceDate: '2026-05-01', dueDate: '2026-05-31' },
  { id: 'inv-004', companyId: 'co-005', companyName: 'Farmaceutica Colombia SA', plan: 'enterprise', amount: 399, currency: 'USD', status: 'paid', period: 'Mayo 2026', invoiceDate: '2026-05-01', dueDate: '2026-05-08' },
  { id: 'inv-005', companyId: 'co-001', companyName: 'Constructora Andina SAS', plan: 'enterprise', amount: 399, currency: 'USD', status: 'paid', period: 'Abril 2026', invoiceDate: '2026-04-01', dueDate: '2026-04-08' },
  { id: 'inv-006', companyId: 'co-002', companyName: 'Lacteos del Valle SA', plan: 'professional', amount: 149, currency: 'USD', status: 'paid', period: 'Abril 2026', invoiceDate: '2026-04-01', dueDate: '2026-04-08' },
  { id: 'inv-007', companyId: 'co-005', companyName: 'Farmaceutica Colombia SA', plan: 'enterprise', amount: 399, currency: 'USD', status: 'paid', period: 'Abril 2026', invoiceDate: '2026-04-01', dueDate: '2026-04-08' },
  { id: 'inv-008', companyId: 'co-004', companyName: 'Textiles Medellin SAS', plan: 'professional', amount: 149, currency: 'USD', status: 'failed', period: 'Marzo 2026', invoiceDate: '2026-03-01', dueDate: '2026-03-08' },
]

const DEMO_LOGS: SystemLog[] = [
  { id: 'log-001', level: 'info', action: 'LOGIN', entity: 'user', companyId: 'co-005', companyName: 'Farmaceutica Colombia SA', userId: 'u-008', userName: 'Roberto Diaz', message: 'Inicio de sesion exitoso', timestamp: '2026-05-22T09:00:00Z' },
  { id: 'log-002', level: 'info', action: 'DOCUMENT_CREATED', entity: 'document', companyId: 'co-005', companyName: 'Farmaceutica Colombia SA', userId: 'u-009', userName: 'Ana Martinez', message: 'Documento POE-2026-0041 creado', timestamp: '2026-05-22T08:45:00Z' },
  { id: 'log-003', level: 'warning', action: 'TRIAL_EXPIRING', entity: 'company', companyId: 'co-003', companyName: 'Servicios HSEQ Colombia', message: 'Trial vence en 8 dias', timestamp: '2026-05-22T08:00:00Z' },
  { id: 'log-004', level: 'info', action: 'WORKFLOW_EXECUTED', entity: 'workflow', companyId: 'co-001', companyName: 'Constructora Andina SAS', message: 'Automatizacion "Alerta documento por vencer" ejecutada exitosamente', timestamp: '2026-05-22T07:30:00Z' },
  { id: 'log-005', level: 'error', action: 'PAYMENT_FAILED', entity: 'billing', companyId: 'co-004', companyName: 'Textiles Medellin SAS', message: 'Pago rechazado: tarjeta declinada — factura INV-008', timestamp: '2026-05-22T07:00:00Z' },
  { id: 'log-006', level: 'info', action: 'AUDIT_COMPLETED', entity: 'audit', companyId: 'co-002', companyName: 'Lacteos del Valle SA', message: 'Auditoria AUD-2026-018 marcada como completada', timestamp: '2026-05-22T06:30:00Z' },
  { id: 'log-007', level: 'info', action: 'USER_CREATED', entity: 'user', companyId: 'co-001', companyName: 'Constructora Andina SAS', message: 'Nuevo usuario creado: juan.torres@constructoraandina.com', timestamp: '2026-05-21T17:00:00Z' },
  { id: 'log-008', level: 'warning', action: 'STORAGE_LIMIT', entity: 'company', companyId: 'co-005', companyName: 'Farmaceutica Colombia SA', message: 'Uso de almacenamiento al 48%', timestamp: '2026-05-21T16:00:00Z' },
  { id: 'log-009', level: 'info', action: 'COMPANY_CREATED', entity: 'company', companyId: 'co-003', companyName: 'Servicios HSEQ Colombia', message: 'Nueva empresa registrada en trial', timestamp: '2026-05-14T11:00:00Z' },
  { id: 'log-010', level: 'error', action: 'LOGIN_FAILED', entity: 'user', companyId: 'co-004', companyName: 'Textiles Medellin SAS', message: 'Intento de login fallido (3 intentos consecutivos): pedro@textilesmedellin.com', timestamp: '2026-05-21T14:30:00Z' },
  { id: 'log-011', level: 'info', action: 'FINDING_RESOLVED', entity: 'finding', companyId: 'co-001', companyName: 'Constructora Andina SAS', message: 'Hallazgo HAL-2026-022 resuelto', timestamp: '2026-05-21T13:00:00Z' },
  { id: 'log-012', level: 'info', action: 'REPORT_GENERATED', entity: 'report', companyId: 'co-005', companyName: 'Farmaceutica Colombia SA', message: 'Reporte ejecutivo mensual generado', timestamp: '2026-05-21T11:00:00Z' },
]

// ── Storage helpers ───────────────────────────────────────────────────────────

function load<T>(key: string, fallback: T[]): T[] {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback))
      return fallback
    }
    return JSON.parse(raw) as T[]
  } catch {
    return fallback
  }
}

function save<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(data))
}

// ── Service ───────────────────────────────────────────────────────────────────

export const AdminService = {
  getPlans(): Plan[] {
    return PLANS
  },

  // Companies
  getCompanies(): Company[] {
    return load(COMPANIES_KEY, DEMO_COMPANIES)
  },

  getCompany(id: string): Company | null {
    return this.getCompanies().find((c) => c.id === id) ?? null
  },

  createCompany(data: CompanyFormData): Company {
    const companies = this.getCompanies()
    const company: Company = {
      id: `co-${randomId()}`,
      name: data.name,
      slug: data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      plan: data.plan,
      status: 'trial',
      adminEmail: data.adminEmail,
      adminName: data.adminName,
      industry: data.industry,
      country: data.country,
      userCount: 1,
      documentCount: 0,
      auditCount: 0,
      automationCount: 0,
      storageUsedMb: 0,
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      trialEndsAt: new Date(Date.now() + 14 * 86400_000).toISOString(),
    }
    const adminUser: AdminUser = {
      id: `u-${randomId()}`,
      name: data.adminName,
      email: data.adminEmail,
      role: 'admin_empresa',
      companyId: company.id,
      companyName: company.name,
      status: 'active',
      lastLoginAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }
    save(COMPANIES_KEY, [...companies, company])
    const users = this.getUsers()
    save(USERS_KEY, [...users, adminUser])
    this._addLog('info', 'COMPANY_CREATED', 'company', company.id, company.name, undefined, undefined, `Nueva empresa creada: ${company.name}`)
    return company
  },

  updateCompany(id: string, data: Partial<Company>): Company | null {
    const companies = this.getCompanies()
    const idx = companies.findIndex((c) => c.id === id)
    if (idx === -1) return null
    const updated = { ...companies[idx], ...data }
    companies[idx] = updated
    save(COMPANIES_KEY, companies)
    return updated
  },

  setCompanyStatus(id: string, status: Company['status']): Company | null {
    const action = status === 'suspended' ? 'COMPANY_SUSPENDED' : status === 'active' ? 'COMPANY_ACTIVATED' : 'COMPANY_DEACTIVATED'
    const company = this.getCompanies().find((c) => c.id === id)
    if (company) this._addLog('warning', action, 'company', id, company.name, undefined, undefined, `Empresa ${status}: ${company.name}`)
    return this.updateCompany(id, { status })
  },

  deleteCompany(id: string): void {
    const companies = this.getCompanies().filter((c) => c.id !== id)
    save(COMPANIES_KEY, companies)
    const users = this.getUsers().filter((u) => u.companyId !== id)
    save(USERS_KEY, users)
  },

  // Users
  getUsers(companyId?: string): AdminUser[] {
    const all = load(USERS_KEY, DEMO_USERS)
    return companyId ? all.filter((u) => u.companyId === companyId) : all
  },

  toggleUserStatus(id: string): AdminUser | null {
    const users = load<AdminUser>(USERS_KEY, DEMO_USERS)
    const idx = users.findIndex((u) => u.id === id)
    if (idx === -1) return null
    users[idx] = { ...users[idx], status: users[idx].status === 'active' ? 'inactive' : 'active' }
    save(USERS_KEY, users)
    return users[idx]
  },

  // Billing
  getBilling(companyId?: string): BillingRecord[] {
    const all = load(BILLING_KEY, DEMO_BILLING)
    return companyId ? all.filter((b) => b.companyId === companyId) : all
  },

  // Logs
  getLogs(level?: string, companyId?: string): SystemLog[] {
    const all = load(LOGS_KEY, DEMO_LOGS)
    return all
      .filter((l) => !level || l.level === level)
      .filter((l) => !companyId || l.companyId === companyId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  },

  _addLog(
    level: SystemLog['level'],
    action: string,
    entity: string,
    companyId?: string,
    companyName?: string,
    userId?: string,
    userName?: string,
    message?: string,
  ): void {
    const logs = load<SystemLog>(LOGS_KEY, DEMO_LOGS)
    logs.unshift({
      id: `log-${randomId()}`,
      level,
      action,
      entity,
      companyId,
      companyName,
      userId,
      userName,
      message: message ?? action,
      timestamp: new Date().toISOString(),
    })
    save(LOGS_KEY, logs.slice(0, 500))
  },

  // Stats
  getStats(): GlobalStats {
    const companies = this.getCompanies()
    const users = this.getUsers()
    const billing = this.getBilling()

    const active = companies.filter((c) => c.status === 'active')
    const paidInvoicesThisMonth = billing.filter((b) => b.status === 'paid' && b.period.includes('2026'))

    const planPrices: Record<PlanType, number> = { starter: 49, professional: 149, enterprise: 399 }
    const mrr = active.reduce((sum, c) => sum + planPrices[c.plan], 0)

    const thisMonth = new Date()
    thisMonth.setDate(1)
    thisMonth.setHours(0, 0, 0, 0)
    const newThisMonth = companies.filter((c) => new Date(c.createdAt) >= thisMonth).length

    const byPlan = companies.reduce<Record<PlanType, number>>(
      (acc, c) => { acc[c.plan]++; return acc },
      { starter: 0, professional: 0, enterprise: 0 }
    )

    return {
      totalCompanies: companies.length,
      activeCompanies: active.length,
      trialCompanies: companies.filter((c) => c.status === 'trial').length,
      suspendedCompanies: companies.filter((c) => c.status === 'suspended').length,
      totalUsers: users.length,
      totalDocuments: companies.reduce((s, c) => s + c.documentCount, 0),
      totalAudits: companies.reduce((s, c) => s + c.auditCount, 0),
      totalStorageGb: Math.round(companies.reduce((s, c) => s + c.storageUsedMb, 0) / 1024),
      mrrUsd: mrr,
      arrUsd: mrr * 12,
      newCompaniesThisMonth: newThisMonth,
      companiesByPlan: byPlan,
    }
  },

  reset(): void {
    if (typeof window === 'undefined') return
    ;[COMPANIES_KEY, USERS_KEY, BILLING_KEY, LOGS_KEY].forEach((k) => localStorage.removeItem(k))
  },
}
