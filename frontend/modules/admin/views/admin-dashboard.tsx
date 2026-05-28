'use client'

import { TrendingUp, Building2, Users, DollarSign, HardDrive, AlertTriangle, CheckCircle, Clock, ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAdminStats, useCompanies, useSystemLogs } from '../hooks/use-admin'
import { PlanType } from '../types'

const PLAN_COLORS: Record<PlanType, { bg: string; text: string; label: string }> = {
  starter: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-300', label: 'Starter' },
  professional: { bg: 'bg-blue-100 dark:bg-blue-950', text: 'text-blue-700 dark:text-blue-300', label: 'Professional' },
  enterprise: { bg: 'bg-violet-100 dark:bg-violet-950', text: 'text-violet-700 dark:text-violet-300', label: 'Enterprise' },
}

function StatCard({ icon: Icon, label, value, sub, color, trend }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; color: string; trend?: string
}) {
  return (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: color + '22' }}>
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
        {trend && (
          <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
            <ArrowUpRight className="h-3 w-3" /> {trend}
          </span>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">{label}</p>
        {sub && <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">{sub}</p>}
      </div>
    </div>
  )
}

function PlanBar({ plan, count, total }: { plan: PlanType; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  const { bg, text, label } = PLAN_COLORS[plan]
  const barColors: Record<PlanType, string> = {
    starter: 'bg-slate-400',
    professional: 'bg-blue-500',
    enterprise: 'bg-violet-600',
  }
  return (
    <div className="flex items-center gap-3">
      <span className={cn('w-24 shrink-0 rounded-full px-2 py-0.5 text-center text-xs font-semibold', bg, text)}>{label}</span>
      <div className="flex-1 rounded-full bg-[hsl(var(--muted))] h-2 overflow-hidden">
        <div className={cn('h-full rounded-full transition-all', barColors[plan])} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 shrink-0 text-right text-sm font-semibold">{count}</span>
    </div>
  )
}

function LogLevelDot({ level }: { level: string }) {
  const cls = level === 'error' ? 'bg-red-500' : level === 'warning' ? 'bg-amber-400' : 'bg-emerald-400'
  return <span className={cn('inline-block h-2 w-2 shrink-0 rounded-full', cls)} />
}

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'ahora'
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  return `${Math.floor(h / 24)}d`
}

export function AdminDashboard() {
  const { data: stats } = useAdminStats()
  const { data: companies = [] } = useCompanies()
  const { data: logs = [] } = useSystemLogs()

  const topCompanies = [...companies]
    .sort((a, b) => b.userCount - a.userCount)
    .slice(0, 5)

  const recentLogs = logs.slice(0, 8)

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-xl font-bold">Control Center</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">Vision global de la plataforma SIG CYA</p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Building2} label="Empresas activas"
          value={stats?.activeCompanies ?? 0}
          sub={`${stats?.totalCompanies ?? 0} total · ${stats?.trialCompanies ?? 0} trial`}
          color="#6366f1" trend={stats?.newCompaniesThisMonth ? `+${stats.newCompaniesThisMonth} este mes` : undefined}
        />
        <StatCard
          icon={Users} label="Usuarios totales"
          value={stats?.totalUsers ?? 0}
          sub={`en ${stats?.totalCompanies ?? 0} empresas`}
          color="#3b82f6"
        />
        <StatCard
          icon={DollarSign} label="MRR"
          value={`$${(stats?.mrrUsd ?? 0).toLocaleString()}`}
          sub={`ARR $${((stats?.arrUsd ?? 0) / 1000).toFixed(1)}k`}
          color="#10b981" trend="+12%"
        />
        <StatCard
          icon={HardDrive} label="Almacenamiento"
          value={`${stats?.totalStorageGb ?? 0} GB`}
          sub={`${stats?.totalDocuments ?? 0} docs · ${stats?.totalAudits ?? 0} auditorias`}
          color="#f59e0b"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Plan distribution */}
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
          <h2 className="mb-4 font-semibold">Empresas por plan</h2>
          <div className="space-y-3">
            {(['enterprise', 'professional', 'starter'] as PlanType[]).map((p) => (
              <PlanBar
                key={p}
                plan={p}
                count={stats?.companiesByPlan?.[p] ?? 0}
                total={stats?.totalCompanies ?? 1}
              />
            ))}
          </div>
          <div className="mt-4 border-t border-[hsl(var(--border))] pt-3">
            <div className="flex items-center justify-between text-xs text-[hsl(var(--muted-foreground))]">
              <span>Trial activos</span>
              <span className="font-semibold text-amber-600">{stats?.trialCompanies ?? 0}</span>
            </div>
            {stats?.suspendedCompanies ? (
              <div className="flex items-center justify-between text-xs text-[hsl(var(--muted-foreground))] mt-1">
                <span>Suspendidas</span>
                <span className="font-semibold text-red-600">{stats.suspendedCompanies}</span>
              </div>
            ) : null}
          </div>
        </div>

        {/* Top companies */}
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
          <h2 className="mb-4 font-semibold">Top empresas</h2>
          <div className="space-y-2.5">
            {topCompanies.map((co, i) => {
              const { bg, text, label } = PLAN_COLORS[co.plan]
              return (
                <div key={co.id} className="flex items-center gap-3">
                  <span className="w-5 shrink-0 text-center text-xs font-bold text-[hsl(var(--muted-foreground))]">#{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{co.name}</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">{co.userCount} usuarios</p>
                  </div>
                  <span className={cn('shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold', bg, text)}>{label}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent logs */}
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
          <h2 className="mb-4 font-semibold">Actividad reciente</h2>
          <div className="space-y-2.5">
            {recentLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-2.5">
                <LogLevelDot level={log.level} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium">{log.message}</p>
                  {log.companyName && (
                    <p className="text-[10px] text-[hsl(var(--muted-foreground))]">{log.companyName}</p>
                  )}
                </div>
                <span className="shrink-0 text-[10px] text-[hsl(var(--muted-foreground))]">{formatRelative(log.timestamp)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Status indicators */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3">
          <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
          <div>
            <p className="text-sm font-medium">Sistema operativo</p>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">Todos los servicios activos</p>
          </div>
        </div>
        {stats?.trialCompanies ? (
          <div className="flex items-center gap-3 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950 px-4 py-3">
            <Clock className="h-5 w-5 text-amber-500 shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-700 dark:text-amber-300">{stats.trialCompanies} trial activo(s)</p>
              <p className="text-xs text-amber-600 dark:text-amber-400">Requieren seguimiento</p>
            </div>
          </div>
        ) : null}
        {stats?.suspendedCompanies ? (
          <div className="flex items-center gap-3 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 px-4 py-3">
            <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-700 dark:text-red-300">{stats.suspendedCompanies} empresa(s) suspendida(s)</p>
              <p className="text-xs text-red-600 dark:text-red-400">Accion requerida</p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
