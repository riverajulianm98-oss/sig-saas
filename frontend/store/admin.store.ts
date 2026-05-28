import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Company } from '@/modules/admin/types'

interface AdminStore {
  impersonatedCompany: Company | null
  enterAs: (company: Company) => void
  exitImpersonation: () => void
}

export const useAdminStore = create<AdminStore>()(
  persist(
    (set) => ({
      impersonatedCompany: null,
      enterAs: (company) => set({ impersonatedCompany: company }),
      exitImpersonation: () => set({ impersonatedCompany: null }),
    }),
    {
      name: 'sig-admin',
      partialize: (state) => ({ impersonatedCompany: state.impersonatedCompany }),
    }
  )
)
