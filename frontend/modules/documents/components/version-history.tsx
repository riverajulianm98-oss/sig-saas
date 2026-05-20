'use client'

import { useState } from 'react'
import {
  FileDown,
  Plus,
  Loader2,
  FileText,
  HardDrive,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatDate, cn } from '@/lib/utils'
import { documentsService } from '@/services/documents.service'
import { useAddVersion } from '../hooks/use-documents'
import { FileUploadZone } from './file-upload'
import type { DocumentVersion } from '@/types/documents'

interface VersionHistoryProps {
  documentId: string
  versions: DocumentVersion[]
  currentVersionId: string | null
  canEdit: boolean
}

const versionSchema = z.object({
  change_summary: z.string().min(2, 'Mínimo 2 caracteres'),
})

function formatFileSize(bytes: number | null) {
  if (!bytes) return null
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function VersionHistory({
  documentId,
  versions,
  currentVersionId,
  canEdit,
}: VersionHistoryProps) {
  const [showNewVersion, setShowNewVersion] = useState(false)
  const [newVersionId, setNewVersionId] = useState<string | null>(null)
  const [downloadLoading, setDownloadLoading] = useState<string | null>(null)

  const { mutateAsync: addVersion, isPending } = useAddVersion(documentId)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(versionSchema) })

  const handleAddVersion = async (values: { change_summary: string }) => {
    const doc = await addVersion(values)
    const latestVersion = doc.versions[doc.versions.length - 1]
    if (latestVersion) setNewVersionId(latestVersion.id)
    reset()
    setShowNewVersion(false)
  }

  const handleDownload = async (versionId: string) => {
    setDownloadLoading(versionId)
    try {
      const { url } = await documentsService.getDownloadUrl(documentId, versionId)
      window.open(url, '_blank')
    } catch {
      // fallback to direct download
      window.open(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/documents/${documentId}/versions/${versionId}/download`,
        '_blank'
      )
    } finally {
      setDownloadLoading(null)
    }
  }

  const sortedVersions = [...versions].sort((a, b) => b.version_number - a.version_number)

  return (
    <div className="space-y-4">
      {/* New version button */}
      {canEdit && !showNewVersion && (
        <Button variant="outline" size="sm" onClick={() => setShowNewVersion(true)}>
          <Plus className="h-3.5 w-3.5" />
          Nueva versión
        </Button>
      )}

      {/* New version form */}
      {showNewVersion && (
        <div className="rounded-xl border border-[hsl(var(--border))] p-4 space-y-3">
          <p className="text-sm font-medium">Crear nueva versión</p>
          <form onSubmit={handleSubmit(handleAddVersion)} className="space-y-3">
            <div className="space-y-1.5">
              <Label>Resumen del cambio *</Label>
              <Input placeholder="Describe qué cambió en esta versión..." {...register('change_summary')} />
              {errors.change_summary && (
                <p className="text-xs text-[hsl(var(--destructive))]">
                  {errors.change_summary.message as string}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowNewVersion(false)}>
                Cancelar
              </Button>
              <Button type="submit" size="sm" disabled={isPending}>
                {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Crear versión
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Upload for newly created version */}
      {newVersionId && canEdit && (
        <div className="rounded-xl border border-[hsl(var(--border))] p-4 space-y-2">
          <p className="text-sm font-medium">Subir archivo a la nueva versión</p>
          <FileUploadZone
            documentId={documentId}
            versionId={newVersionId}
            onSuccess={() => setNewVersionId(null)}
          />
        </div>
      )}

      {/* Version list */}
      <div className="space-y-2">
        {sortedVersions.map((v) => {
          const isCurrent = v.id === currentVersionId
          return (
            <div
              key={v.id}
              className={cn(
                'flex items-center gap-4 rounded-xl border px-4 py-3 transition-colors',
                isCurrent
                  ? 'border-[hsl(var(--primary))]/40 bg-[hsl(var(--primary))]/5'
                  : 'border-[hsl(var(--border))] bg-[hsl(var(--card))]'
              )}
            >
              {/* Version number */}
              <div
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-mono text-sm font-bold',
                  isCurrent
                    ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                    : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'
                )}
              >
                v{v.version_number}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate">
                    {v.change_summary ?? 'Sin descripción'}
                  </span>
                  {isCurrent && (
                    <span className="rounded-full bg-[hsl(var(--primary))]/10 px-2 py-0.5 text-[10px] font-semibold text-[hsl(var(--primary))]">
                      actual
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
                  {v.file_name && (
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {v.file_name}
                    </span>
                  )}
                  {v.file_size && (
                    <span className="flex items-center gap-1">
                      <HardDrive className="h-3 w-3" />
                      {formatFileSize(v.file_size)}
                    </span>
                  )}
                  <span>{formatDate(v.created_at)}</span>
                </div>
              </div>

              {/* Download */}
              {v.storage_key && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  disabled={downloadLoading === v.id}
                  onClick={() => handleDownload(v.id)}
                >
                  {downloadLoading === v.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <FileDown className="h-3.5 w-3.5" />
                  )}
                </Button>
              )}
            </div>
          )
        })}

        {versions.length === 0 && (
          <div className="flex items-center justify-center rounded-xl border border-dashed border-[hsl(var(--border))] py-10 text-sm text-[hsl(var(--muted-foreground))]">
            Sin versiones registradas
          </div>
        )}
      </div>
    </div>
  )
}
