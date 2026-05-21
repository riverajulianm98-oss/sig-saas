'use client'

import Link from 'next/link'
import {
  ClipboardCheck, AlertTriangle, FileText, TrendingUp,
  CheckCircle2, ArrowRight, Activity, Target, Zap,
} from 'lucide-react'
import { useAuditDashboard } from '../hooks/use-dashboard'
import { useDocumentAlerts } from '@/modules/documents/hooks/use-documents'
import { useAuthStore } from '@/store/auth.store'
import { Skeleton } from '@/components/ui/skeleton'
import { DemoTourButton } from '@/components/demo/demo-tour'
import { isDemoMode } from '@/lib/demo-mode'
import { cn } from '@/lib/utils'

// ─── Score ring ───────────────────────────────────────────────────────────────
function ScoreRingHero({ score }: { score: number }) {
  const r = 58
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : score >= 40 ? '#f97316' : '#ef4444'
  const label = score >= 80 ? 'Excelente' : score >= 60 ? 'Aceptable' : score >= 40 ? 'Por mejorar' : 'Crítico'

  return (
    <div className="relative flex flex-col items-center gap-2">
      <svg width="160" height="160" viewBox="0 0 160 160">
        <circle cx="80" cy="80" r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="12" />
        <circle
          cx="80" cy="80" r={r} fill="none"
          stroke={color} strokeWidth="12" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          transform="rotate(-90 80 80)"
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-black tabular-nums" style={{ color }}>{score}%</span>
        <span className="text-[11px] text-[hsl(var(--muted-foreground))] font-medium mt-0.5">compliance</span>
      </div>
      <span className="text-sm font-semibold" style={{ color }}>{label}</span>
    </div>
  )
}

// ─── Stat chip ────────────────────────────────────────────────────────────────
interface StatChipProps {
  label: string
  value: number | string
  sub?: string
  color: string
  icon: React.ElementType
  href?: string
}

function StatChip({ label, value, sub, color, icon: Icon, href }: StatChipProps) {
  const inner = (
    <div className={cn(
      'group relative flex flex-col gap-3 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 transition-all',
      href && 'cursor-pointer hover:shadow-lg hover:border-[hsl(var(--primary))]/30 hover:-translate-y-0.5'
    )}>
      <div className="flex items-start justify-between">
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', color)}>
          <Icon className="h-5 w-5" />
        </div>
        {href && (
          <ArrowRight className="h-4 w-4 text-[hsl(var(--muted-foreground))] opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </div>
      <div>
        <p className="text-3xl font-black tabular-nums tracking-tight">{value}</p>
        <p className="mt-0.5 text-sm font-medium text-[hsl(var(--foreground))]">{label}</p>
        {sub && <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">{sub}</p>}
      </div>
    </div>
  )
  return href ? <Link href={href}>{inner}</Link> : inner
}

// ─── Findings severity bar ────────────────────────────────────────────────────
function SeverityBar({ data }: { data: Record<string, number> }) {
  const total = Object.values(data).reduce((s, v) => s + v, 0)
  if (!total) return null

  const COLORS: Record<string, string> = {
    critica: 'bg-red-500',
    alta: 'bg-orange-500',
    media: 'bg-amber-400',
    baja: 'bg-emerald-500',
  }
  const LABELS: Record<string, string> = {
    critica: 'Crítica', alta: 'Alta', media: 'Media', baja: 'Baja',
  }
  const ORDER = ['critica', 'alta', 'media', 'baja']

  return (
    <div className="space-y-3">
      <div className="flex h-3 w-full overflow-hidden rounded-full gap-0.5">
        {ORDER.filter(k => data[k] > 0).map(k => (
          <div
            key={k}
            className={cn('h-full rounded-full transition-all', COLORS[k])}
            style={{ width: `${(data[k] / total) * 100}%` }}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        {ORDER.filter(k => data[k] > 0).map(k => (
          <div key={k} className="flex items-center gap-1.5 text-xs text-[hsl(var(--muted-foreground))]">
            <span className={cn('h-2 w-2 rounded-full inline-block', COLORS[k])} />
            <span className="font-medium text-[hsl(var(--foreground))]">{data[k]}</span>
            {LABELS[k]}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main view ────────────────────────────────────────────────────────────────
export function DashboardView() {
  const { user } = useAuthStore()
  const { data, isLoading } = useAuditDashboard()
  const { data: docAlerts } = useDocumentAlerts()

  const score = data?.avg_compliance_score ? Math.round(data.avg_compliance_score) : null
  const expiredDocs = (docAlerts?.expired?.length ?? 0) + (docAlerts?.expiring_critical?.length ?? 0)

  const firstName = user?.full_name?.split(' ')[0] ?? 'Usuario'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches'

  return (
    <div className="space-y-8 max-w-7xl">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">
            {greeting}, {firstName}
          </h1>
          <p className="text-[hsl(var(--muted-foreground))] mt-1">
            Estado actual del Sistema Integrado de Gestión · SIGCYA Consulting S.A.S.
          </p>
        </div>
        {isDemoMode() && (
          <div className="shrink-0 pt-1">
            <DemoTourButton />
          </div>
        )}
      </div>

      {/* Hero row: score ring + 4 stat chips */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[240px_1fr]">

        {/* Compliance score hero card */}
        <div className="flex flex-col items-center justify-center rounded-2xl border border-[hsl(var(--border))] bg-gradient-to-br from-[hsl(var(--card))] to-[hsl(var(--primary))]/5 p-6 gap-2">
          {isLoading ? (
            <Skeleton className="h-40 w-40 rounded-full" />
          ) : score !== null ? (
            <>
              <ScoreRingHero score={score} />
              <p className="text-xs text-[hsl(var(--muted-foreground))] text-center mt-1">
                Score global de compliance<br />sobre {data?.total_audits ?? 0} auditorías
              </p>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <Target className="h-10 w-10 text-[hsl(var(--muted-foreground))]/40" />
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Sin datos de compliance</p>
            </div>
          )}
        </div>

        {/* Stat chips grid */}
        <div className="grid grid-cols-2 gap-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))
          ) : (
            <>
              <StatChip
                label="Auditorías abiertas"
                value={data?.open_audits ?? 0}
                sub={`${data?.in_progress ?? 0} en ejecución`}
                color="text-blue-600 bg-blue-500/10"
                icon={ClipboardCheck}
                href="/audits"
              />
              <StatChip
                label="Hallazgos críticos"
                value={data?.critical_findings ?? 0}
                sub={`${data?.open_findings ?? 0} abiertos en total`}
                color={data?.critical_findings ? 'text-red-500 bg-red-500/10' : 'text-emerald-500 bg-emerald-500/10'}
                icon={AlertTriangle}
                href="/findings"
              />
              <StatChip
                label="Docs. vencidos"
                value={expiredDocs}
                sub={`${docAlerts?.expiring_soon?.length ?? 0} próximos a vencer`}
                color={expiredDocs > 0 ? 'text-amber-500 bg-amber-500/10' : 'text-emerald-500 bg-emerald-500/10'}
                icon={FileText}
                href="/documents"
              />
              <StatChip
                label="Auditorías finalizadas"
                value={(data?.completed ?? 0) + (data?.closed ?? 0)}
                sub={`${data?.total_audits ?? 0} totales registradas`}
                color="text-emerald-500 bg-emerald-500/10"
                icon={CheckCircle2}
                href="/audits"
              />
            </>
          )}
        </div>
      </div>

      {/* Bottom row: findings + activity */}
      <div className="grid gap-4 lg:grid-cols-2">

        {/* Findings severity */}
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10">
              <Activity className="h-4 w-4 text-red-500" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Distribución de hallazgos</h3>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                {data?.open_findings ?? 0} hallazgos abiertos
              </p>
            </div>
          </div>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-3 w-full rounded-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : (
            <SeverityBar data={data?.findings_by_severity ?? {}} />
          )}
          <Link
            href="/findings"
            className="mt-5 flex items-center gap-1.5 text-xs font-medium text-[hsl(var(--primary))] hover:underline"
          >
            Ver todos los hallazgos <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Quick actions */}
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--primary))]/10">
              <Zap className="h-4 w-4 text-[hsl(var(--primary))]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Acciones rápidas</h3>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">Acceso directo a módulos clave</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Nueva auditoría', icon: ClipboardCheck, href: '/audits', color: 'text-blue-600 bg-blue-500/10' },
              { label: 'Ver documentos', icon: FileText, href: '/documents', color: 'text-purple-600 bg-purple-500/10' },
              { label: 'Hallazgos abiertos', icon: AlertTriangle, href: '/findings', color: 'text-red-500 bg-red-500/10' },
              { label: 'Seguimiento auditorías', icon: TrendingUp, href: '/audits', color: 'text-emerald-600 bg-emerald-500/10' },
            ].map(({ label, icon: Icon, href, color }) => (
              <Link
                key={href + label}
                href={href}
                className="flex items-center gap-2.5 rounded-xl border border-[hsl(var(--border))] p-3 text-sm font-medium transition-all hover:bg-[hsl(var(--accent))] hover:border-[hsl(var(--primary))]/20 group"
              >
                <div className={cn('flex h-7 w-7 items-center justify-center rounded-lg shrink-0', color)}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <span className="leading-tight">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
