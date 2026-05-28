'use client'

import Link from 'next/link'
import { Lock, ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LimitCheck } from '../hooks/use-plan-limits'

interface PlanLimitGuardProps {
  check: LimitCheck
  resource: string
  children: React.ReactNode
  className?: string
}

export function PlanLimitGuard({ check, resource, children, className }: PlanLimitGuardProps) {
  if (!check.exceeded) return <>{children}</>

  return (
    <div className={cn('relative', className)}>
      <div className="pointer-events-none select-none opacity-40">{children}</div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-xl bg-white/80 backdrop-blur-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
          <Lock className="h-6 w-6 text-indigo-600" />
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-gray-900">Límite de {resource} alcanzado</p>
          <p className="mt-0.5 text-xs text-gray-500">
            Has usado {check.used.toLocaleString()} de {check.limit.toLocaleString()}
          </p>
        </div>
        <Link
          href="/pricing"
          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700"
        >
          Mejorar plan <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  )
}

interface FeatureLockProps {
  feature: string
  requiredPlan?: string
  children?: React.ReactNode
}

export function FeatureLock({ feature, requiredPlan = 'Enterprise', children }: FeatureLockProps) {
  return (
    <div className="relative rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6">
      {children && <div className="pointer-events-none select-none opacity-30">{children}</div>}
      <div className="flex flex-col items-center gap-2 py-4 text-center">
        <Lock className="h-8 w-8 text-gray-400" />
        <p className="text-sm font-semibold text-gray-700">{feature}</p>
        <p className="text-xs text-gray-500">Disponible en el plan <span className="font-semibold text-indigo-600">{requiredPlan}</span></p>
        <Link
          href="/pricing"
          className="mt-2 flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700"
        >
          Ver planes <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  )
}

interface UsageWarningBannerProps {
  check: LimitCheck
  resource: string
  className?: string
}

export function UsageWarningBanner({ check, resource, className }: UsageWarningBannerProps) {
  if (!check.warning && !check.exceeded) return null

  return (
    <div className={cn(
      'flex items-center gap-3 rounded-xl px-4 py-3 text-sm',
      check.exceeded
        ? 'border border-red-200 bg-red-50 text-red-700'
        : 'border border-amber-200 bg-amber-50 text-amber-700',
      className
    )}>
      <span className="font-semibold">
        {check.exceeded ? `Límite de ${resource} superado` : `Acercándote al límite de ${resource}`}
      </span>
      <span className="text-xs opacity-80">
        {check.used.toLocaleString()} / {check.limit.toLocaleString()} ({check.pct}%)
      </span>
      <Link href="/pricing" className="ml-auto flex items-center gap-1 text-xs font-bold underline">
        Mejorar <ArrowUpRight className="h-3 w-3" />
      </Link>
    </div>
  )
}
