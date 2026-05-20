export type UserRole =
  | 'admin_empresa'
  | 'coordinador_sig'
  | 'auditor'
  | 'lider_proceso'
  | 'usuario'

export interface User {
  id: string
  tenant_id: string
  email: string
  full_name: string
  role: UserRole
  is_active: boolean
  last_login_at: string | null
}

export interface Tenant {
  id: string
  name: string
  slug: string
  legal_name: string | null
  tax_id: string | null
  is_active: boolean
  plan: string
}

export interface TokenPair {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
  refresh_expires_in: number
  tenant_id: string
}

export interface LoginRequest {
  email: string
  password: string
  tenant_id?: string
}

export interface RegisterRequest {
  tenant: {
    company_name: string
    legal_name?: string
    tax_id?: string
    plan?: string
  }
  admin: {
    email: string
    password: string
    full_name: string
  }
}

export interface RegisterResponse {
  tenant: Tenant
  user: User
  token: TokenPair
}

export interface AuthState {
  user: User | null
  tenant: Tenant | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
}
