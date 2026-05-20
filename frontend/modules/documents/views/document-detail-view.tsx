'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Tag,
  Calendar,
  User,
  Layers,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { StatusBadge, TypeBadge } from '../components/status-badge'
import { WorkflowActions } from '../components/workflow-actions'
import { VersionHistory } from '../components/version-history'
import { DocumentTimeline } from '../components/document-timeline'
import { useDocument, useDocumentTimeline, useDeleteDocument } from '../hooks/use-documents'
import { useAuth } from '@/hooks/use-auth'
import { ROLE_LEVEL } from '@/lib/constants'
import { formatDate } from '@/lib/utils'

const TABS = ['General', 'Versiones', 'Timeline'] as const
type Tab = (typeof TABS)[number]

interface DocumentDetailViewProps {
  documentId: string
}

export function DocumentDetailView({ documentId }: DocumentDetailViewProps) {
  const router = useRouter()
  const { user } = useAuth()
  const canEdit = user ? ROLE_LEVEL[user.role] >= ROLE_LEVEL['lider_proceso'] : false
  const canAdmin = user ? ROLE_LEVEL[user.role] >= ROLE_LEVEL['coordinador_sig'] : false

  const [activeTab, setActiveTab] = useState<Tab>('General')

  const { data: doc, isLoading } = useDocument(documentId)
  const { data: timeline, isLoading: timelineLoading } = useDocumentTimeline(
    activeTab === 'Timeline' ? documentId : null
  )
  const { mutateAsync: deleteDoc, isPending: isDeleting } = useDeleteDocument()

  const handleDelete = async () => {
    if (!confirm(`¿Eliminar "${doc?.title}"? Esta acción no se puede deshacer.`)) return
    await deleteDoc(documentId)
    router.push('/documents')
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

  if (!doc) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
        <p className="text-lg font-semibold">Documento no encontrado</p>
        <Button variant="outline" onClick={() => router.push('/documents')}>
          <ArrowLeft className="h-4 w-4" />
          Volver a documentos
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back + actions */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Documentos
        </button>

        {canAdmin && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push(`/documents/${documentId}/edit`)}>
              <Pencil className="h-3.5 w-3.5" />
              Editar
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-[hsl(var(--destructive))]"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              Eliminar
            </Button>
          </div>
        )}
      </div>

      {/* Title block */}
      <div className="space-y-2">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-mono text-sm text-[hsl(var(--muted-foreground))]">{doc.code}</span>
          <TypeBadge type={doc.document_type} />
          <StatusBadge status={doc.status} />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">{doc.title}</h1>
        {doc.description && (
          <p className="text-sm text-[hsl(var(--muted-foreground))] max-w-2xl">{doc.description}</p>
        )}
      </div>

      {/* Metadata row */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-[hsl(var(--muted-foreground))]">
        {doc.process_area && (
          <span className="flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5" />
            {doc.process_area}
          </span>
        )}
        {doc.expires_at && (
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            Vence: {formatDate(doc.expires_at)}
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <User className="h-3.5 w-3.5" />
          Actualizado: {formatDate(doc.updated_at)}
        </span>
        {doc.tags && doc.tags.length > 0 && (
          <span className="flex items-center gap-1.5 flex-wrap">
            <Tag className="h-3.5 w-3.5 shrink-0" />
            {doc.tags.map((t) => (
              <span
                key={t}
                className="rounded-full bg-[hsl(var(--muted))] px-2 py-0.5 text-xs"
              >
                {t}
              </span>
            ))}
          </span>
        )}
      </div>

      {/* Workflow */}
      <WorkflowActions
        documentId={doc.id}
        currentStatus={doc.status}
        canChangeStatus={canEdit}
      />

      <Separator />

      {/* Tabs */}
      <div>
        <div className="flex gap-0 border-b border-[hsl(var(--border))]">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? 'border-[hsl(var(--primary))] text-[hsl(var(--primary))]'
                  : 'border-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="pt-6">
          {/* General tab */}
          {activeTab === 'General' && (
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Doc info */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold">Información general</h3>
                <dl className="space-y-3">
                  {[
                    { label: 'Código', value: doc.code },
                    { label: 'Tipo', value: doc.document_type },
                    { label: 'Estado', value: <StatusBadge status={doc.status} /> },
                    { label: 'Área de proceso', value: doc.process_area ?? '—' },
                    { label: 'Creado', value: formatDate(doc.created_at) },
                    { label: 'Actualizado', value: formatDate(doc.updated_at) },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-start gap-3">
                      <dt className="min-w-[120px] text-sm text-[hsl(var(--muted-foreground))]">
                        {label}
                      </dt>
                      <dd className="text-sm font-medium">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* Current version summary */}
              {doc.current_version && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Versión actual</h3>
                  <div className="rounded-xl border border-[hsl(var(--border))] p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[hsl(var(--primary))] font-mono text-xs font-bold text-[hsl(var(--primary-foreground))]">
                        v{doc.current_version.version_number}
                      </span>
                      <span className="text-sm font-medium">
                        {doc.current_version.change_summary ?? 'Sin descripción'}
                      </span>
                    </div>
                    {doc.current_version.file_name && (
                      <p className="text-xs text-[hsl(var(--muted-foreground))] flex items-center gap-1.5">
                        📄 {doc.current_version.file_name}
                      </p>
                    )}
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                      {formatDate(doc.current_version.created_at)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Versions tab */}
          {activeTab === 'Versiones' && (
            <VersionHistory
              documentId={doc.id}
              versions={doc.versions}
              currentVersionId={doc.current_version_id}
              canEdit={canEdit}
            />
          )}

          {/* Timeline tab */}
          {activeTab === 'Timeline' && (
            <DocumentTimeline
              entries={timeline?.items ?? []}
              isLoading={timelineLoading}
            />
          )}
        </div>
      </div>
    </div>
  )
}
