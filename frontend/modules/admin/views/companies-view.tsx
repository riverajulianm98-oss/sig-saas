'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus, Search, Building2, Users, FileText, ClipboardCheck,
  Power, Trash2, Edit, LogIn, MoreHorizontal, AlertTriangle, Clock,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Company, CompanyStatus, PlanType } from '../types'
import {
  useCompanies, useCreateCompany, useUpdateCompany,
  useSetCompanyStatus, useDeleteCompany,
} from '../hooks/use-admin'
import { useAdminStore } from '@/store/admin.store'
import { CompanyForm } from '../components/company-form'

const STATUS_STYLES: Record<CompanyStatus, { label: string; cls: string }> = {
  active: { label: 'Activo', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' },
  trial: { label: 'Trial', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' },
  inactive: { label: 'Inactivo', cls: 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]' },
  suspended: { label: 'Suspendido', cls: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' },
}

const PLAN_STYLES: Record<PlanType, string> = {
  starter: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  professional: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  enterprise: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
}

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const h = Math.floor(diff / 3600000)
  if (h < 1) return 'hace < 1h'
  if (h < 24) return `hace ${h}h`
  return `hace ${Math.floor(h / 24)}d`
}

function daysLeft(iso: string) {
  const diff = new Date(iso).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / 86400000))
}

interface ActionsMenuProps {
  company: Company
  onEdit: () => void
  onEnter: () => void
  onStatus: (s: CompanyStatus) => void
  onDelete: () => void
}

function ActionsMenu({ company, onEdit, onEnter, onStatus, onDelete }: ActionsMenuProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[hsl(var(--accent))] transition-colors"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-1 w-44 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] py-1 shadow-xl">
            <button onClick={() => { setOpen(false); onEnter() }} className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-[hsl(var(--accent))] transition-colors">
              <LogIn className="h-3.5 w-3.5 text-[hsl(var(--primary))]" /> Entrar como empresa
            </button>
            <button onClick={() => { setOpen(false); onEdit() }} className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-[hsl(var(--accent))] transition-colors">
              <Edit className="h-3.5 w-3.5" /> Editar
            </button>
            <div className="my-1 border-t border-[hsl(var(--border))]" />
            {company.status !== 'active' && (
              <button onClick={() => { setOpen(false); onStatus('active') }} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950 transition-colors">
                <Power className="h-3.5 w-3.5" /> Activar
              </button>
            )}
            {company.status !== 'suspended' && (
              <button onClick={() => { setOpen(false); onStatus('suspended') }} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950 transition-colors">
                <AlertTriangle className="h-3.5 w-3.5" /> Suspender
              </button>
            )}
            {company.status !== 'inactive' && (
              <button onClick={() => { setOpen(false); onStatus('inactive') }} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] transition-colors">
                <Power className="h-3.5 w-3.5" /> Desactivar
              </button>
            )}
            <div className="my-1 border-t border-[hsl(var(--border))]" />
            <button onClick={() => { setOpen(false); onDelete() }} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-colors">
              <Trash2 className="h-3.5 w-3.5" /> Eliminar
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export function CompaniesView() {
  const router = useRouter()
  const { data: companies = [], isLoading } = useCompanies()
  const createCompany = useCreateCompany()
  const updateCompany = useUpdateCompany()
  const setStatus = useSetCompanyStatus()
  const deleteCompany = useDeleteCompany()
  const { enterAs } = useAdminStore()

  const [search, setSearch] = useState('')
  const [filterPlan, setFilterPlan] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState<Company | null>(null)

  const filtered = companies.filter((c) => {
    const q = search.toLowerCase()
    const matchSearch = !q || c.name.toLowerCase().includes(q) || c.adminEmail.toLowerCase().includes(q) || c.industry.toLowerCase().includes(q)
    const matchPlan = filterPlan === 'all' || c.plan === filterPlan
    const matchStatus = filterStatus === 'all' || c.status === filterStatus
    return matchSearch && matchPlan && matchStatus
  })

  function handleEnter(company: Company) {
    enterAs(company)
    router.push('/dashboard')
  }

  function handleDelete(id: string) {
    if (window.confirm('¿Eliminar esta empresa? Esta accion no se puede deshacer.')) {
      deleteCompany.mutate(id)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[hsl(var(--border))] px-6 py-4">
        <div>
          <h1 className="text-xl font-bold">Empresas</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">{companies.length} empresas registradas</p>
        </div>
        <button
          onClick={() => { setEditTarget(null); setShowForm(true) }}
          className="flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-[hsl(var(--primary-foreground))] hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" /> Nueva empresa
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] px-6 py-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-2.5 top-2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar empresa, email, industria..."
            className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] py-1.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
          />
        </div>
        <select value={filterPlan} onChange={(e) => setFilterPlan(e.target.value)} className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-1.5 text-sm focus:outline-none">
          <option value="all">Todos los planes</option>
          <option value="starter">Starter</option>
          <option value="professional">Professional</option>
          <option value="enterprise">Enterprise</option>
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-1.5 text-sm focus:outline-none">
          <option value="all">Todos los estados</option>
          <option value="active">Activos</option>
          <option value="trial">Trial</option>
          <option value="inactive">Inactivos</option>
          <option value="suspended">Suspendidos</option>
        </select>
        <span className="ml-auto text-xs text-[hsl(var(--muted-foreground))]">{filtered.length} resultado(s)</span>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[hsl(var(--border))] border-t-[hsl(var(--primary))]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center gap-2">
            <Building2 className="h-8 w-8 text-[hsl(var(--muted-foreground))]" />
            <p className="text-sm text-[hsl(var(--muted-foreground))]">Sin resultados</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="sticky top-0 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[hsl(var(--muted-foreground))]">Empresa</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[hsl(var(--muted-foreground))]">Plan / Estado</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[hsl(var(--muted-foreground))]">Uso</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[hsl(var(--muted-foreground))]">Ultimo acceso</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[hsl(var(--muted-foreground))]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border))]">
              {filtered.map((co) => (
                <tr key={co.id} className="hover:bg-[hsl(var(--accent))]/40 transition-colors">
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] font-bold text-sm">
                        {co.name[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{co.name}</p>
                        <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">{co.adminEmail}</p>
                        {co.industry && <p className="text-[10px] text-[hsl(var(--muted-foreground))]">{co.industry}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex flex-col gap-1">
                      <span className={cn('w-fit rounded-full px-2 py-0.5 text-xs font-semibold capitalize', PLAN_STYLES[co.plan])}>
                        {co.plan}
                      </span>
                      <span className={cn('w-fit rounded-full px-2 py-0.5 text-xs font-semibold', STATUS_STYLES[co.status].cls)}>
                        {STATUS_STYLES[co.status].label}
                      </span>
                      {co.status === 'trial' && co.trialEndsAt && (
                        <span className="flex items-center gap-1 text-[10px] text-amber-600">
                          <Clock className="h-2.5 w-2.5" /> {daysLeft(co.trialEndsAt)}d restantes
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex flex-col gap-0.5 text-xs text-[hsl(var(--muted-foreground))]">
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {co.userCount} usuarios</span>
                      <span className="flex items-center gap-1"><FileText className="h-3 w-3" /> {co.documentCount} docs</span>
                      <span className="flex items-center gap-1"><ClipboardCheck className="h-3 w-3" /> {co.auditCount} auditorias</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-[hsl(var(--muted-foreground))]">
                    {formatRelative(co.lastActiveAt)}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEnter(co)}
                        title="Entrar como empresa"
                        className="flex items-center gap-1.5 rounded-lg border border-[hsl(var(--primary))]/40 px-2.5 py-1 text-xs font-medium text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/8 transition-colors"
                      >
                        <LogIn className="h-3 w-3" /> Entrar
                      </button>
                      <ActionsMenu
                        company={co}
                        onEdit={() => { setEditTarget(co); setShowForm(true) }}
                        onEnter={() => handleEnter(co)}
                        onStatus={(s) => setStatus.mutate({ id: co.id, status: s })}
                        onDelete={() => handleDelete(co.id)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Company form modal */}
      <CompanyForm
        open={showForm}
        onClose={() => { setShowForm(false); setEditTarget(null) }}
        initial={editTarget ?? undefined}
        submitting={createCompany.isPending || updateCompany.isPending}
        onSubmit={(data) => {
          if (editTarget) {
            updateCompany.mutate({ id: editTarget.id, data }, { onSuccess: () => { setShowForm(false); setEditTarget(null) } })
          } else {
            createCompany.mutate(data, { onSuccess: () => setShowForm(false) })
          }
        }}
      />
    </div>
  )
}
