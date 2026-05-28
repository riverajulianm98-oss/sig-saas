'use client'

import { useRouter } from 'next/navigation'
import { Building2, X } from 'lucide-react'
import { useAdminStore } from '@/store/admin.store'

export function ImpersonationBanner() {
  const { impersonatedCompany, exitImpersonation } = useAdminStore()
  const router = useRouter()

  if (!impersonatedCompany) return null

  function handleExit() {
    exitImpersonation()
    router.push('/admin/companies')
  }

  return (
    <div className="flex items-center justify-between gap-4 border-b border-amber-300/50 bg-amber-50 dark:bg-amber-950/50 px-4 py-1.5">
      <div className="flex items-center gap-2">
        <Building2 className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
        <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
          Vista como empresa:
        </span>
        <span className="text-xs font-bold text-amber-800 dark:text-amber-200">
          {impersonatedCompany.name}
        </span>
        <span className="rounded-full bg-amber-200 dark:bg-amber-800 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-amber-700 dark:text-amber-300">
          {impersonatedCompany.plan}
        </span>
      </div>
      <button
        onClick={handleExit}
        className="flex items-center gap-1.5 rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-100 dark:bg-amber-900 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-800 transition-colors"
      >
        <X className="h-3 w-3" /> Salir de vista empresa
      </button>
    </div>
  )
}
