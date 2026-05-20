'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { TOKEN_KEYS } from '@/lib/constants'
import { authService } from '@/services/auth.service'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { isAuthenticated, setAuth, setLoading, logout } = useAuthStore()

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEYS.access)
    if (!token) {
      logout()
      router.replace('/login')
      return
    }

    if (!isAuthenticated) {
      setLoading(true)
      authService
        .me()
        .then((user) => {
          const tenantId = localStorage.getItem(TOKEN_KEYS.tenantId) ?? user.tenant_id
          const refresh = localStorage.getItem(TOKEN_KEYS.refresh) ?? ''
          setAuth(
            user,
            {
              id: tenantId,
              name: '',
              slug: '',
              legal_name: null,
              tax_id: null,
              is_active: true,
              plan: '',
            },
            { access: token, refresh }
          )
        })
        .catch(() => {
          logout()
          router.replace('/login')
        })
    }
  }, [isAuthenticated, router, setAuth, setLoading, logout])

  if (!isAuthenticated) return null

  return <>{children}</>
}
