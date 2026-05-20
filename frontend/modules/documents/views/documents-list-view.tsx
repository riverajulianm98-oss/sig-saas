'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, RefreshCw, LayoutGrid, LayoutList } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useDocuments } from '../hooks/use-documents'
import { DocumentsTable } from '../components/documents-table'
import { DocumentFilters } from '../components/document-filters'
import { CreateDocumentModal } from '../components/create-document-modal'
import { useAuth } from '@/hooks/use-auth'
import { ROLE_LEVEL } from '@/lib/constants'
import type { DocumentSearchParams } from '@/types/documents'

const DEFAULT_PARAMS: DocumentSearchParams = { skip: 0, limit: 20 }

function countActiveFilters(params: DocumentSearchParams) {
  return [params.status, params.type, params.process_area, params.tags,
    params.expires_from, params.expires_to].filter(Boolean).length
}

export function DocumentsListView() {
  const router = useRouter()
  const { user } = useAuth()
  const canEdit = user ? ROLE_LEVEL[user.role] >= ROLE_LEVEL['lider_proceso'] : false

  const [params, setParams] = useState<DocumentSearchParams>(DEFAULT_PARAMS)
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)

  const queryParams: DocumentSearchParams = {
    ...params,
    search: search || undefined,
  }

  const { data, isLoading, isFetching, refetch } = useDocuments(queryParams)

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(e.target.value)
      setParams((p) => ({ ...p, skip: 0 }))
    },
    []
  )

  const resetFilters = () => {
    setParams(DEFAULT_PARAMS)
    setSearch('')
  }

  const activeFilters = countActiveFilters(params)

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Documentos</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">
            {data?.total ?? '—'} documentos · Control documental ISO
          </p>
        </div>
        {canEdit && (
          <Button onClick={() => setShowCreate(true)} className="gap-2 shrink-0">
            <Plus className="h-4 w-4" />
            Nuevo documento
          </Button>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Input
            placeholder="Buscar por código, título..."
            value={search}
            onChange={handleSearch}
            className="h-9 pr-8"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] text-xs"
            >
              ✕
            </button>
          )}
        </div>

        <DocumentFilters
          filters={params}
          onChange={setParams}
          onReset={resetFilters}
          activeCount={activeFilters}
        />

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Table */}
      <DocumentsTable
        documents={data?.items ?? []}
        total={data?.total ?? 0}
        params={params}
        onParamsChange={setParams}
        isLoading={isLoading}
        canEdit={canEdit}
        onEdit={(doc) => router.push(`/documents/${doc.id}?edit=true`)}
        onDelete={(doc) => {
          if (confirm(`¿Eliminar "${doc.title}"?`)) {
            // delete handled in detail page for now
          }
        }}
      />

      {/* Create modal */}
      {showCreate && (
        <CreateDocumentModal
          onClose={() => setShowCreate(false)}
          onSuccess={(id) => router.push(`/documents/${id}`)}
        />
      )}
    </div>
  )
}
