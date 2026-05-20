export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? 'SIG SaaS'
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'
export const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION ?? 'v1'
export const API_BASE = `${API_URL}/api/${API_VERSION}`

export const ROUTES = {
  home: '/',
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  dashboard: '/dashboard',
  documents: '/documents',
  audits: '/audits',
  users: '/users',
  settings: '/settings',
} as const

export const TOKEN_KEYS = {
  access: 'sig_access_token',
  refresh: 'sig_refresh_token',
  tenantId: 'sig_tenant_id',
} as const

export const USER_ROLES = {
  ADMIN_EMPRESA: 'admin_empresa',
  COORDINADOR_SIG: 'coordinador_sig',
  AUDITOR: 'auditor',
  LIDER_PROCESO: 'lider_proceso',
  USUARIO: 'usuario',
} as const

export const ROLE_LABELS: Record<string, string> = {
  admin_empresa: 'Admin Empresa',
  coordinador_sig: 'Coordinador SIG',
  auditor: 'Auditor',
  lider_proceso: 'Líder de Proceso',
  usuario: 'Usuario',
}

export const ROLE_LEVEL: Record<string, number> = {
  admin_empresa: 100,
  coordinador_sig: 80,
  auditor: 60,
  lider_proceso: 40,
  usuario: 20,
}
