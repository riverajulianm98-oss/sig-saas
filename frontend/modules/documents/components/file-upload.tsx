'use client'

import { useCallback, useState } from 'react'
import { Upload, X, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { documentsService } from '@/services/documents.service'

const ALLOWED_MIME = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'image/png',
  'image/jpeg',
  'image/webp',
]
const MAX_MB = 50

interface FileUploadZoneProps {
  documentId: string
  versionId: string
  onSuccess?: () => void
}

export function FileUploadZone({ documentId, versionId, onSuccess }: FileUploadZoneProps) {
  const [dragOver, setDragOver] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const validate = (f: File): string | null => {
    if (!ALLOWED_MIME.includes(f.type)) return 'Tipo de archivo no permitido'
    if (f.size > MAX_MB * 1024 * 1024) return `El archivo supera ${MAX_MB}MB`
    return null
  }

  const selectFile = (f: File) => {
    const err = validate(f)
    if (err) { setErrorMsg(err); return }
    setFile(f)
    setErrorMsg(null)
    setStatus('idle')
    setProgress(0)
  }

  const upload = async () => {
    if (!file) return
    setStatus('uploading')
    setProgress(0)
    try {
      await documentsService.uploadFile(documentId, versionId, file, setProgress)
      setStatus('done')
      setTimeout(() => onSuccess?.(), 800)
    } catch {
      setStatus('error')
      setErrorMsg('Error al subir el archivo. Intenta de nuevo.')
    }
  }

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const f = e.dataTransfer.files[0]
      if (f) selectFile(f)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => document.getElementById('file-input')?.click()}
        className={cn(
          'flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 cursor-pointer transition-colors text-center',
          dragOver
            ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5'
            : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]/40 hover:bg-[hsl(var(--accent))]/40'
        )}
      >
        <input
          id="file-input"
          type="file"
          className="hidden"
          accept={ALLOWED_MIME.join(',')}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) selectFile(f) }}
        />
        {!file ? (
          <>
            <Upload className="mb-2 h-8 w-8 text-[hsl(var(--muted-foreground))]" />
            <p className="text-sm font-medium">
              Arrastra un archivo aquí o{' '}
              <span className="text-[hsl(var(--primary))]">haz clic para seleccionar</span>
            </p>
            <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
              PDF, Word, Excel, imágenes — máx. {MAX_MB}MB
            </p>
          </>
        ) : (
          <div className="flex items-center gap-3 text-left w-full">
            <FileText className="h-8 w-8 shrink-0 text-[hsl(var(--primary))]" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{file.name}</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setFile(null); setStatus('idle') }}
              className="shrink-0 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Error */}
      {errorMsg && (
        <div className="flex items-center gap-2 rounded-md bg-[hsl(var(--destructive))]/10 p-2 text-xs text-[hsl(var(--destructive))]">
          <AlertCircle className="h-3.5 w-3.5" />
          {errorMsg}
        </div>
      )}

      {/* Progress */}
      {status === 'uploading' && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[hsl(var(--muted-foreground))]">
            <span className="flex items-center gap-1.5">
              <Loader2 className="h-3 w-3 animate-spin" />
              Subiendo...
            </span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-[hsl(var(--muted))]">
            <div
              className="h-1.5 rounded-full bg-[hsl(var(--primary))] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Success */}
      {status === 'done' && (
        <div className="flex items-center gap-2 rounded-md bg-emerald-500/10 p-2 text-xs text-emerald-600">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Archivo subido exitosamente
        </div>
      )}

      {/* Upload button */}
      {file && status === 'idle' && (
        <button
          type="button"
          onClick={upload}
          className="w-full rounded-lg bg-[hsl(var(--primary))] py-2 text-sm font-medium text-[hsl(var(--primary-foreground))] transition-opacity hover:opacity-90"
        >
          Subir archivo
        </button>
      )}
    </div>
  )
}
