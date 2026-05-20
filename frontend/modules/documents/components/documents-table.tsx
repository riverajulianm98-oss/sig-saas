'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  FileText,
  ExternalLink,
  MoreHorizontal,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import { formatDate, formatRelativeTime, cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { StatusBadge, TypeBadge } from './status-badge'
import type { Document, DocumentSearchParams } from '@/types/documents'

interface DocumentsTableProps {
  documents: Document[]
  total: number
  params: DocumentSearchParams
  onParamsChange: (p: DocumentSearchParams) => void
  isLoading?: boolean
  onEdit?: (doc: Document) => void
  onDelete?: (doc: Document) => void
  canEdit?: boolean
}

const PAGE_SIZE = 20

export function DocumentsTable({
  documents,
  total,
  params,
  onParamsChange,
  isLoading,
  onEdit,
  onDelete,
  canEdit = false,
}: DocumentsTableProps) {
  const router = useRouter()
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const page = Math.floor((params.skip ?? 0) / PAGE_SIZE) + 1
  const totalPages = Math.ceil(total / PAGE_SIZE)

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (selected.size === documents.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(documents.map((d) => d.id)))
    }
  }

  const goToPage = (p: number) => {
    onParamsChange({ ...params, skip: (p - 1) * PAGE_SIZE })
    setSelected(new Set())
  }

  const expiryInfo = (doc: Document) => {
    if (!doc.expires_at) return null
    const now = new Date()
    const exp = new Date(doc.expires_at)
    const diffDays = Math.floor((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays < 0) return { icon: AlertTriangle, color: 'text-red-500', label: 'Vencido' }
    if (diffDays <= 30) return { icon: Clock, color: 'text-amber-500', label: `${diffDays}d` }
    return { icon: CheckCircle2, color: 'text-emerald-500', label: formatDate(doc.expires_at) }
  }

  if (isLoading) {
    return (
      <div className="space-y-1">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 rounded-lg px-4 py-3">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-12 rounded-md" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    )
  }

  if (!isLoading && documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[hsl(var(--muted))]">
          <FileText className="h-7 w-7 text-[hsl(var(--muted-foreground))]" />
        </div>
        <p className="text-sm font-medium">Sin documentos</p>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
          No se encontraron documentos con los filtros aplicados.
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Selection bar */}
      {selected.size > 0 && (
        <div className="mb-2 flex items-center gap-3 rounded-lg border border-[hsl(var(--primary))]/30 bg-[hsl(var(--primary))]/5 px-4 py-2 text-sm">
          <span className="font-medium text-[hsl(var(--primary))]">
            {selected.size} seleccionado{selected.size > 1 ? 's' : ''}
          </span>
          <button
            className="text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            onClick={() => setSelected(new Set())}
          >
            Limpiar selección
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-[hsl(var(--border))]">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40">
              <th className="w-10 px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selected.size === documents.length && documents.length > 0}
                  onChange={toggleAll}
                  className="h-3.5 w-3.5 accent-[hsl(var(--primary))]"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                Código
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                Documento
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                Tipo
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                Estado
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                Versión
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                Vencimiento
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                Actualizado
              </th>
              <th className="w-10 px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[hsl(var(--border))]">
            {documents.map((doc) => {
              const expiry = expiryInfo(doc)
              const ExpIcon = expiry?.icon
              return (
                <tr
                  key={doc.id}
                  className={cn(
                    'group transition-colors hover:bg-[hsl(var(--accent))]/60 cursor-pointer',
                    selected.has(doc.id) && 'bg-[hsl(var(--primary))]/5'
                  )}
                  onClick={() => router.push(`/documents/${doc.id}`)}
                >
                  <td
                    className="px-4 py-3"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleSelect(doc.id)
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selected.has(doc.id)}
                      onChange={() => toggleSelect(doc.id)}
                      className="h-3.5 w-3.5 accent-[hsl(var(--primary))]"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs font-medium text-[hsl(var(--muted-foreground))]">
                      {doc.code}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--muted))]">
                        <FileText className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium max-w-[280px]">{doc.title}</p>
                        {doc.process_area && (
                          <p className="truncate text-xs text-[hsl(var(--muted-foreground))]">
                            {doc.process_area}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <TypeBadge type={doc.document_type} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={doc.status} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[hsl(var(--muted))] text-[10px] font-semibold text-[hsl(var(--muted-foreground))]">
                      v{doc.current_version_id ? '—' : '0'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {expiry ? (
                      <span className={cn('flex items-center gap-1.5 text-xs', expiry.color)}>
                        {ExpIcon && <ExpIcon className="h-3.5 w-3.5" />}
                        {expiry.label}
                      </span>
                    ) : (
                      <span className="text-xs text-[hsl(var(--muted-foreground))]">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-[hsl(var(--muted-foreground))]">
                    {formatRelativeTime(doc.updated_at)}
                  </td>
                  <td
                    className="px-4 py-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {canEdit && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 opacity-0 group-hover:opacity-100"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => router.push(`/documents/${doc.id}`)}>
                            <ExternalLink className="h-4 w-4" />
                            Ver detalle
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEdit?.(doc)}>
                            <Pencil className="h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-[hsl(var(--destructive))]"
                            onClick={() => onDelete?.(doc)}
                          >
                            <Trash2 className="h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
        <div className="mt-4 flex items-center justify-between text-sm text-[hsl(var(--muted-foreground))]">
          <span>
            {(params.skip ?? 0) + 1}–{Math.min((params.skip ?? 0) + PAGE_SIZE, total)} de {total}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              disabled={page === 1}
              onClick={() => goToPage(page - 1)}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const p = i + 1
              return (
                <Button
                  key={p}
                  variant={p === page ? 'default' : 'outline'}
                  size="icon"
                  className="h-7 w-7 text-xs"
                  onClick={() => goToPage(p)}
                >
                  {p}
                </Button>
              )
            })}
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              disabled={page === totalPages}
              onClick={() => goToPage(page + 1)}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
