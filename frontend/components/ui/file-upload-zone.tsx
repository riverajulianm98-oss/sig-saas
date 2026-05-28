'use client'

import { useRef, useState, useCallback, DragEvent, ChangeEvent } from 'react'
import { cn } from '@/lib/utils'
import { Upload, CheckCircle2, AlertCircle, Loader2, X, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'

export type UploadState = 'idle' | 'dragging' | 'uploading' | 'success' | 'error'

interface FileUploadZoneProps {
  /** Called with file + progress callback. Should reject on error. */
  onFile: (file: File, onProgress: (pct: number) => void) => Promise<void>
  accept?: string
  maxSizeMB?: number
  className?: string
  label?: string
  hint?: string
  disabled?: boolean
  onReset?: () => void
}

export function FileUploadZone({
  onFile,
  accept,
  maxSizeMB = 50,
  className,
  label = 'Arrastra un archivo aquí o haz clic para seleccionar',
  hint,
  disabled = false,
  onReset,
}: FileUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploadState, setUploadState] = useState<UploadState>('idle')
  const [progress, setProgress] = useState(0)
  const [fileName, setFileName] = useState<string | null>(null)
  const [fileSize, setFileSize] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const reset = useCallback(() => {
    setUploadState('idle')
    setProgress(0)
    setFileName(null)
    setFileSize(null)
    setError(null)
    if (inputRef.current) inputRef.current.value = ''
    onReset?.()
  }, [onReset])

  const process = useCallback(
    async (file: File) => {
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`El archivo supera el límite de ${maxSizeMB} MB`)
        setUploadState('error')
        return
      }
      setFileName(file.name)
      setFileSize(file.size)
      setUploadState('uploading')
      setProgress(0)
      setError(null)
      try {
        await onFile(file, (pct) => setProgress(pct))
        setUploadState('success')
        setProgress(100)
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Error al subir el archivo'
        setError(msg)
        setUploadState('error')
      }
    },
    [onFile, maxSizeMB]
  )

  const onDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      if (disabled || uploadState === 'uploading') return
      setUploadState('idle')
      const file = e.dataTransfer.files[0]
      if (file) process(file)
    },
    [disabled, uploadState, process]
  )

  const onInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) process(file)
    },
    [process]
  )

  const isActive = uploadState === 'dragging'
  const isUploading = uploadState === 'uploading'
  const isSuccess = uploadState === 'success'
  const isError = uploadState === 'error'

  return (
    <div
      className={cn(
        'relative rounded-lg border-2 border-dashed transition-colors duration-150',
        isActive && 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.06)]',
        !isActive && !isError && 'border-[hsl(var(--border))]',
        isError && 'border-[hsl(var(--destructive)/.5)] bg-[hsl(var(--destructive)/.04)]',
        isSuccess && 'border-[hsl(var(--primary)/.4)] bg-[hsl(var(--primary)/.04)]',
        disabled && 'pointer-events-none opacity-50',
        className
      )}
      onDragOver={(e) => { e.preventDefault(); setUploadState('dragging') }}
      onDragLeave={() => setUploadState(uploadState === 'dragging' ? 'idle' : uploadState)}
      onDrop={onDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={onInputChange}
        disabled={disabled || isUploading}
        aria-hidden
      />

      {/* Idle state */}
      {(uploadState === 'idle' || uploadState === 'dragging') && (
        <button
          type="button"
          className="flex w-full flex-col items-center gap-3 p-8 text-center"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
        >
          <div className={cn(
            'flex size-12 items-center justify-center rounded-full',
            isActive
              ? 'bg-[hsl(var(--primary)/.12)] text-[hsl(var(--primary))]'
              : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'
          )}>
            <Upload className="size-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-[hsl(var(--foreground))]">{label}</p>
            {hint && <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{hint}</p>}
            {!hint && (
              <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                Máximo {maxSizeMB} MB
              </p>
            )}
          </div>
        </button>
      )}

      {/* Uploading state */}
      {isUploading && (
        <div className="flex flex-col items-center gap-4 p-8">
          <div className="flex items-center gap-3">
            <Loader2 className="size-5 animate-spin text-[hsl(var(--primary))]" />
            <span className="text-sm font-medium">{fileName}</span>
          </div>
          <div className="w-full max-w-xs">
            <div className="mb-1.5 flex justify-between text-xs text-[hsl(var(--muted-foreground))]">
              <span>Subiendo…</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[hsl(var(--muted))]">
              <div
                className="h-full rounded-full bg-[hsl(var(--primary))] transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          {fileSize && (
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              {formatBytes(fileSize)}
            </p>
          )}
        </div>
      )}

      {/* Success state */}
      {isSuccess && (
        <div className="flex items-center justify-between gap-3 p-6">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="size-5 shrink-0 text-[hsl(var(--primary))]" />
            <div>
              <p className="text-sm font-medium">{fileName}</p>
              {fileSize && (
                <p className="text-xs text-[hsl(var(--muted-foreground))]">{formatBytes(fileSize)}</p>
              )}
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={reset} className="shrink-0">
            <X className="mr-1.5 size-3.5" />
            Quitar
          </Button>
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="flex items-center justify-between gap-3 p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="size-5 shrink-0 text-[hsl(var(--destructive))]" />
            <div>
              <p className="text-sm font-medium text-[hsl(var(--destructive))]">Error al subir</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">{error}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={reset} className="shrink-0">
            Reintentar
          </Button>
        </div>
      )}
    </div>
  )
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/** Skeleton placeholder while upload state is loading */
export function FileUploadZoneSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-3 rounded-lg border-2 border-dashed border-[hsl(var(--border))] p-8',
        className
      )}
    >
      <div className="size-12 animate-pulse rounded-full bg-[hsl(var(--muted))]" />
      <div className="h-4 w-48 animate-pulse rounded bg-[hsl(var(--muted))]" />
      <div className="h-3 w-32 animate-pulse rounded bg-[hsl(var(--muted))]" />
    </div>
  )
}
