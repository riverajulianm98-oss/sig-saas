'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  TrendingUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { AuditStatusBadge, AuditTypeBadge, IsoStandardBadge } from './audit-status-badge'
import { formatDate, formatRelativeTime } from '@/lib/utils'
import type { AuditResponse } from '@/types/audits'

interface AuditsTableProps {
  items: AuditResponse[]
  total: number
  page: number
  pageSize: number
  isLoading: boolean
  onPageChange: (page: number) => void
  onDelete?: (id: string) => void
  canAdmin?: boolean
}

export function AuditsTable({
  items,
  total,
  page,
  pageSize,
  isLoading,
  onPageChange,
  onDelete,
  canAdmin,
}: AuditsTableProps) {
  const router = useRouter()
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const totalPages = Math.ceil(total / pageSize)

  const toggleSelect = (id: string) => {
    const next = new Set(selected)
    next.has(id) ? next.delete(id) : next.add(id)
    setSelected(next)
  }

  const toggleAll = () => {
    setSelected(selected.size === items.length ? new Set() : new Set(items.map((i) => i.id)))
  }

  const scoreColor = (score: number | null) => {
    if (score === null) return 'text-[hsl(var(--muted-foreground))]'
    if (score >= 80) return 'text-emerald-600'
    if (score >= 60) return 'text-amber-600'
    return 'text-red-600'
  }

  if (isLoading) {
    return (
      <div className="rounded-xl border border-[hsl(var(--border))] overflow-hidden">
        <div className="divide-y divide-[hsl(var(--border))]">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3.5">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!items.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[hsl(var(--border))] py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--muted))]">
          <ClipboardCheck className="h-6 w-6 text-[hsl(var(--muted-foreground))]" />
        </div>
        <p className="mt-3 text-sm font-medium">Sin auditorías</p>
        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
          No hay auditorías que coincidan con los filtros
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-[hsl(var(--border))] overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-[2rem_6rem_1fr_7rem_6rem_5rem_7rem_2rem] items-center gap-3 border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 px-4 py-2.5">
        <input
          type="checkbox"
          checked={selected.size === items.length && items.length > 0}
          onChange={toggleAll}
          className="h-3.5 w-3.5 rounded accent-[hsl(var(--primary))]"
        />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Código</span>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Auditoría</span>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Estado</span>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Tipo</span>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Score</span>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Inicio planeado</span>
        <span />
      </div>

      {/* Rows */}
      <div className="divide-y divide-[hsl(var(--border))]">
        {items.map((audit) => (
          <div
            key={audit.id}
            className={`grid grid-cols-[2rem_6rem_1fr_7rem_6rem_5rem_7rem_2rem] items-center gap-3 px-4 py-3.5 transition-colors hover:bg-[hsl(var(--accent))]/40 ${
              selected.has(audit.id) ? 'bg-[hsl(var(--primary))]/5' : ''
            }`}
          >
            <input
              type="checkbox"
              checked={selected.has(audit.id)}
              onChange={() => toggleSelect(audit.id)}
              className="h-3.5 w-3.5 rounded accent-[hsl(var(--primary))]"
            />

            <button
              onClick={() => router.push(`/audits/${audit.id}`)}
              className="text-left text-xs font-mono font-medium text-[hsl(var(--primary))] hover:underline truncate"
            >
              {audit.code}
            </button>

            <div
              className="cursor-pointer min-w-0"
              onClick={() => router.push(`/audits/${audit.id}`)}
            >
              <p className="truncate text-sm font-medium leading-tight">{audit.title}</p>
              <div className="mt-0.5 flex items-center gap-2 flex-wrap">
                {audit.process_area && (
                  <span className="text-xs text-[hsl(var(--muted-foreground))] truncate max-w-[12rem]">
                    {audit.process_area}
                  </span>
                )}
                {audit.iso_standards?.map((s) => (
                  <IsoStandardBadge key={s} standard={s} />
                ))}
              </div>
            </div>

            <AuditStatusBadge status={audit.status} />
            <AuditTypeBadge type={audit.audit_type} />

            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-[hsl(var(--muted-foreground))]" />
              <span className={`text-sm font-semibold tabular-nums ${scoreColor(audit.compliance_score)}`}>
                {audit.compliance_score !== null ? `${audit.compliance_score}%` : '—'}
              </span>
            </div>

            <span className="text-xs text-[hsl(var(--muted-foreground))]">
              {audit.planned_start_date ? formatDate(audit.planned_start_date) : '—'}
            </span>

            {/* Actions menu */}
            <div className="relative">
              <button
                onClick={() => setOpenMenu(openMenu === audit.id ? null : audit.id)}
                className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-[hsl(var(--accent))] text-[hsl(var(--muted-foreground))]"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
              {openMenu === audit.id && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setOpenMenu(null)} />
                  <div className="absolute right-0 top-8 z-30 w-40 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-lg py-1">
                    <button
                      onClick={() => { router.push(`/audits/${audit.id}`); setOpenMenu(null) }}
                      className="flex w-full items-center gap-2 px-3 py-1.5 text-xs hover:bg-[hsl(var(--accent))]"
                    >
                      <Eye className="h-3.5 w-3.5" /> Ver detalle
                    </button>
                    {canAdmin && (
                      <>
                        <button
                          onClick={() => { router.push(`/audits/${audit.id}`); setOpenMenu(null) }}
                          className="flex w-full items-center gap-2 px-3 py-1.5 text-xs hover:bg-[hsl(var(--accent))]"
                        >
                          <Pencil className="h-3.5 w-3.5" /> Editar
                        </button>
                        <div className="my-1 border-t border-[hsl(var(--border))]" />
                        <button
                          onClick={() => { onDelete?.(audit.id); setOpenMenu(null) }}
                          className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Eliminar
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-[hsl(var(--border))] px-4 py-3">
          <span className="text-xs text-[hsl(var(--muted-foreground))]">
            {total} auditorías · Página {page + 1} de {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 0}
              className="h-7 w-7 p-0"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages - 1}
              className="h-7 w-7 p-0"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
