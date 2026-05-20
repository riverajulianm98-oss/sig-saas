'use client'

import { useState } from 'react'
import { Sparkles, CheckCircle, XCircle, ArrowRight, Loader2, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { SeverityBadge, ClassificationBadge } from './audit-status-badge'
import {
  useAuditSuggestions,
  useGenerateSuggestions,
  useApproveSuggestion,
  useDiscardSuggestion,
  useConvertSuggestion,
} from '../hooks/use-audits'
import type { AuditSuggestionResponse } from '@/types/audits'

const SENSITIVITY_OPTIONS = [
  { value: 'baja' as const,  label: 'Conservadora' },
  { value: 'media' as const, label: 'Balanceada' },
  { value: 'alta' as const,  label: 'Agresiva' },
]

const SUGGESTION_STATUS_LABELS: Record<string, { label: string; classes: string }> = {
  sugerido:              { label: 'Sugerido',         classes: 'bg-blue-500/10 text-blue-700 border-blue-500/20' },
  pendiente_validacion:  { label: 'En validación',    classes: 'bg-amber-500/10 text-amber-700 border-amber-500/20' },
  aprobado:              { label: 'Aprobado',          classes: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' },
  descartado:            { label: 'Descartado',        classes: 'bg-[hsl(var(--muted-foreground))]/10 text-[hsl(var(--muted-foreground))] border-[hsl(var(--border))]' },
  convertido_accion:     { label: 'Convertido',        classes: 'bg-purple-500/10 text-purple-700 border-purple-500/20' },
}

interface SuggestionCardProps {
  suggestion: AuditSuggestionResponse
  auditId: string
  canReview: boolean
}

function SuggestionCard({ suggestion, auditId, canReview }: SuggestionCardProps) {
  const [discardReason, setDiscardReason] = useState('')
  const [showDiscard, setShowDiscard] = useState(false)
  const { mutateAsync: approve, isPending: approvePending } = useApproveSuggestion()
  const { mutateAsync: discard, isPending: discardPending } = useDiscardSuggestion()
  const { mutateAsync: convert, isPending: convertPending } = useConvertSuggestion()

  const status = SUGGESTION_STATUS_LABELS[suggestion.status]
  const confidence = Math.round(suggestion.confidence_score * 100)
  const isActionable = suggestion.status === 'sugerido' || suggestion.status === 'pendiente_validacion'

  return (
    <div className={`rounded-xl border p-4 space-y-3 transition-all ${
      suggestion.status === 'descartado' ? 'opacity-50' : ''
    } ${suggestion.severity === 'critica' ? 'border-l-4 border-l-red-500' : 'border-[hsl(var(--border))]'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Sparkles className="h-3.5 w-3.5 text-[hsl(var(--primary))]" />
          <SeverityBadge severity={suggestion.severity} />
          <ClassificationBadge classification={suggestion.classification} />
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Confidence score */}
          <div className="flex items-center gap-1">
            <div className="h-1.5 w-16 rounded-full bg-[hsl(var(--muted))]">
              <div
                className={`h-1.5 rounded-full ${confidence >= 80 ? 'bg-emerald-500' : confidence >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                style={{ width: `${confidence}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-[hsl(var(--muted-foreground))]">{confidence}%</span>
          </div>
          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${status.classes}`}>
            {status.label}
          </span>
        </div>
      </div>

      <div>
        <p className="text-sm font-medium">{suggestion.title}</p>
        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 line-clamp-2">{suggestion.description}</p>
      </div>

      {suggestion.potential_impact && (
        <div className="rounded-lg bg-amber-500/5 border border-amber-500/10 px-3 py-2">
          <p className="text-xs"><span className="font-medium text-amber-700">Impacto potencial: </span>{suggestion.potential_impact}</p>
        </div>
      )}

      {suggestion.initial_recommendation && (
        <div className="rounded-lg bg-blue-500/5 border border-blue-500/10 px-3 py-2">
          <p className="text-xs"><span className="font-medium text-blue-700">Recomendación: </span>{suggestion.initial_recommendation}</p>
        </div>
      )}

      {canReview && isActionable && (
        <div className="flex items-center gap-2 pt-1 border-t border-[hsl(var(--border))]">
          <Button
            size="sm"
            className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
            disabled={approvePending}
            onClick={() => approve({ auditId, suggestionId: suggestion.id, data: {} })}
          >
            {approvePending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
            Aprobar
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            disabled={convertPending}
            onClick={() => convert({ auditId, suggestionId: suggestion.id, data: {} })}
          >
            {convertPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ArrowRight className="h-3.5 w-3.5" />}
            Convertir en hallazgo
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 text-[hsl(var(--muted-foreground))] hover:text-red-600"
            onClick={() => setShowDiscard((s) => !s)}
          >
            <XCircle className="h-3.5 w-3.5" />
            Descartar
          </Button>
        </div>
      )}

      {showDiscard && (
        <div className="space-y-2">
          <textarea
            rows={2}
            value={discardReason}
            onChange={(e) => setDiscardReason(e.target.value)}
            placeholder="Razón para descartar..."
            className="flex w-full rounded-md border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-xs placeholder:text-[hsl(var(--muted-foreground))] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[hsl(var(--ring))] resize-none"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="destructive"
              disabled={discardPending || !discardReason.trim()}
              onClick={() => discard({ auditId, suggestionId: suggestion.id, data: { reason: discardReason } })}
            >
              {discardPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Confirmar descarte
            </Button>
            <Button size="sm" variant="outline" onClick={() => { setShowDiscard(false); setDiscardReason('') }}>
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

interface SuggestionsPanelProps {
  auditId: string
  canGenerate: boolean
  canReview: boolean
}

export function SuggestionsPanel({ auditId, canGenerate, canReview }: SuggestionsPanelProps) {
  const { data: suggestions, isLoading } = useAuditSuggestions(auditId)
  const { mutateAsync: generate, isPending: generating } = useGenerateSuggestions()
  const [sensitivity, setSensitivity] = useState<'baja' | 'media' | 'alta'>('media')
  const [generateError, setGenerateError] = useState<string | null>(null)

  const handleGenerate = async () => {
    setGenerateError(null)
    try {
      await generate({ auditId, data: { sensitivity } })
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setGenerateError(typeof detail === 'string' ? detail : 'Error al generar sugerencias')
    }
  }

  const pending = suggestions?.filter((s) => s.status === 'sugerido' || s.status === 'pendiente_validacion') ?? []
  const rest = suggestions?.filter((s) => s.status !== 'sugerido' && s.status !== 'pendiente_validacion') ?? []

  if (isLoading) {
    return <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}</div>
  }

  return (
    <div className="space-y-4">
      {canGenerate && (
        <div className="rounded-xl border border-[hsl(var(--border))] p-4 bg-[hsl(var(--primary))]/5 space-y-3">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-[hsl(var(--primary))]" />
            <span className="text-sm font-medium">Generación inteligente de hallazgos</span>
          </div>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            Analiza las respuestas del checklist y genera sugerencias de hallazgos automáticamente.
          </p>
          {generateError && (
            <div className="rounded-md bg-[hsl(var(--destructive))]/10 p-2 text-xs text-[hsl(var(--destructive))]">{generateError}</div>
          )}
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              {SENSITIVITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSensitivity(opt.value)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                    sensitivity === opt.value
                      ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]'
                      : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]/40'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <Button size="sm" onClick={handleGenerate} disabled={generating} className="gap-1.5 ml-auto">
              {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              {generating ? 'Generando...' : 'Generar sugerencias'}
            </Button>
          </div>
        </div>
      )}

      {!suggestions?.length ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[hsl(var(--border))] py-12 text-center">
          <Sparkles className="h-8 w-8 text-[hsl(var(--muted-foreground))]" />
          <p className="mt-3 text-sm font-medium">Sin sugerencias de IA</p>
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
            Completa el checklist y genera sugerencias automáticas
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pending.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                Pendientes de revisión ({pending.length})
              </h4>
              {pending.map((s) => (
                <SuggestionCard key={s.id} suggestion={s} auditId={auditId} canReview={canReview} />
              ))}
            </div>
          )}
          {rest.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                Historial ({rest.length})
              </h4>
              {rest.map((s) => (
                <SuggestionCard key={s.id} suggestion={s} auditId={auditId} canReview={canReview} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
