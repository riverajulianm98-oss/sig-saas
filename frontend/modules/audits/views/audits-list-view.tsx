'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Plus, RefreshCw, LayoutDashboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { AuditsTable } from '../components/audits-table'
import { AuditFilters } from '../components/audit-filters'
import { CreateAuditModal } from '../components/create-audit-modal'
import { AuditDashboardWidgets } from '../components/audit-dashboard'
import { useAudits, useDeleteAudit } from '../hooks/use-audits'
import { useAuth } from '@/hooks/use-auth'
import { ROLE_LEVEL } from '@/lib/constants'
import type { AuditFiltersState } from '../components/audit-filters'

const PAGE_SIZE = 20

export function AuditsListView() {
  const router = useRouter()
  const { user } = useAuth()
  const canAdmin = user ? ROLE_LEVEL[user.role] >= ROLE_LEVEL['coordinador_sig'] : false
  const canCreate = canAdmin || (user ? ROLE_LEVEL[user.role] >= ROLE_LEVEL['auditor'] : false)

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [filters, setFilters] = useState<AuditFiltersState>({})
  const [page, setPage] = useState(0)
  const [showCreate, setShowCreate] = useState(false)
  const [showDashboard, setShowDashboard] = useState(false)

  const { data, isLoading, refetch, isFetching } = useAudits({
    skip: page * PAGE_SIZE,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
    status: filters.status,
    type: filters.type,
    process_area: filters.process_area || undefined,
  })

  const { mutateAsync: deleteAudit } = useDeleteAudit()

  const handleSearch = useCallback((val: string) => {
    setSearch(val)
    clearTimeout((handleSearch as { _timer?: ReturnType<typeof setTimeout> })._timer)
    ;(handleSearch as { _timer?: ReturnType<typeof setTimeout> })._timer = setTimeout(() => {
      setDebouncedSearch(val)
      setPage(0)
    }, 350)
  }, [])

  const handleFiltersChange = (f: AuditFiltersState) => {
    setFilters(f)
    setPage(0)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta auditoría? Esta acción no se puede deshacer.')) return
    await deleteAudit(id)
  }

  const handleSuccess = (auditId: string) => {
    router.push(`/audits/${auditId}`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Auditorías</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">
            Gestión de auditorías ISO · {data?.total ?? 0} registros
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDashboard((s) => !s)}
            className="gap-1.5"
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            {showDashboard ? 'Ocultar dashboard' : 'Dashboard'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
          {canCreate && (
            <Button size="sm" onClick={() => setShowCreate(true)} className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Nueva auditoría
            </Button>
          )}
        </div>
      </div>

      {/* Dashboard widgets */}
      {showDashboard && (
        <div className="animate-in fade-in-0 slide-in-from-top-2 duration-200">
          <AuditDashboardWidgets />
        </div>
      )}

      {/* Search + Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
          <Input
            placeholder="Buscar por código, título, proceso..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <AuditFilters
          value={filters}
          onChange={handleFiltersChange}
          onReset={() => { setFilters({}); setPage(0) }}
        />
      </div>

      {/* Table */}
      {isLoading && !data ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <AuditsTable
          items={data?.items ?? []}
          total={data?.total ?? 0}
          page={page}
          pageSize={PAGE_SIZE}
          isLoading={isFetching && !data}
          onPageChange={setPage}
          onDelete={handleDelete}
          canAdmin={canAdmin}
        />
      )}

      {showCreate && (
        <CreateAuditModal
          onClose={() => setShowCreate(false)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  )
}
