'use client'

import { useRouter } from 'next/navigation'
import { AlertTriangle, ArrowUpDown, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { SeverityBadge, ClassificationBadge, FindingStatusBadge, SOURCE_CONFIG } from './finding-severity-badge'
import { formatDate } from '@/lib/utils'
import type { FindingResponse } from '@/types/findings'
import type { FindingSearchParams } from '@/types/findings'

interface FindingsTableProps {
  findings: FindingResponse[]
  total: number
  params: FindingSearchParams
  onParamsChange: (p: FindingSearchParams) => void
  isLoading: boolean
}

function isOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false
  return new Date(dueDate) < new Date()
}

export function FindingsTable({ findings, total, params, onParamsChange, isLoading }: FindingsTableProps) {
  const router = useRouter()
  const skip = params.skip ?? 0
  const limit = params.limit ?? 20
  const page = Math.floor(skip / limit) + 1
  const totalPages = Math.ceil(total / limit)

  const goToPage = (p: number) =>
    onParamsChange({ ...params, skip: (p - 1) * limit })

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  if (!findings.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[hsl(var(--border))] py-16 text-center">
        <AlertTriangle className="h-10 w-10 text-[hsl(var(--muted-foreground))]" />
        <p className="mt-3 text-sm font-medium">Sin hallazgos</p>
        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
          Ajusta los filtros o registra un nuevo hallazgo
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-xl border border-[hsl(var(--border))]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30">
              <th className="px-4 py-3 text-left text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Código</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Título</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Clasificación</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Severidad</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Estado</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Área</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Origen</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Responsable</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">
                <div className="flex items-center gap-1">Vencimiento <ArrowUpDown className="h-3 w-3" /></div>
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">CAPA</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[hsl(var(--border))]">
            {findings.map((f) => {
              const overdue = isOverdue(f.due_date) && f.status !== 'cerrado'
              return (
                <tr
                  key={f.id}
                  onClick={() => router.push(`/findings/${f.id}`)}
                  className={`group cursor-pointer transition-colors hover:bg-[hsl(var(--accent))]/50 ${
                    f.severity === 'critica' ? 'border-l-4 border-l-red-500' :
                    f.severity === 'alta' ? 'border-l-4 border-l-orange-500' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-[hsl(var(--muted-foreground))]">
                      {f.code ?? '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 max-w-[280px]">
                    <div className="flex items-start gap-1.5">
                      {f.is_recurrent && (
                        <span title="Reincidente" className="mt-0.5 flex-shrink-0 h-2 w-2 rounded-full bg-orange-500" />
                      )}
                      <span className="line-clamp-2 text-sm font-medium group-hover:text-[hsl(var(--primary))]">
                        {f.title}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <ClassificationBadge classification={f.classification} />
                  </td>
                  <td className="px-4 py-3">
                    <SeverityBadge severity={f.severity} />
                  </td>
                  <td className="px-4 py-3">
                    <FindingStatusBadge status={f.status} />
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-[hsl(var(--muted-foreground))]">
                      {f.process_area ?? '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-[hsl(var(--muted-foreground))]">
                      {SOURCE_CONFIG[f.source]?.label ?? f.source}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-[hsl(var(--muted-foreground))]">
                      {f.responsible_name ?? '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {f.due_date ? (
                      <span className={`text-xs font-medium ${overdue ? 'text-red-600 dark:text-red-400' : 'text-[hsl(var(--muted-foreground))]'}`}>
                        {overdue && '⚠ '}{formatDate(f.due_date)}
                      </span>
                    ) : (
                      <span className="text-xs text-[hsl(var(--muted-foreground))]">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {f.actions_count > 0 ? (
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                        f.open_actions_count > 0
                          ? 'bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]'
                          : 'bg-green-500/10 text-green-700 dark:text-green-400'
                      }`}>
                        {f.open_actions_count > 0 ? f.open_actions_count : '✓'}
                      </span>
                    ) : (
                      <span className="text-xs text-[hsl(var(--muted-foreground))]">—</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-[hsl(var(--muted-foreground))]">
          <span>{skip + 1}–{Math.min(skip + limit, total)} de {total} hallazgos</span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <span className="px-2">Pág. {page} / {totalPages}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
