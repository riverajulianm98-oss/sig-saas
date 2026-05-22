'use client'

import Link from 'next/link'
import { TrendingUp, TrendingDown, AlertTriangle, Clock, ClipboardCheck, FileText, ShieldCheck } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { ExecutiveSummary } from '@/types/analytics'

interface KpiCardProps {
  label: string
  value: string | number
  trend?: number
  trendLabel?: string
  icon: React.ElementType
  iconClass: string
  href?: string
  inverted?: boolean
}

function KpiCard({ label, value, trend, trendLabel, icon: Icon, iconClass, href, inverted = false }: KpiCardProps) {
  const trendPositive = inverted ? (trend ?? 0) <= 0 : (trend ?? 0) >= 0
  const trendColor = trendPositive ? 'text-emerald-500' : 'text-red-500'
  const TrendIcon = trendPositive ? TrendingUp : TrendingDown

  const inner = (
    <div className={cn(
      'group relative overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 transition-all duration-200',
      href && 'cursor-pointer hover:shadow-xl hover:-translate-y-0.5 hover:border-[hsl(var(--primary))]/40'
    )}>
      {/* Background glow */}
      <div className={cn('absolute -right-4 -top-4 h-20 w-20 rounded-full opacity-10 blur-xl', iconClass)} />

      <div className="relative flex items-start justify-between">
        <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl', iconClass)}>
          <Icon className="h-5 w-5" />
        </div>
        {trend !== undefined && (
          <div className={cn('flex items-center gap-1 text-xs font-semibold', trendColor)}>
            <TrendIcon className="h-3.5 w-3.5" />
            <span>{Math.abs(trend)}{typeof trend === 'number' && trend % 1 === 0 ? '' : '%'}</span>
          </div>
        )}
      </div>

      <div className="relative mt-4">
        <p className="text-3xl font-black tabular-nums tracking-tight">{value}</p>
        <p className="mt-1 text-sm font-semibold text-[hsl(var(--foreground))]">{label}</p>
        {trendLabel && (
          <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">{trendLabel}</p>
        )}
      </div>
    </div>
  )

  return href ? <Link href={href}>{inner}</Link> : inner
}

interface ExecutiveKPIsProps {
  data: ExecutiveSummary | undefined
  isLoading: boolean
  compact?: boolean
}

export function ExecutiveKPIs({ data, isLoading, compact = false }: ExecutiveKPIsProps) {
  if (isLoading) {
    return (
      <div className={cn('grid gap-4', compact ? 'grid-cols-5' : 'grid-cols-1 sm:grid-cols-3 lg:grid-cols-5')}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className={cn('rounded-2xl', compact ? 'h-28' : 'h-36')} />
        ))}
      </div>
    )
  }

  if (!data) return null

  const cards: KpiCardProps[] = [
    {
      label: 'Compliance global',
      value: `${data.compliance_score}%`,
      trend: data.compliance_trend,
      trendLabel: 'vs. 6 meses atrás',
      icon: ShieldCheck,
      iconClass: data.compliance_score >= 80 ? 'bg-emerald-500/15 text-emerald-500' : 'bg-amber-500/15 text-amber-500',
      href: '/analytics',
    },
    {
      label: 'Hallazgos abiertos',
      value: data.open_findings,
      trend: data.findings_trend,
      trendLabel: 'cambio reciente',
      icon: AlertTriangle,
      iconClass: data.open_findings > 5 ? 'bg-red-500/15 text-red-500' : 'bg-amber-500/15 text-amber-500',
      href: '/findings',
      inverted: true,
    },
    {
      label: 'CAPA vencidas',
      value: data.overdue_capa,
      trend: data.capa_trend,
      trendLabel: 'acciones sin cerrar a tiempo',
      icon: Clock,
      iconClass: data.overdue_capa > 3 ? 'bg-red-500/15 text-red-500' : 'bg-amber-500/15 text-amber-500',
      href: '/capa',
      inverted: true,
    },
    {
      label: 'Auditorías activas',
      value: data.active_audits,
      icon: ClipboardCheck,
      iconClass: 'bg-blue-500/15 text-blue-500',
      href: '/audits',
    },
    {
      label: 'Docs. a vencer',
      value: data.docs_expiring,
      icon: FileText,
      iconClass: data.docs_expiring > 0 ? 'bg-amber-500/15 text-amber-500' : 'bg-emerald-500/15 text-emerald-500',
      href: '/documents',
    },
  ]

  return (
    <div className={cn('grid gap-4', compact ? 'grid-cols-5' : 'grid-cols-1 sm:grid-cols-3 lg:grid-cols-5')}>
      {cards.map((card) => (
        <KpiCard key={card.label} {...card} />
      ))}
    </div>
  )
}
