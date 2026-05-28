'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Building2, Users, CreditCard, FileText,
  Settings, Activity, Shield, ArrowLeft, ChevronRight, Server, HardDrive,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAdminStats } from '../hooks/use-admin'

const navItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Empresas', href: '/admin/companies', icon: Building2 },
  { label: 'Usuarios', href: '/admin/users', icon: Users },
  { label: 'Planes', href: '/admin/plans', icon: CreditCard },
  { label: 'Facturación', href: '/admin/billing', icon: FileText },
  { label: 'Logs del sistema', href: '/admin/logs', icon: Activity },
  { label: 'Monitorización', href: '/admin/monitoring', icon: Server },
  { label: 'Backups', href: '/admin/backups', icon: HardDrive },
  { label: 'Configuración', href: '/admin/settings', icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: stats } = useAdminStats()

  return (
    <aside className="flex h-screen w-56 shrink-0 flex-col border-r border-slate-800 bg-slate-900 text-slate-100">
      {/* Brand */}
      <div className="flex h-14 items-center gap-2.5 border-b border-slate-800 px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[hsl(var(--primary))]">
          <Shield className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold leading-none">Super Admin</p>
          <p className="text-[10px] text-slate-400 leading-tight mt-0.5">Control Center</p>
        </div>
      </div>

      {/* Quick stats */}
      <div className="border-b border-slate-800 px-4 py-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-slate-800/60 px-2.5 py-2">
            <p className="text-[10px] text-slate-400">Empresas</p>
            <p className="text-lg font-bold">{stats?.totalCompanies ?? '—'}</p>
          </div>
          <div className="rounded-lg bg-slate-800/60 px-2.5 py-2">
            <p className="text-[10px] text-slate-400">MRR</p>
            <p className="text-lg font-bold">${stats?.mrrUsd ?? '—'}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex h-9 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors',
                active
                  ? 'bg-[hsl(var(--primary))] text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.label}</span>
              {item.href === '/admin/companies' && stats?.trialCompanies ? (
                <span className="ml-auto rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-400">
                  {stats.trialCompanies}
                </span>
              ) : null}
            </Link>
          )
        })}
      </nav>

      {/* Back to app */}
      <div className="border-t border-slate-800 p-2">
        <button
          onClick={() => router.push('/dashboard')}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="flex-1 text-left">Volver a la app</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </aside>
  )
}
