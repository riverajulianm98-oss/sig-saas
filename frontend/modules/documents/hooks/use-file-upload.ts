'use client'

import { useCallback, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { documentsService } from '@/services/documents.service'
import { DOCUMENTS_KEYS } from './use-documents'

export type FileUploadState = 'idle' | 'creating_version' | 'uploading' | 'success' | 'error'

/**
 * Manages the two-step document upload flow:
 * 1. POST /documents/{id}/versions  → creates version record, returns versionId
 * 2. POST /documents/{id}/versions/{versionId}/upload  → streams the file
 *
 * Exposes real upload progress via axios onUploadProgress.
 */
export function useFileUpload(documentId: string) {
  const qc = useQueryClient()
  const [uploadState, setUploadState] = useState<FileUploadState>('idle')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const upload = useCallback(
    async (
      file: File,
      changeSummary: string,
      onProgress?: (pct: number) => void
    ) => {
      setUploadState('creating_version')
      setProgress(0)
      setError(null)

      try {
        // Step 1: create the version record
        const detail = await documentsService.addVersion(documentId, { change_summary: changeSummary })
        const latestVersion = detail.versions[detail.versions.length - 1]
        if (!latestVersion) throw new Error('No se pudo obtener la versión creada')

        // Step 2: upload the file
        setUploadState('uploading')
        await documentsService.uploadFile(documentId, latestVersion.id, file, (pct) => {
          setProgress(pct)
          onProgress?.(pct)
        })

        setUploadState('success')
        setProgress(100)
        qc.invalidateQueries({ queryKey: DOCUMENTS_KEYS.detail(documentId) })
        qc.invalidateQueries({ queryKey: DOCUMENTS_KEYS.lists() })
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Error al subir el archivo'
        setError(msg)
        setUploadState('error')
        throw e
      }
    },
    [documentId, qc]
  )

  const reset = useCallback(() => {
    setUploadState('idle')
    setProgress(0)
    setError(null)
  }, [])

  return {
    upload,
    uploadState,
    progress,
    error,
    reset,
    isIdle: uploadState === 'idle',
    isLoading: uploadState === 'creating_version' || uploadState === 'uploading',
    isSuccess: uploadState === 'success',
    isError: uploadState === 'error',
  }
}
