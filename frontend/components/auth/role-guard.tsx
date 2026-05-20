'use client'

import { useAuthStore } from '@/store/auth.store'
import { ROLE_LEVEL } from '@/lib/constants'
import type { UserRole } from '@/types/auth'

interface RoleGuardProps {
  role: UserRole
  exact?: boolean
  fallback?: React.ReactNode
  children: React.ReactNode
}

export function RoleGuard({ role, exact = false, fallback = null, children }: RoleGuardProps) {
  const { user } = useAuthStore()

  if (!user) return <>{fallback}</>

  const allowed = exact
    ? user.role === role
    : (ROLE_LEVEL[user.role] ?? 0) >= (ROLE_LEVEL[role] ?? 0)

  return allowed ? <>{children}</> : <>{fallback}</>
}
