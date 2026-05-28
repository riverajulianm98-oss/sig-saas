'use client'

import Link from 'next/link'
import { FileText, Users, Zap, BarChart3, HardDrive, CheckSquare, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSubscription, useUsage, useUsageHistory } from '../hooks/use-billing'
import { getPlan } from '../services/billing.service'

function MiniBar({ value, max, color = 'bg-indigo-500' }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  return (
    <div className="h-2 w-full rounded-full bg-gray-100">
      <div className={cn('h-2 rounded-full', color)} style={{ width: `${pct}%` }} />
    </div>
  )
}

function StatCard({
  label, value, limit, unit, icon: Icon, color, trend,
}: {
  label: string; value: number; limit: number; unit?: string;
  icon: React.ElementType; color: string; trend?: number
}) {
  const unlimited = limit === -1
  const pct = unlimited ? null : Math.min(100, Math.round((value / limit) * 100))
  const warning = pct !== null && pct >= 80
  const exceeded = pct !== null && pct >= 100

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl', color)}>
          <Icon className="h-4.5 w-4.5 text-white" />
        </div>
        {trend !== undefined && (
          <div className={cn('flex items-center gap-1 text-xs font-medium', trend >= 0 ? 'text-emerald-600' : 'text-red-500')}>
            {trend >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-gray-900">
        {value.toLocaleString()}
        {unit && <span className="ml-1 text-sm font-normal text-gray-400">{unit}</span>}
      </p>
      {!unlimited && pct !== null && (
        <>
          <div className="mt-3">
            <MiniBar
              value={value}
              max={limit}
              color={exceeded ? 'bg-red-500' : warning ? 'bg-amber-400' : 'bg-indigo-500'}
            />
          </div>
          <p className={cn('mt-1.5 text-xs', exceeded ? 'text-red-500' : warning ? 'text-amber-500' : 'text-gray-400')}>
            {pct}% de {limit.toLocaleString()} {unit} {exceeded ? '— Límite superado' : warning ? '— Cerca del límite' : ''}
          </p>
        </>
      )}
      {unlimited && (
        <p className="mt-3 text-xs text-indigo-600 font-medium">Ilimitado en tu plan</p>
      )}
    </div>
  )
}

function HistoryChart({ history }: { history: { month: string; documents: number; audits: number; storageGb: number; automations: number }[] }) {
  const maxDocs = Math.max(...history.map((h) => h.documents), 1)
  const maxAuto = Math.max(...history.map((h) => h.automations), 1)

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-sm font-bold text-gray-900">Tendencia mensual</h2>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-indigo-500" /> Documentos</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-emerald-500" /> Automatizaciones</span>
        </div>
      </div>

      <div className="flex items-end gap-2 h-40">
        {history.map((h, i) => {
          const docsH = Math.round((h.documents / maxDocs) * 100)
          const autoH = Math.round((h.automations / maxAuto) * 100)
          const isLast = i === history.length - 1
          return (
            <div key={h.month} className="flex flex-1 flex-col items-center gap-1">
              <div className="flex w-full items-end gap-0.5 h-32">
                <div
                  className={cn('flex-1 rounded-t-sm transition-all', isLast ? 'bg-indigo-600' : 'bg-indigo-200')}
                  style={{ height: `${docsH}%` }}
                  title={`${h.documents} documentos`}
                />
                <div
                  className={cn('flex-1 rounded-t-sm transition-all', isLast ? 'bg-emerald-500' : 'bg-emerald-200')}
                  style={{ height: `${autoH}%` }}
                  title={`${h.automations} automatizaciones`}
                />
              </div>
              <span className="text-[10px] text-gray-400 whitespace-nowrap">{h.month.split(' ')[0]}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function AuditsCard({ count }: { count: number }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500">
          <CheckSquare className="h-4.5 w-4.5 text-white" />
        </div>
        <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
          <TrendingUp className="h-3.5 w-3.5" /> 10%
        </span>
      </div>
      <p className="mt-3 text-xs text-gray-500">Auditorías realizadas</p>
      <p className="mt-1 text-2xl font-extrabold text-gray-900">{count}</p>
      <p className="mt-3 text-xs text-gray-400">Este período</p>
    </div>
  )
}

function StorageHistory({ history }: { history: { month: string; storageGb: number }[] }) {
  const max = Math.max(...history.map((h) => h.storageGb), 1)
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <h2 className="mb-4 text-sm font-bold text-gray-900">Crecimiento de almacenamiento (GB)</h2>
      <div className="space-y-2">
        {history.map((h, i) => {
          const pct = Math.round((h.storageGb / max) * 100)
          const isLast = i === history.length - 1
          return (
            <div key={h.month} className="flex items-center gap-3 text-xs">
              <span className="w-16 shrink-0 text-gray-500">{h.month}</span>
              <div className="flex-1 h-2 rounded-full bg-gray-100">
                <div
                  className={cn('h-2 rounded-full', isLast ? 'bg-indigo-600' : 'bg-indigo-300')}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className={cn('w-10 text-right font-medium', isLast ? 'text-indigo-700' : 'text-gray-500')}>
                {h.storageGb}GB
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function UsageView() {
  const { data: sub } = useSubscription()
  const { data: usage } = useUsage()
  const { data: history } = useUsageHistory()

  if (!sub || !usage) {
    return <div className="flex h-64 items-center justify-center text-sm text-gray-400">Cargando...</div>
  }

  const plan = getPlan(sub.planId)
  const periodStart = new Date(usage.periodStart).toLocaleDateString('es-CO', { day: 'numeric', month: 'long' })
  const periodEnd = new Date(usage.periodEnd).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })

  const prevMonth = history?.[history.length - 2]
  const docsTrend = prevMonth
    ? Math.round(((usage.documentsCount - prevMonth.documents) / prevMonth.documents) * 100)
    : undefined

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Uso y consumo</h1>
          <p className="mt-1 text-sm text-gray-500">Período: {periodStart} – {periodEnd}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700">{plan.name}</span>
          <Link
            href="/settings/billing"
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
          >
            Gestionar plan <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Main stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Usuarios activos"
          value={usage.usersCount}
          limit={plan.limits.users}
          icon={Users}
          color="bg-blue-500"
          trend={5}
        />
        <StatCard
          label="Documentos"
          value={usage.documentsCount}
          limit={plan.limits.documents}
          icon={FileText}
          color="bg-indigo-500"
          trend={docsTrend}
        />
        <StatCard
          label="Automatizaciones"
          value={usage.automationRuns}
          limit={plan.limits.automations}
          icon={Zap}
          color="bg-amber-500"
          trend={3}
        />
        <StatCard
          label="Reportes generados"
          value={usage.reportsGenerated}
          limit={plan.limits.reports}
          icon={BarChart3}
          color="bg-emerald-500"
        />
        <StatCard
          label="Almacenamiento"
          value={Math.round(usage.storageUsedMb / 1024 * 10) / 10}
          limit={Math.round(plan.limits.storageMb / 1024)}
          unit="GB"
          icon={HardDrive}
          color="bg-pink-500"
          trend={7}
        />
        <AuditsCard count={usage.auditsCount} />
      </div>

      {/* Charts */}
      {history && history.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
          <HistoryChart history={history} />
          <StorageHistory history={history} />
        </div>
      )}

      {/* Upgrade prompt if near limits */}
      {plan.limits.documents !== -1 && usage.documentsCount / plan.limits.documents >= 0.8 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-sm font-bold text-amber-700">Cerca del límite de documentos</p>
              <p className="mt-0.5 text-xs text-amber-600">
                Has usado {usage.documentsCount} de {plan.limits.documents} documentos ({Math.round((usage.documentsCount / plan.limits.documents) * 100)}%).
                Considera hacer upgrade para evitar interrupciones.
              </p>
            </div>
            <Link
              href="/pricing"
              className="shrink-0 rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-white hover:bg-amber-600"
            >
              Ver planes
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
