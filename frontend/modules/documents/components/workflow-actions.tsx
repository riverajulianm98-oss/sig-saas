'use client'

import { useState } from 'react'
import {
  Send,
  CheckCircle2,
  XCircle,
  Archive,
  ChevronDown,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useChangeDocumentStatus } from '../hooks/use-documents'
import type { DocumentStatus } from '@/types/documents'

const TRANSITIONS: Record<
  DocumentStatus,
  { to: DocumentStatus; label: string; icon: React.ElementType; variant: 'default' | 'outline' | 'destructive' }[]
> = {
  borrador: [
    { to: 'revision', label: 'Enviar a revisión', icon: Send, variant: 'default' },
  ],
  revision: [
    { to: 'aprobado', label: 'Aprobar', icon: CheckCircle2, variant: 'default' },
    { to: 'borrador', label: 'Rechazar', icon: XCircle, variant: 'outline' },
  ],
  aprobado: [
    { to: 'obsoleto', label: 'Archivar', icon: Archive, variant: 'outline' },
  ],
  obsoleto: [],
}

interface WorkflowActionsProps {
  documentId: string
  currentStatus: DocumentStatus
  canChangeStatus: boolean
}

export function WorkflowActions({ documentId, currentStatus, canChangeStatus }: WorkflowActionsProps) {
  const { mutateAsync, isPending } = useChangeDocumentStatus(documentId)
  const [comment, setComment] = useState('')
  const [showCommentFor, setShowCommentFor] = useState<DocumentStatus | null>(null)

  const transitions = TRANSITIONS[currentStatus] ?? []

  if (!canChangeStatus || transitions.length === 0) return null

  const handleTransition = async (to: DocumentStatus) => {
    await mutateAsync({ status: to, comment: comment || undefined })
    setComment('')
    setShowCommentFor(null)
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {transitions.map((t) => {
          const Icon = t.icon
          return (
            <Button
              key={t.to}
              variant={t.variant}
              size="sm"
              className="gap-2"
              disabled={isPending}
              onClick={() => {
                if (t.to === 'revision' || t.to === 'aprobado') {
                  handleTransition(t.to)
                } else {
                  setShowCommentFor(showCommentFor === t.to ? null : t.to)
                }
              }}
            >
              {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Icon className="h-3.5 w-3.5" />}
              {t.label}
              {(t.to === 'borrador' || t.to === 'obsoleto') && (
                <ChevronDown className="h-3 w-3" />
              )}
            </Button>
          )
        })}
      </div>

      {showCommentFor && (
        <div className="mt-2 space-y-2 rounded-lg border border-[hsl(var(--border))] p-3">
          <textarea
            rows={2}
            placeholder="Comentario opcional..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full rounded-md border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm placeholder:text-[hsl(var(--muted-foreground))] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[hsl(var(--ring))] resize-none"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowCommentFor(null)}
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              disabled={isPending}
              onClick={() => handleTransition(showCommentFor)}
            >
              {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Confirmar
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
