'use client'

import { useState } from 'react'
import { DollarSign, TrendingUp, CheckCircle, AlertCircle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BillingStatus, PlanType } from '../types'
import { useAdminBilling, useAdminStats, useCompanies } from '../hooks/use-admin'

const STATUS_STYLES: Record<BillingStatus, { label: string; cls: string; icon: React.ElementType }> = {
  paid: { label: 'Pagado', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300', icon: CheckCircle },
  pending: { label: 'Pendiente', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300', icon: Clock },
  failed: { label: 'Fallido', cls: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300', icon: AlertCircle },
  refunded: { label: 'Reembolsado', cls: 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]', icon: AlertCircle },
}

const PLAN_LABELS: Record<PlanType, string> = {
  starter: 'Starter',
  professional: 'Professional',
  enterprise: 'Enterprise',
}

export function BillingView() {
  const { data: stats } = useAdminStats()
  const { data: companies = [] } = useCompanies()
  const [companyFilter, setCompanyFilter] = useState('')
  const { data: records = [] } = useAdminBilling(companyFilter || undefined)

  const paidTotal = records.filter((r) => r.status === 'paid').reduce((s, r) => s + r.amount, 0)
  const pendingTotal = records.filter((r) => r.status === 'pending').reduce((s, r) => s + r.amount, 0)
  const failedCount = records.filter((r) => r.status === 'failed').length

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-[hsl(var(--border))] px-6 py-4">
        <h1 className="text-xl font-bold">Facturacion</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">Historial de cobros e ingresos</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 border-b border-[hsl(var(--border))] px-6 py-4 lg:grid-cols-4">
        {[
          { icon: DollarSign, label: 'MRR', value: `$${(stats?.mrrUsd ?? 0).toLocaleString()}`, color: '#10b981' },
          { icon: TrendingUp, label: 'ARR estimado', value: `$${((stats?.arrUsd ?? 0) / 1000).toFixed(1)}k`, color: '#6366f1' },
          { icon: CheckCircle, label: 'Cobrado (filtro)', value: `$${paidTotal.toLocaleString()}`, color: '#3b82f6' },
          { icon: AlertCircle, label: 'Pendiente / Fallido', value: `$${pendingTotal} / ${failedCount} err`, color: '#f59e0b' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="flex items-center gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg shrink-0" style={{ background: color + '22' }}>
              <Icon className="h-4 w-4" style={{ color }} />
            </div>
            <div>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">{label}</p>
              <p className="text-lg font-bold">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] px-6 py-3">
        <select
          value={companyFilter}
          onChange={(e) => setCompanyFilter(e.target.value)}
          className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-1.5 text-sm focus:outline-none"
        >
          <option value="">Todas las empresas</option>
          {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <span className="ml-auto text-xs text-[hsl(var(--muted-foreground))]">{records.length} facturas</span>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-[hsl(var(--muted-foreground))]">Empresa</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[hsl(var(--muted-foreground))]">Plan</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[hsl(var(--muted-foreground))]">Monto</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[hsl(var(--muted-foreground))]">Periodo</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[hsl(var(--muted-foreground))]">Estado</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-[hsl(var(--muted-foreground))]">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[hsl(var(--border))]">
            {records.map((rec) => {
              const { label, cls, icon: StatusIcon } = STATUS_STYLES[rec.status]
              return (
                <tr key={rec.id} className="hover:bg-[hsl(var(--accent))]/40 transition-colors">
                  <td className="px-6 py-3.5 font-medium">{rec.companyName}</td>
                  <td className="px-4 py-3.5">
                    <span className="text-xs capitalize text-[hsl(var(--muted-foreground))]">{PLAN_LABELS[rec.plan]}</span>
                  </td>
                  <td className="px-4 py-3.5 font-semibold">${rec.amount} {rec.currency}</td>
                  <td className="px-4 py-3.5 text-[hsl(var(--muted-foreground))]">{rec.period}</td>
                  <td className="px-4 py-3.5">
                    <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold', cls)}>
                      <StatusIcon className="h-3 w-3" /> {label}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-[hsl(var(--muted-foreground))]">{rec.invoiceDate}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
