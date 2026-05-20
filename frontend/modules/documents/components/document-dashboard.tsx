'use client'

import Link from 'next/link'
import { AlertTriangle, Clock, FileText, CheckCircle2, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate, cn } from '@/lib/utils'
import { useDocumentAlerts } from '../hooks/use-documents'

export function DocumentDashboard() {
  const { data, isLoading } = useDocumentAlerts()

  const expired = data?.expired ?? []
  const critical = data?.expiring_critical ?? []
  const warning = data?.expiring_soon ?? []

  const stats = [
    {
      label: 'Vencidos',
      value: expired.length,
      icon: XCircle,
      color: 'text-red-500 bg-red-500/10',
      href: '/documents?status=aprobado',
    },
    {
      label: 'Críticos (≤15d)',
      value: critical.length,
      icon: AlertTriangle,
      color: 'text-orange-500 bg-orange-500/10',
      href: '/documents',
    },
    {
      label: 'Por vencer (≤30d)',
      value: warning.length,
      icon: Clock,
      color: 'text-amber-500 bg-amber-500/10',
      href: '/documents',
    },
    {
      label: 'Total alertas',
      value: expired.length + critical.length + warning.length,
      icon: FileText,
      color: 'text-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10',
      href: '/documents',
    },
  ]

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((_, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <Skeleton className="h-4 w-24 mb-3" />
              <Skeleton className="h-8 w-12" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <Link key={s.label} href={s.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-[hsl(var(--muted-foreground))]">
                      {s.label}
                    </p>
                    <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', s.color)}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold">{s.value}</p>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Alert list */}
      {(expired.length > 0 || critical.length > 0) && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Documentos que requieren atención
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-[hsl(var(--border))]">
              {[...expired.slice(0, 3), ...critical.slice(0, 3)].map(({ document, severity, expires_at }) => (
                <Link
                  key={document.id}
                  href={`/documents/${document.id}`}
                  className="flex items-center gap-4 px-5 py-3 hover:bg-[hsl(var(--accent))]/60 transition-colors"
                >
                  <div
                    className={cn(
                      'h-2 w-2 shrink-0 rounded-full',
                      severity === 'expired' && 'bg-red-500',
                      severity === 'critical' && 'bg-orange-500',
                      severity === 'warning' && 'bg-amber-500'
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{document.title}</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">{document.code}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p
                      className={cn(
                        'text-xs font-medium',
                        severity === 'expired' && 'text-red-500',
                        severity === 'critical' && 'text-orange-500',
                        severity === 'warning' && 'text-amber-500'
                      )}
                    >
                      {severity === 'expired' ? 'Vencido' : 'Por vencer'}
                    </p>
                    {expires_at && (
                      <p className="text-[10px] text-[hsl(var(--muted-foreground))]">
                        {formatDate(expires_at)}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
            {expired.length + critical.length > 6 && (
              <div className="px-5 py-3 text-xs text-[hsl(var(--muted-foreground))]">
                +{expired.length + critical.length - 6} más...
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {expired.length === 0 && critical.length === 0 && warning.length === 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/30 dark:bg-emerald-900/10">
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          <p className="text-sm text-emerald-700 dark:text-emerald-400">
            Todos los documentos están al día.
          </p>
        </div>
      )}
    </div>
  )
}
