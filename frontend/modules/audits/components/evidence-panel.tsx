'use client'

import { useRef, useState } from 'react'
import { Upload, Link, FileText, ExternalLink, Loader2, File, CloudUpload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuditEvidences, useUploadEvidence, useAddUrlEvidence } from '../hooks/use-audits'
import { formatDate } from '@/lib/utils'
import type { EvidenceType } from '@/types/audits'

const EVIDENCE_TYPE_ICONS: Record<EvidenceType, React.ReactNode> = {
  document_reference: <FileText className="h-4 w-4 text-blue-600" />,
  file_upload:        <File className="h-4 w-4 text-purple-600" />,
  external_url:       <ExternalLink className="h-4 w-4 text-emerald-600" />,
}

const EVIDENCE_TYPE_LABELS: Record<EvidenceType, string> = {
  document_reference: 'Documento referenciado',
  file_upload:        'Archivo adjunto',
  external_url:       'URL externa',
}

interface EvidencePanelProps {
  auditId: string
  canAdd: boolean
}

export function EvidencePanel({ auditId, canAdd }: EvidencePanelProps) {
  const { data: evidences, isLoading } = useAuditEvidences(auditId)
  const { mutateAsync: uploadEvidence, isPending: uploading } = useUploadEvidence()
  const { mutateAsync: addUrl, isPending: addingUrl } = useAddUrlEvidence()

  const [mode, setMode] = useState<'upload' | 'url' | null>(null)
  const [urlInput, setUrlInput] = useState('')
  const [urlDesc, setUrlDesc] = useState('')
  const [drag, setDrag] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return
    setError(null)
    setProgress(0)
    try {
      await uploadEvidence({
        auditId,
        file: files[0],
      })
      setMode(null)
      setProgress(0)
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Error al subir evidencia')
    }
  }

  const handleAddUrl = async () => {
    if (!urlInput.trim()) return
    setError(null)
    try {
      await addUrl({ auditId, data: { external_url: urlInput, description: urlDesc || undefined } })
      setUrlInput('')
      setUrlDesc('')
      setMode(null)
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Error al agregar URL')
    }
  }

  if (isLoading) {
    return <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}</div>
  }

  return (
    <div className="space-y-4">
      {canAdd && (
        <div className="flex gap-2">
          <Button size="sm" variant={mode === 'upload' ? 'default' : 'outline'} onClick={() => setMode(mode === 'upload' ? null : 'upload')} className="gap-1.5">
            <Upload className="h-3.5 w-3.5" /> Subir archivo
          </Button>
          <Button size="sm" variant={mode === 'url' ? 'default' : 'outline'} onClick={() => setMode(mode === 'url' ? null : 'url')} className="gap-1.5">
            <Link className="h-3.5 w-3.5" /> URL externa
          </Button>
        </div>
      )}

      {error && (
        <div className="rounded-md bg-[hsl(var(--destructive))]/10 p-3 text-xs text-[hsl(var(--destructive))]">{error}</div>
      )}

      {/* Upload zone */}
      {mode === 'upload' && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); handleFiles(e.dataTransfer.files) }}
          onClick={() => fileRef.current?.click()}
          className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all ${
            drag
              ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5'
              : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]/50 hover:bg-[hsl(var(--muted))]/30'
          }`}
        >
          <input ref={fileRef} type="file" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
          {uploading ? (
            <div className="space-y-3">
              <Loader2 className="h-8 w-8 mx-auto animate-spin text-[hsl(var(--primary))]" />
              <div className="h-1.5 rounded-full bg-[hsl(var(--muted))] mx-auto max-w-xs">
                <div className="h-1.5 rounded-full bg-[hsl(var(--primary))] transition-all" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Subiendo... {progress}%</p>
            </div>
          ) : (
            <>
              <CloudUpload className="h-8 w-8 mx-auto text-[hsl(var(--muted-foreground))]" />
              <p className="mt-3 text-sm font-medium">Arrastra un archivo o haz clic para seleccionar</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">PDF, imágenes, documentos — hasta 25 MB</p>
            </>
          )}
        </div>
      )}

      {/* URL input */}
      {mode === 'url' && (
        <div className="rounded-xl border border-[hsl(var(--border))] p-4 space-y-3">
          <div className="space-y-1.5">
            <Label>URL de evidencia *</Label>
            <Input placeholder="https://..." value={urlInput} onChange={(e) => setUrlInput(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Descripción</Label>
            <Input placeholder="Descripción del recurso..." value={urlDesc} onChange={(e) => setUrlDesc(e.target.value)} />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={() => { setMode(null); setUrlInput(''); setUrlDesc('') }}>Cancelar</Button>
            <Button size="sm" disabled={!urlInput.trim() || addingUrl} onClick={handleAddUrl}>
              {addingUrl && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Agregar
            </Button>
          </div>
        </div>
      )}

      {/* Evidence list */}
      {!evidences?.length ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[hsl(var(--border))] py-12 text-center">
          <FileText className="h-8 w-8 text-[hsl(var(--muted-foreground))]" />
          <p className="mt-3 text-sm font-medium">Sin evidencias</p>
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
            Adjunta archivos, URLs o referencias documentales
          </p>
        </div>
      ) : (
        <div className="divide-y divide-[hsl(var(--border))] rounded-xl border border-[hsl(var(--border))] overflow-hidden">
          {evidences.map((ev) => (
            <div key={ev.id} className="flex items-center gap-3 px-4 py-3 hover:bg-[hsl(var(--accent))]/30 transition-colors">
              <div className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--muted))]">
                {EVIDENCE_TYPE_ICONS[ev.evidence_type]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {ev.file_name ?? ev.external_url ?? `Documento referenciado`}
                </p>
                <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
                  <span>{EVIDENCE_TYPE_LABELS[ev.evidence_type]}</span>
                  <span>·</span>
                  <span>{formatDate(ev.created_at)}</span>
                  {ev.description && <span>· {ev.description}</span>}
                </div>
              </div>
              {ev.external_url && (
                <a href={ev.external_url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))]">
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
