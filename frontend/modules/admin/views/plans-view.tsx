'use client'

import { Check, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PlanType } from '../types'
import { useAdminPlans, useAdminStats } from '../hooks/use-admin'

const PLAN_ACCENT: Record<PlanType, { border: string; bg: string; btn: string }> = {
  starter: {
    border: 'border-slate-200 dark:border-slate-700',
    bg: 'bg-[hsl(var(--card))]',
    btn: 'bg-slate-700 text-white hover:bg-slate-600',
  },
  professional: {
    border: 'border-[hsl(var(--primary))]',
    bg: 'bg-[hsl(var(--primary))]/5',
    btn: 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90',
  },
  enterprise: {
    border: 'border-violet-300 dark:border-violet-700',
    bg: 'bg-violet-50 dark:bg-violet-950/30',
    btn: 'bg-violet-700 text-white hover:bg-violet-600',
  },
}

function formatStorage(mb: number) {
  if (mb >= 1024) return `${mb / 1024} GB`
  return `${mb} MB`
}

export function PlansView() {
  const { data: plans = [] } = useAdminPlans()
  const { data: stats } = useAdminStats()

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold">Planes</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">Estructura de precios y limites de la plataforma</p>
      </div>

      {/* Revenue summary */}
      <div className="grid grid-cols-3 gap-4">
        {plans.map((plan) => {
          const count = stats?.companiesByPlan?.[plan.id] ?? 0
          const revenue = count * plan.priceMonthly
          return (
            <div key={plan.id} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">{plan.name}</p>
              <p className="mt-1 text-2xl font-bold">${revenue.toLocaleString()}</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">{count} empresa(s) · ${plan.priceMonthly}/mes c/u</p>
            </div>
          )
        })}
      </div>

      {/* Plan cards */}
      <div className="grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => {
          const accent = PLAN_ACCENT[plan.id]
          const count = stats?.companiesByPlan?.[plan.id] ?? 0
          return (
            <div
              key={plan.id}
              className={cn(
                'relative rounded-2xl border-2 p-6 transition-shadow hover:shadow-md',
                accent.border, accent.bg
              )}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="flex items-center gap-1 rounded-full bg-[hsl(var(--primary))] px-3 py-0.5 text-xs font-bold text-white">
                    <Star className="h-3 w-3" /> Popular
                  </span>
                </div>
              )}

              <div className="mb-4">
                <h2 className="text-lg font-bold">{plan.name}</h2>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-3xl font-bold">${plan.priceMonthly}</span>
                  <span className="text-[hsl(var(--muted-foreground))]">/mes</span>
                </div>
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
                  ${plan.priceAnnual}/año · {count} empresa(s) activas
                </p>
              </div>

              {/* Limits */}
              <div className="mb-4 space-y-2 rounded-xl border border-[hsl(var(--border))]/60 bg-[hsl(var(--background))]/60 p-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))]">Limites</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  <span className="text-[hsl(var(--muted-foreground))]">Usuarios</span>
                  <span className="font-semibold text-right">{plan.limits.users === 999 ? 'Ilimitados' : plan.limits.users}</span>
                  <span className="text-[hsl(var(--muted-foreground))]">Storage</span>
                  <span className="font-semibold text-right">{formatStorage(plan.limits.storageMb)}</span>
                  <span className="text-[hsl(var(--muted-foreground))]">Automatizaciones</span>
                  <span className="font-semibold text-right">{plan.limits.automations === 999 ? 'Ilimitadas' : plan.limits.automations}</span>
                  <span className="text-[hsl(var(--muted-foreground))]">Documentos</span>
                  <span className="font-semibold text-right">{plan.limits.documents >= 99999 ? 'Ilimitados' : plan.limits.documents}</span>
                </div>
              </div>

              {/* Features */}
              <ul className="mb-6 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <button className={cn('w-full rounded-xl py-2.5 text-sm font-semibold transition-colors', accent.btn)}>
                Ver empresas en {plan.name}
              </button>
            </div>
          )
        })}
      </div>

      <p className="text-center text-xs text-[hsl(var(--muted-foreground))]">
        Precios en USD · IVA no incluido · Planes anuales con 2 meses gratis
      </p>
    </div>
  )
}
