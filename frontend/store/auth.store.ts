import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { TOKEN_KEYS } from '@/lib/constants'
import { clearTokens } from '@/lib/axios'
import type { User, Tenant } from '@/types/auth'

interface AuthStore {
  user: User | null
  tenant: Tenant | null
  isAuthenticated: boolean
  isLoading: boolean

  setAuth: (user: User, tenant: Tenant, tokens: { access: string; refresh: string }) => void
  setUser: (user: User) => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      tenant: null,
      isAuthenticated: false,
      isLoading: true,

      setAuth: (user, tenant, tokens) => {
        localStorage.setItem(TOKEN_KEYS.access, tokens.access)
        localStorage.setItem(TOKEN_KEYS.refresh, tokens.refresh)
        localStorage.setItem(TOKEN_KEYS.tenantId, tenant.id)
        set({ user, tenant, isAuthenticated: true, isLoading: false })
      },

      setUser: (user) => set({ user }),

      setLoading: (isLoading) => set({ isLoading }),

      logout: () => {
        clearTokens()
        set({ user: null, tenant: null, isAuthenticated: false, isLoading: false })
      },
    }),
    {
      name: 'sig-auth',
      partialize: (state) => ({
        user: state.user,
        tenant: state.tenant,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
