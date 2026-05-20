'use client'

import { useState } from 'react'
import { ChevronRight, Loader2, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useChangeAuditStatus } from '../hooks/use-audits'
import type { AuditStatus } from '@/types/audits'

const TRANSITIONS: Record<AuditStatus, { next: AuditStatus; label: string; variant: 'default' | 'outline' | 'destructive' }[]> = {
  planeada:   [{ next: 'en_proceso', label: 'Iniciar auditoría', variant: 'default' }],
  en_proceso: [
    { next: 'finalizada', label: 'Finalizar', variant: 'default' },
    { next: 'cancelada',  label: 'Cancelar',  variant: 'destructive' },
  ],
  finalizada: [{ next: 'cerrada', label: 'Cerrar auditoría', variant: 'outline' }],
  cerrada:    [],
  cancelada:  [],
}

interface AuditWorkflowActionsProps {
  auditId: string
  status: AuditStatus
  canChange: boolean
}

export function AuditWorkflowActions({ auditId, status, canChange }: AuditWorkflowActionsProps) {
  const { mutateAsync, isPending } = useChangeAuditStatus()
  const [comment, setComment] = useState('')
  const [showComment, setShowComment] = useState(false)
  const [pendingTransition, setPendingTransition] = useState<AuditStatus | null>(null)

  const transitions = TRANSITIONS[status] ?? []

  const handleTransition = async (next: AuditStatus) => {
    if (next === 'cancelada' || next === 'cerrada') {
      setPendingTransition(next)
      setShowComment(true)
      return
    }
    await mutateAsync({ id: auditId, data: { status: next } })
  }

  const confirmTransition = async () => {
    if (!pendingTransition) return
    await mutateAsync({ id: auditId, data: { status: pendingTransition, comment: comment || undefined } })
    setShowComment(false)
    setComment('')
    setPendingTransition(null)
  }

  if (!canChange || !transitions.length) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        {transitions.map((t) => (
          <Button
            key={t.next}
            variant={t.variant}
            size="sm"
            disabled={isPending}
            onClick={() => handleTransition(t.next)}
            className="gap-1.5"
          >
            {isPending && pendingTransition !== t.next && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {t.label}
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        ))}
        <button
          type="button"
          onClick={() => setShowComment((s) => !s)}
          className="flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          Agregar comentario
        </button>
      </div>

      {showComment && (
        <div className="space-y-2">
          <textarea
            rows={2}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Comentario opcional para el cambio de estado..."
            className="flex w-full rounded-md border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm placeholder:text-[hsl(var(--muted-foreground))] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[hsl(var(--ring))] resize-none"
          />
          {pendingTransition && (
            <div className="flex gap-2">
              <Button size="sm" onClick={confirmTransition} disabled={isPending}>
                {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Confirmar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => { setShowComment(false); setPendingTransition(null); setComment('') }}
              >
                Cancelar
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
