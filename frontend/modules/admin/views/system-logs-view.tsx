'use client'

import { useState } from 'react'
import { RefreshCw, Info, AlertTriangle, XCircle, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LogLevel } from '../types'
import { useSystemLogs, useCompanies } from '../hooks/use-admin'
import { useQueryClient } from '@tanstack/react-query'
import { ADMIN_KEYS } from '../hooks/use-admin'

const LEVEL_STYLES: Record<LogLevel, { icon: React.ElementType; cls: string; row: string }> = {
  info: { icon: Info, cls: 'text-blue-600 bg-blue-50 dark:bg-blue-950 dark:text-blue-300', row: '' },
  warning: { icon: AlertTriangle, cls: 'text-amber-600 bg-amber-50 dark:bg-amber-950 dark:text-amber-300', row: 'bg-amber-50/30 dark:bg-amber-950/10' },
  error: { icon: XCircle, cls: 'text-red-600 bg-red-50 dark:bg-red-950 dark:text-red-300', row: 'bg-red-50/40 dark:bg-red-950/10' },
}

function formatTimestamp(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString('es-CO', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
}

export function SystemLogsView() {
  const [level, setLevel] = useState<string>('')
  const [companyId, setCompanyId] = useState<string>('')
  const [search, setSearch] = useState('')
  const qc = useQueryClient()

  const { data: companies = [] } = useCompanies()
  const { data: logs = [], isLoading, dataUpdatedAt } = useSystemLogs(level || undefined, companyId || undefined)

  const filtered = logs.filter((l) => !search || l.message.toLowerCase().includes(search.toLowerCase()) || l.action.toLowerCase().includes(search.toLowerCase()))

  const errorCount = logs.filter((l) => l.level === 'error').length
  const warnCount = logs.filter((l) => l.level === 'warning').length

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[hsl(var(--border))] px-6 py-4">
        <div>
          <h1 className="text-xl font-bold">Logs del sistema</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            {logs.length} eventos · {errorCount > 0 && <span className="text-red-600 font-semibold">{errorCount} errores · </span>}
            {warnCount > 0 && <span className="text-amber-600">{warnCount} advertencias</span>}
          </p>
        </div>
        <button
          onClick={() => qc.invalidateQueries({ queryKey: ADMIN_KEYS.logs() })}
          className="flex items-center gap-2 rounded-lg border border-[hsl(var(--border))] px-3 py-1.5 text-sm hover:bg-[hsl(var(--accent))] transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Actualizar
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] px-6 py-3">
        <Filter className="h-4 w-4 shrink-0 text-[hsl(var(--muted-foreground))]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar mensaje o accion..."
          className="flex-1 min-w-40 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
        />
        <div className="flex gap-2">
          {(['', 'info', 'warning', 'error'] as const).map((l) => (
            <button
              key={l || 'all'}
              onClick={() => setLevel(l)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                level === l
                  ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                  : 'border border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))]'
              )}
            >
              {l === '' ? 'Todos' : l === 'info' ? 'Info' : l === 'warning' ? 'Advertencias' : 'Errores'}
            </button>
          ))}
        </div>
        <select
          value={companyId}
          onChange={(e) => setCompanyId(e.target.value)}
          className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-1.5 text-sm focus:outline-none"
        >
          <option value="">Todas las empresas</option>
          {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <span className="ml-auto text-[10px] text-[hsl(var(--muted-foreground))]">
          Actualizado: {new Date(dataUpdatedAt).toLocaleTimeString('es-CO')}
        </span>
      </div>

      {/* Log stream */}
      <div className="flex-1 overflow-auto font-mono text-xs">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[hsl(var(--border))] border-t-[hsl(var(--primary))]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-[hsl(var(--muted-foreground))]">
            Sin logs para este filtro
          </div>
        ) : (
          <div className="divide-y divide-[hsl(var(--border))]/50">
            {filtered.map((log) => {
              const { icon: Icon, cls, row } = LEVEL_STYLES[log.level]
              return (
                <div key={log.id} className={cn('flex items-start gap-3 px-6 py-2.5', row)}>
                  <span className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded', cls)}>
                    <Icon className="h-3 w-3" />
                  </span>
                  <span className="w-36 shrink-0 text-[hsl(var(--muted-foreground))]">
                    {formatTimestamp(log.timestamp)}
                  </span>
                  <span className="w-36 shrink-0 font-semibold truncate">{log.action}</span>
                  <span className="min-w-0 flex-1 break-words">{log.message}</span>
                  {log.companyName && (
                    <span className="shrink-0 rounded bg-[hsl(var(--muted))] px-1.5 py-0.5 text-[10px] text-[hsl(var(--muted-foreground))]">
                      {log.companyName}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
