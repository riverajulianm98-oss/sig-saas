'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { authService } from '@/services/auth.service'
import { TOKEN_KEYS, ROLE_LEVEL } from '@/lib/constants'
import type { UserRole } from '@/types/auth'

export function useAuth() {
  const router = useRouter()
  const { user, tenant, isAuthenticated, isLoading, setAuth, logout: storeLogout } = useAuthStore()

  const login = useCallback(
    async (email: string, password: string) => {
      const tokens = await authService.login({ email, password })
      const me = await authService.me()
      setAuth(
        me,
        { id: tokens.tenant_id, name: '', slug: '', legal_name: null, tax_id: null, is_active: true, plan: '' },
        { access: tokens.access_token, refresh: tokens.refresh_token }
      )
      router.push('/dashboard')
    },
    [router, setAuth]
  )

  const logout = useCallback(async () => {
    const refresh = localStorage.getItem(TOKEN_KEYS.refresh)
    if (refresh) {
      try { await authService.logout(refresh) } catch { /* ignore */ }
    }
    storeLogout()
    router.push('/login')
  }, [router, storeLogout])

  const hasRole = useCallback(
    (role: UserRole) => {
      if (!user) return false
      return ROLE_LEVEL[user.role] >= ROLE_LEVEL[role]
    },
    [user]
  )

  const hasExactRole = useCallback(
    (role: UserRole) => user?.role === role,
    [user]
  )

  return { user, tenant, isAuthenticated, isLoading, login, logout, hasRole, hasExactRole }
}
