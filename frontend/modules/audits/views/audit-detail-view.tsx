'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, Pencil, Trash2, Calendar, User, MapPin,
  Target, Loader2, ClipboardList, AlertTriangle,
  Sparkles, FileText, BarChart3, Activity,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { AuditStatusBadge, AuditTypeBadge, IsoStandardBadge } from '../components/audit-status-badge'
import { AuditWorkflowActions } from '../components/audit-workflow-actions'
import { ChecklistView } from '../components/checklist-view'
import { FindingsPanel } from '../components/findings-panel'
import { SuggestionsPanel } from '../components/suggestions-panel'
import { EvidencePanel } from '../components/evidence-panel'
import { ComplianceWidgets } from '../components/compliance-widgets'
import { AuditTimeline } from '../components/audit-timeline'
import { useAudit, useDeleteAudit } from '../hooks/use-audits'
import { useAuth } from '@/hooks/use-auth'
import { ROLE_LEVEL } from '@/lib/constants'
import { formatDate } from '@/lib/utils'

const TABS = [
  { id: 'overview',   label: 'Overview',   icon: <ClipboardList className="h-3.5 w-3.5" /> },
  { id: 'checklist',  label: 'Checklist',  icon: <ClipboardList className="h-3.5 w-3.5" /> },
  { id: 'hallazgos',  label: 'Hallazgos',  icon: <AlertTriangle className="h-3.5 w-3.5" /> },
  { id: 'ia',         label: 'IA',         icon: <Sparkles className="h-3.5 w-3.5" /> },
  { id: 'evidencias', label: 'Evidencias', icon: <FileText className="h-3.5 w-3.5" /> },
  { id: 'compliance', label: 'Compliance', icon: <BarChart3 className="h-3.5 w-3.5" /> },
  { id: 'timeline',   label: 'Timeline',   icon: <Activity className="h-3.5 w-3.5" /> },
] as const

type TabId = (typeof TABS)[number]['id']

interface AuditDetailViewProps {
  auditId: string
}

export function AuditDetailView({ auditId }: AuditDetailViewProps) {
  const router = useRouter()
  const { user } = useAuth()
  const canAdmin = user ? ROLE_LEVEL[user.role] >= ROLE_LEVEL['coordinador_sig'] : false
  const canAudit = user ? ROLE_LEVEL[user.role] >= ROLE_LEVEL['auditor'] : false
  const canView  = user ? ROLE_LEVEL[user.role] >= ROLE_LEVEL['lider_proceso'] : false

  const [activeTab, setActiveTab] = useState<TabId>('overview')

  const { data: audit, isLoading } = useAudit(auditId)
  const { mutateAsync: deleteAudit, isPending: isDeleting } = useDeleteAudit()

  const handleDelete = async () => {
    if (!confirm(`¿Eliminar "${audit?.title}"? Esta acción no se puede deshacer.`)) return
    await deleteAudit(auditId)
    router.push('/audits')
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    )
  }

  if (!audit) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm font-medium">Auditoría no encontrada</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => router.push('/audits')}>
          Volver al listado
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back + actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => router.push('/audits')} className="gap-1.5">
            <ArrowLeft className="h-3.5 w-3.5" />
            Auditorías
          </Button>
          <Separator orientation="vertical" className="h-5" />
          <span className="font-mono text-sm text-[hsl(var(--muted-foreground))]">{audit.code}</span>
        </div>
        {canAdmin && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Pencil className="h-3.5 w-3.5" /> Editar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="gap-1.5 text-red-600 hover:text-red-600 hover:border-red-300"
            >
              {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              Eliminar
            </Button>
          </div>
        )}
      </div>

      {/* Header card */}
      <div className="rounded-2xl border border-[hsl(var(--border))] p-6 space-y-4">
        <div className="flex items-start gap-4 justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <AuditStatusBadge status={audit.status} />
              <AuditTypeBadge type={audit.audit_type} />
              {audit.iso_standards?.map((s) => <IsoStandardBadge key={s} standard={s} />)}
            </div>
            <h1 className="text-xl font-semibold tracking-tight">{audit.title}</h1>
            {audit.description && (
              <p className="text-sm text-[hsl(var(--muted-foreground))] max-w-2xl">{audit.description}</p>
            )}
          </div>
          {audit.compliance_score !== null && (
            <div className="flex-shrink-0 flex flex-col items-center gap-1">
              <div className={`text-3xl font-bold tabular-nums ${
                audit.compliance_score >= 80 ? 'text-emerald-600' :
                audit.compliance_score >= 60 ? 'text-amber-600' : 'text-red-600'
              }`}>
                {audit.compliance_score}%
              </div>
              <span className="text-[10px] uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Compliance</span>
            </div>
          )}
        </div>

        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[hsl(var(--muted-foreground))] border-t border-[hsl(var(--border))] pt-4">
          {audit.process_area && (
            <span className="flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5" /> {audit.process_area}
            </span>
          )}
          {audit.location && (
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" /> {audit.location}
            </span>
          )}
          {audit.planned_start_date && (
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(audit.planned_start_date)}
              {audit.planned_end_date && ` → ${formatDate(audit.planned_end_date)}`}
            </span>
          )}
          {audit.lead_auditor_id && (
            <span className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" /> Auditor líder asignado
            </span>
          )}
        </div>

        {/* Stats chips */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="rounded-lg bg-[hsl(var(--muted))]/50 border border-[hsl(var(--border))] px-3 py-1.5 text-center">
            <p className="text-lg font-bold tabular-nums">{audit.checklist_items_count}</p>
            <p className="text-[10px] uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Checklist</p>
          </div>
          <div className={`rounded-lg px-3 py-1.5 text-center border ${audit.findings_count > 0 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-[hsl(var(--muted))]/50 border-[hsl(var(--border))]'}`}>
            <p className="text-lg font-bold tabular-nums">{audit.findings_count}</p>
            <p className="text-[10px] uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Hallazgos</p>
          </div>
          <div className={`rounded-lg px-3 py-1.5 text-center border ${audit.critical_findings_count > 0 ? 'bg-red-500/10 border-red-500/20' : 'bg-[hsl(var(--muted))]/50 border-[hsl(var(--border))]'}`}>
            <p className={`text-lg font-bold tabular-nums ${audit.critical_findings_count > 0 ? 'text-red-600' : ''}`}>{audit.critical_findings_count}</p>
            <p className="text-[10px] uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Críticos</p>
          </div>
          <div className={`rounded-lg px-3 py-1.5 text-center border ${audit.open_findings_count > 0 ? 'bg-orange-500/10 border-orange-500/20' : 'bg-[hsl(var(--muted))]/50 border-[hsl(var(--border))]'}`}>
            <p className="text-lg font-bold tabular-nums">{audit.open_findings_count}</p>
            <p className="text-[10px] uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Abiertos</p>
          </div>
        </div>

        {/* Workflow actions */}
        <AuditWorkflowActions
          auditId={auditId}
          status={audit.status}
          canChange={canAdmin || canAudit}
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-[hsl(var(--border))]">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === tab.id
                ? 'border-[hsl(var(--primary))] text-[hsl(var(--primary))]'
                : 'border-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:border-[hsl(var(--border))]'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="min-h-[24rem]">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {audit.objectives && (
              <div className="rounded-xl border border-[hsl(var(--border))] p-5">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-2">
                  Objetivos
                </h4>
                <p className="text-sm">{audit.objectives}</p>
              </div>
            )}
            {audit.scope && (
              <div className="rounded-xl border border-[hsl(var(--border))] p-5">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-2">
                  Alcance
                </h4>
                <p className="text-sm">{audit.scope}</p>
              </div>
            )}
            {!audit.objectives && !audit.scope && (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[hsl(var(--border))] py-12 text-center">
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  No hay información adicional. Edita la auditoría para agregar objetivos y alcance.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'checklist' && (
          <ChecklistView
            auditId={auditId}
            canRespond={canAdmin || canAudit}
          />
        )}

        {activeTab === 'hallazgos' && (
          <FindingsPanel
            auditId={auditId}
            canCreate={canAdmin || canAudit || canView}
          />
        )}

        {activeTab === 'ia' && (
          <SuggestionsPanel
            auditId={auditId}
            canGenerate={canAdmin || canAudit}
            canReview={canAdmin || canAudit}
          />
        )}

        {activeTab === 'evidencias' && (
          <EvidencePanel
            auditId={auditId}
            canAdd={canAdmin || canAudit}
          />
        )}

        {activeTab === 'compliance' && (
          <ComplianceWidgets
            auditId={auditId}
            overallScore={audit.compliance_score}
          />
        )}

        {activeTab === 'timeline' && (
          <AuditTimeline auditId={auditId} />
        )}
      </div>
    </div>
  )
}
