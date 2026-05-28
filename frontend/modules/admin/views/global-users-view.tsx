'use client'

import { useState } from 'react'
import { Search, UserCheck, UserX, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAdminUsers, useCompanies, useToggleUserStatus } from '../hooks/use-admin'

const ROLE_LABELS: Record<string, string> = {
  admin_empresa: 'Admin empresa',
  coordinador_sig: 'Coordinador SIG',
  lider_proceso: 'Lider proceso',
  auditor: 'Auditor',
  usuario: 'Usuario',
  super_admin: 'Super Admin',
}

function formatDate(iso: string) {
  const d = new Date(iso)
  const diff = Date.now() - d.getTime()
  const h = Math.floor(diff / 3600000)
  if (h < 1) return 'hace < 1h'
  if (h < 24) return `hace ${h}h`
  if (h < 168) return `hace ${Math.floor(h / 24)}d`
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })
}

export function GlobalUsersView() {
  const [companyFilter, setCompanyFilter] = useState<string>('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const { data: companies = [] } = useCompanies()
  const { data: users = [], isLoading } = useAdminUsers(companyFilter || undefined)
  const toggleStatus = useToggleUserStatus()

  const filtered = users.filter((u) => {
    const q = search.toLowerCase()
    const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    const matchStatus = statusFilter === 'all' || u.status === statusFilter
    return matchSearch && matchStatus
  })

  const activeCount = users.filter((u) => u.status === 'active').length
  const inactiveCount = users.filter((u) => u.status === 'inactive').length

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[hsl(var(--border))] px-6 py-4">
        <div>
          <h1 className="text-xl font-bold">Usuarios globales</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            {users.length} usuarios · {activeCount} activos · {inactiveCount} inactivos
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] px-6 py-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-2.5 top-2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o email..."
            className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] py-1.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
          />
        </div>
        <select
          value={companyFilter}
          onChange={(e) => setCompanyFilter(e.target.value)}
          className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-1.5 text-sm focus:outline-none"
        >
          <option value="">Todas las empresas</option>
          {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-1.5 text-sm focus:outline-none"
        >
          <option value="all">Todos</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </select>
        <span className="ml-auto text-xs text-[hsl(var(--muted-foreground))]">{filtered.length} usuario(s)</span>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[hsl(var(--border))] border-t-[hsl(var(--primary))]" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="sticky top-0 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[hsl(var(--muted-foreground))]">Usuario</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[hsl(var(--muted-foreground))]">Empresa</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[hsl(var(--muted-foreground))]">Rol</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[hsl(var(--muted-foreground))]">Ultimo acceso</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[hsl(var(--muted-foreground))]">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border))]">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-[hsl(var(--accent))]/40 transition-colors">
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] text-sm font-bold">
                        {user.name[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{user.name}</p>
                        <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-[hsl(var(--muted-foreground))]">
                    {user.companyName}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="flex items-center gap-1 text-xs">
                      <Shield className="h-3 w-3 text-[hsl(var(--muted-foreground))]" />
                      {ROLE_LABELS[user.role] ?? user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-[hsl(var(--muted-foreground))]">
                    {formatDate(user.lastLoginAt)}
                  </td>
                  <td className="px-4 py-3.5">
                    <button
                      onClick={() => toggleStatus.mutate(user.id)}
                      className={cn(
                        'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors',
                        user.status === 'active'
                          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))]'
                      )}
                    >
                      {user.status === 'active'
                        ? <><UserCheck className="h-3 w-3" /> Activo</>
                        : <><UserX className="h-3 w-3" /> Inactivo</>
                      }
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
