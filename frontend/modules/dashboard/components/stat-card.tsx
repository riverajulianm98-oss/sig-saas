import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  trend?: { value: number; label: string }
  variant?: 'default' | 'danger' | 'warning' | 'success'
  loading?: boolean
}

const variantStyles = {
  default: 'text-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10',
  danger: 'text-red-500 bg-red-500/10',
  warning: 'text-amber-500 bg-amber-500/10',
  success: 'text-emerald-500 bg-emerald-500/10',
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  variant = 'default',
  loading,
}: StatCardProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-9 rounded-lg" />
          </div>
          <Skeleton className="mt-4 h-8 w-16" />
          <Skeleton className="mt-1 h-3 w-32" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">{title}</p>
          <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', variantStyles[variant])}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <p className="mt-4 text-3xl font-bold tracking-tight">{value}</p>
        {description && (
          <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{description}</p>
        )}
        {trend && (
          <p
            className={cn(
              'mt-2 text-xs font-medium',
              trend.value > 0 ? 'text-emerald-500' : trend.value < 0 ? 'text-red-500' : 'text-[hsl(var(--muted-foreground))]'
            )}
          >
            {trend.value > 0 ? '↑' : trend.value < 0 ? '↓' : '—'} {Math.abs(trend.value)}%{' '}
            {trend.label}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
