'use client'

import {
  ClipboardCheck,
  AlertTriangle,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle2,
} from 'lucide-react'
import { StatCard } from '../components/stat-card'
import { ComplianceScore } from '../components/compliance-score'
import { FindingsChart } from '../components/findings-chart'
import { useAuditDashboard } from '../hooks/use-dashboard'
import { useDocumentAlerts } from '@/modules/documents/hooks/use-documents'
import { useAuthStore } from '@/store/auth.store'

export function DashboardView() {
  const { user } = useAuthStore()
  const { data, isLoading } = useAuditDashboard()
  const { data: docAlerts } = useDocumentAlerts()

  const score = data?.avg_compliance_score ?? null
  const findingsBySeverity = data?.findings_by_severity ?? {}
  const expiredDocs = (docAlerts?.expired?.length ?? 0) + (docAlerts?.expiring_critical?.length ?? 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Hola, {user?.full_name?.split(' ')[0] ?? 'Usuario'} 👋
        </h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
          Aquí está el resumen de tu Sistema Integrado de Gestión
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Auditorías abiertas"
          value={data?.open_audits ?? 0}
          description={`${data?.in_progress ?? 0} en proceso`}
          icon={ClipboardCheck}
          variant="default"
          loading={isLoading}
        />
        <StatCard
          title="Hallazgos críticos"
          value={data?.critical_findings ?? 0}
          description={`${data?.open_findings ?? 0} hallazgos abiertos`}
          icon={AlertTriangle}
          variant={data?.critical_findings ? 'danger' : 'success'}
          loading={isLoading}
        />
        <StatCard
          title="Docs. vencidos/críticos"
          value={expiredDocs}
          description={`${docAlerts?.expiring_soon?.length ?? 0} próximos a vencer`}
          icon={FileText}
          variant={expiredDocs > 0 ? 'warning' : 'success'}
          loading={isLoading}
        />
        <StatCard
          title="Auditorías completadas"
          value={data?.completed ?? 0}
          description={`${data?.total_audits ?? 0} auditorías totales`}
          icon={CheckCircle2}
          variant="success"
          loading={isLoading}
        />
        <StatCard
          title="Cerradas"
          value={data?.closed ?? 0}
          description="Ciclo completo"
          icon={TrendingUp}
          variant="default"
          loading={isLoading}
        />
      </div>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-3">
        <ComplianceScore score={score !== null ? Math.round(score) : null} loading={isLoading} />
        <div className="lg:col-span-2">
          <FindingsChart data={findingsBySeverity} loading={isLoading} />
        </div>
      </div>

      {/* Quick actions */}
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
        <h2 className="text-sm font-semibold mb-4">Acciones rápidas</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Nueva auditoría', icon: ClipboardCheck, href: '/audits/new' },
            { label: 'Subir documento', icon: FileText, href: '/documents/new' },
            { label: 'Registrar hallazgo', icon: AlertTriangle, href: '/findings/new' },
            { label: 'Ver pendientes', icon: Clock, href: '/findings' },
          ].map((action) => {
            const Icon = action.icon
            return (
              <a
                key={action.href}
                href={action.href}
                className="flex items-center gap-3 rounded-lg border border-[hsl(var(--border))] p-3 text-sm font-medium transition-colors hover:bg-[hsl(var(--accent))]"
              >
                <Icon className="h-4 w-4 text-[hsl(var(--primary))]" />
                {action.label}
              </a>
            )
          })}
        </div>
      </div>
    </div>
  )
}
