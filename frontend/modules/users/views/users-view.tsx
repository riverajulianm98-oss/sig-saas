'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Users, Plus, Search, Shield, MoreVertical,
  UserCheck, UserX, RefreshCw, X, Eye, EyeOff,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/auth.store'
import { useUsers, useCreateUser, useUpdateUser, useDeactivateUser } from '../hooks/use-users'
import type { User } from '@/types/auth'
import type { UserDetail } from '@/services/users.service'
import { ROLE_LABELS, ROLE_LEVEL } from '@/lib/constants'

const ROLE_OPTIONS = [
  { value: 'admin_empresa', label: 'Admin Empresa' },
  { value: 'coordinador_sig', label: 'Coordinador SIG' },
  { value: 'auditor', label: 'Auditor' },
  { value: 'lider_proceso', label: 'Líder de Proceso' },
  { value: 'usuario', label: 'Usuario' },
] as const

const ROLE_COLORS: Record<string, string> = {
  admin_empresa: 'bg-violet-100 text-violet-700',
  coordinador_sig: 'bg-indigo-100 text-indigo-700',
  auditor: 'bg-blue-100 text-blue-700',
  lider_proceso: 'bg-amber-100 text-amber-700',
  usuario: 'bg-gray-100 text-gray-600',
}

// ── Create user form ──────────────────────────────────────────────────────────

const createSchema = z.object({
  full_name: z.string().min(2, 'Mínimo 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  role: z.enum(['admin_empresa', 'coordinador_sig', 'auditor', 'lider_proceso', 'usuario']),
})

type CreateForm = z.infer<typeof createSchema>

function CreateUserModal({ onClose }: { onClose: () => void }) {
  const createUser = useCreateUser()
  const [showPass, setShowPass] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
    defaultValues: { role: 'usuario' },
  })

  async function onSubmit(data: CreateForm) {
    await createUser.mutateAsync(data)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900">Invitar usuario</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-gray-100">
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">Nombre completo</label>
            <input {...register('full_name')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
            {errors.full_name && <p className="mt-1 text-xs text-red-500">{errors.full_name.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">Email corporativo</label>
            <input {...register('email')} type="email" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">Contraseña temporal</label>
            <div className="relative">
              <input {...register('password')} type={showPass ? 'text' : 'password'} className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-9 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
              <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">Rol</label>
            <select {...register('role')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white outline-none focus:border-indigo-500">
              {ROLE_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>

          {createUser.error && (
            <p className="text-xs text-red-500">
              {(createUser.error as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Error al crear usuario'}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">
              {isSubmitting && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
              Crear usuario
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── User row ──────────────────────────────────────────────────────────────────

function UserRow({ user, currentUserId }: { user: User; currentUserId: string }) {
  const [showMenu, setShowMenu] = useState(false)
  const updateUser = useUpdateUser(user.id)
  const deactivate = useDeactivateUser()
  const isSelf = user.id === currentUserId

  async function toggleActive() {
    await updateUser.mutateAsync({ is_active: !user.is_active })
    setShowMenu(false)
  }

  return (
    <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
            {user.full_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{user.full_name} {isSelf && <span className="text-xs text-gray-400">(tú)</span>}</p>
            <p className="text-xs text-gray-400">{user.email}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-3.5">
        <span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold', ROLE_COLORS[user.role] ?? 'bg-gray-100 text-gray-600')}>
          {ROLE_LABELS[user.role] ?? user.role}
        </span>
      </td>
      <td className="px-5 py-3.5">
        <span className={cn('flex items-center gap-1.5 text-xs font-medium w-fit', user.is_active ? 'text-emerald-600' : 'text-red-500')}>
          <span className={cn('h-1.5 w-1.5 rounded-full', user.is_active ? 'bg-emerald-500' : 'bg-red-400')} />
          {user.is_active ? 'Activo' : 'Inactivo'}
        </span>
      </td>
      <td className="px-5 py-3.5 text-xs text-gray-400">
        {user.last_login_at ? new Date(user.last_login_at).toLocaleDateString('es-CO') : 'Nunca'}
      </td>
      <td className="px-5 py-3.5">
        {!isSelf && (
          <div className="relative">
            <button onClick={() => setShowMenu(v => !v)} className="rounded-lg p-1.5 hover:bg-gray-100">
              <MoreVertical className="h-4 w-4 text-gray-400" />
            </button>
            {showMenu && (
              <div className="absolute right-0 z-10 mt-1 w-44 rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
                <button
                  onClick={toggleActive}
                  disabled={updateUser.isPending}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  {user.is_active ? <UserX className="h-4 w-4 text-red-500" /> : <UserCheck className="h-4 w-4 text-emerald-500" />}
                  {user.is_active ? 'Desactivar' : 'Activar'}
                </button>
              </div>
            )}
          </div>
        )}
      </td>
    </tr>
  )
}

// ── Main view ─────────────────────────────────────────────────────────────────

export default function UsersView() {
  const { user: currentUser } = useAuthStore()
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const { data, isLoading, error } = useUsers()

  const users = data?.items ?? []
  const filtered = users.filter((u) =>
    !search ||
    u.full_name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      {showCreate && <CreateUserModal onClose={() => setShowCreate(false)} />}

      {/* Header */}
      <div className="border-b border-gray-100 bg-white px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Usuarios</h1>
            <p className="text-xs text-gray-400 mt-0.5">{data?.total ?? 0} usuarios en tu workspace</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" /> Invitar usuario
          </button>
        </div>
      </div>

      <div className="flex-1 p-6 space-y-4">
        {/* Stats */}
        <div className="grid gap-3 sm:grid-cols-4">
          {[
            { label: 'Total', value: users.length, color: 'text-gray-900' },
            { label: 'Activos', value: users.filter(u => u.is_active).length, color: 'text-emerald-600' },
            { label: 'Inactivos', value: users.filter(u => !u.is_active).length, color: 'text-red-500' },
            { label: 'Admins', value: users.filter(u => u.role === 'admin_empresa' || u.role === 'coordinador_sig').length, color: 'text-indigo-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-2xl border border-gray-200 bg-white p-4 text-center">
              <p className={cn('text-2xl font-extrabold', color)}>{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o email..."
            className="w-full rounded-xl border border-gray-200 pl-9 pr-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
          {isLoading ? (
            <div className="divide-y divide-gray-100">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-4">
                  <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
                  <div className="space-y-2 flex-1">
                    <div className="h-3 w-40 rounded bg-gray-200 animate-pulse" />
                    <div className="h-2.5 w-32 rounded bg-gray-100 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-16 text-sm text-red-500">
              Error al cargar usuarios. Verifica que el backend esté activo.
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100">
                <Users className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-700">No hay usuarios</p>
              <p className="text-xs text-gray-400">{search ? 'Ningún usuario coincide con la búsqueda' : 'Invita al primer usuario de tu workspace'}</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-500">
                  <th className="px-5 py-3 text-left">Usuario</th>
                  <th className="px-5 py-3 text-left">Rol</th>
                  <th className="px-5 py-3 text-left">Estado</th>
                  <th className="px-5 py-3 text-left">Último acceso</th>
                  <th className="px-5 py-3 text-left" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <UserRow key={u.id} user={u} currentUserId={currentUser?.id ?? ''} />
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
