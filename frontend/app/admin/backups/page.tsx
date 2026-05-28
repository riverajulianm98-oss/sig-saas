'use client'

import { useState } from 'react'
import { Download, RefreshCw, CheckCircle2, AlertCircle, Clock, HardDrive, Database, FileArchive, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

type BackupStatus = 'completed' | 'running' | 'failed'
type BackupType = 'full' | 'incremental' | 'db-only'

interface Backup {
  id: string
  type: BackupType
  status: BackupStatus
  startedAt: string
  completedAt?: string
  sizeMb: number
  includedServices: string[]
  triggeredBy: string
}

const MOCK_BACKUPS: Backup[] = [
  {
    id: 'bkp_001',
    type: 'full',
    status: 'completed',
    startedAt: '2026-05-22T03:00:00Z',
    completedAt: '2026-05-22T03:12:41Z',
    sizeMb: 2840,
    includedServices: ['PostgreSQL', 'Archivos', 'Config'],
    triggeredBy: 'Automático',
  },
  {
    id: 'bkp_002',
    type: 'incremental',
    status: 'completed',
    startedAt: '2026-05-21T03:00:00Z',
    completedAt: '2026-05-21T03:04:18Z',
    sizeMb: 340,
    includedServices: ['PostgreSQL', 'Archivos'],
    triggeredBy: 'Automático',
  },
  {
    id: 'bkp_003',
    type: 'db-only',
    status: 'completed',
    startedAt: '2026-05-20T14:32:00Z',
    completedAt: '2026-05-20T14:33:51Z',
    sizeMb: 180,
    includedServices: ['PostgreSQL'],
    triggeredBy: 'Admin: Julian Rivera',
  },
  {
    id: 'bkp_004',
    type: 'full',
    status: 'failed',
    startedAt: '2026-05-19T03:00:00Z',
    sizeMb: 0,
    includedServices: ['PostgreSQL', 'Archivos', 'Config'],
    triggeredBy: 'Automático',
  },
  {
    id: 'bkp_005',
    type: 'full',
    status: 'completed',
    startedAt: '2026-05-18T03:00:00Z',
    completedAt: '2026-05-18T03:11:05Z',
    sizeMb: 2710,
    includedServices: ['PostgreSQL', 'Archivos', 'Config'],
    triggeredBy: 'Automático',
  },
  {
    id: 'bkp_006',
    type: 'incremental',
    status: 'completed',
    startedAt: '2026-05-17T03:00:00Z',
    completedAt: '2026-05-17T03:03:49Z',
    sizeMb: 290,
    includedServices: ['PostgreSQL', 'Archivos'],
    triggeredBy: 'Automático',
  },
]

const TYPE_LABELS: Record<BackupType, string> = { full: 'Completo', incremental: 'Incremental', 'db-only': 'Solo BD' }

const STATUS_CONFIG: Record<BackupStatus, { label: string; icon: React.ElementType; cls: string }> = {
  completed: { label: 'Completado', icon: CheckCircle2, cls: 'text-emerald-600' },
  running: { label: 'En progreso', icon: RefreshCw, cls: 'text-blue-600 animate-spin' },
  failed: { label: 'Fallido', icon: AlertCircle, cls: 'text-red-600' },
}

function formatBytes(mb: number) {
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`
  return `${mb} MB`
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('es-CO', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function BackupRow({ backup }: { backup: Backup }) {
  const cfg = STATUS_CONFIG[backup.status]
  const Icon = cfg.icon
  const duration = backup.completedAt
    ? Math.round((new Date(backup.completedAt).getTime() - new Date(backup.startedAt).getTime()) / 1000)
    : null

  return (
    <tr className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
      <td className="px-5 py-4">
        <div className="flex items-center gap-2">
          <FileArchive className="h-4 w-4 text-gray-400 shrink-0" />
          <div>
            <p className="text-sm font-medium text-gray-900">{TYPE_LABELS[backup.type]}</p>
            <p className="text-xs text-gray-400">{backup.id}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-4">
        <span className={cn('flex items-center gap-1.5 text-xs font-semibold', cfg.cls)}>
          <Icon className={cn('h-3.5 w-3.5', backup.status === 'running' && 'animate-spin')} />
          {cfg.label}
        </span>
      </td>
      <td className="px-5 py-4 text-sm text-gray-600">{formatDate(backup.startedAt)}</td>
      <td className="px-5 py-4 text-sm text-gray-600">
        {duration != null ? `${duration}s` : backup.status === 'running' ? '...' : '—'}
      </td>
      <td className="px-5 py-4 text-sm text-gray-600">
        {backup.sizeMb > 0 ? formatBytes(backup.sizeMb) : '—'}
      </td>
      <td className="px-5 py-4 text-xs text-gray-500">{backup.triggeredBy}</td>
      <td className="px-5 py-4">
        {backup.status === 'completed' && (
          <button className="flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50">
            <Download className="h-3.5 w-3.5" /> Descargar
          </button>
        )}
      </td>
    </tr>
  )
}

export default function BackupsPage() {
  const [backups, setBackups] = useState<Backup[]>(MOCK_BACKUPS)
  const [triggering, setTriggering] = useState(false)
  const [backupType, setBackupType] = useState<BackupType>('full')

  function triggerBackup() {
    setTriggering(true)
    const running: Backup = {
      id: `bkp_${Date.now()}`,
      type: backupType,
      status: 'running',
      startedAt: new Date().toISOString(),
      sizeMb: 0,
      includedServices: backupType === 'full' ? ['PostgreSQL', 'Archivos', 'Config'] :
                         backupType === 'incremental' ? ['PostgreSQL', 'Archivos'] : ['PostgreSQL'],
      triggeredBy: 'Admin: Julian Rivera',
    }
    setBackups((prev) => [running, ...prev])

    setTimeout(() => {
      setBackups((prev) =>
        prev.map((b) =>
          b.id === running.id
            ? {
                ...b,
                status: 'completed',
                completedAt: new Date().toISOString(),
                sizeMb: backupType === 'full' ? 2900 : backupType === 'incremental' ? 320 : 185,
              }
            : b
        )
      )
      setTriggering(false)
    }, 4000)
  }

  const totalSizeMb = backups.filter((b) => b.status === 'completed').reduce((s, b) => s + b.sizeMb, 0)
  const lastSuccess = backups.find((b) => b.status === 'completed')
  const failed = backups.filter((b) => b.status === 'failed').length

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Copias de seguridad</h1>
            <p className="text-xs text-gray-400 mt-0.5">Backups automáticos diarios + manuales bajo demanda</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={backupType}
              onChange={(e) => setBackupType(e.target.value as BackupType)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 bg-white focus:border-indigo-500 outline-none"
            >
              <option value="full">Backup completo</option>
              <option value="incremental">Incremental</option>
              <option value="db-only">Solo base de datos</option>
            </select>
            <button
              onClick={triggerBackup}
              disabled={triggering}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {triggering ? (
                <><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Ejecutando...</>
              ) : (
                <><Plus className="h-3.5 w-3.5" /> Iniciar backup</>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-6 p-6">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-4">
          {[
            { label: 'Total almacenado', value: formatBytes(totalSizeMb), icon: HardDrive, color: 'bg-indigo-100 text-indigo-600' },
            { label: 'Backups totales', value: backups.length.toString(), icon: FileArchive, color: 'bg-blue-100 text-blue-600' },
            { label: 'Último exitoso', value: lastSuccess ? formatDate(lastSuccess.startedAt) : '—', icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-600' },
            { label: 'Fallidos (30d)', value: failed.toString(), icon: AlertCircle, color: failed > 0 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className={cn('mb-3 flex h-9 w-9 items-center justify-center rounded-xl', color)}>
                <Icon className="h-4 w-4" />
              </div>
              <p className="text-xs text-gray-500">{label}</p>
              <p className="mt-1 text-sm font-bold text-gray-900 leading-tight">{value}</p>
            </div>
          ))}
        </div>

        {/* Schedule info */}
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-indigo-600 shrink-0" />
            <div>
              <p className="text-sm font-bold text-indigo-700">Política de backups automáticos</p>
              <p className="text-xs text-indigo-600 mt-0.5">
                Backup completo diariamente a las 03:00 UTC · Incremental cada 6h · Retención: 30 días · Cifrado AES-256
              </p>
            </div>
          </div>
        </div>

        {/* Backups table */}
        <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="text-sm font-bold text-gray-900">Historial de backups</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-500">
                  <th className="px-5 py-3 text-left">Tipo</th>
                  <th className="px-5 py-3 text-left">Estado</th>
                  <th className="px-5 py-3 text-left">Iniciado</th>
                  <th className="px-5 py-3 text-left">Duración</th>
                  <th className="px-5 py-3 text-left">Tamaño</th>
                  <th className="px-5 py-3 text-left">Disparado por</th>
                  <th className="px-5 py-3 text-left">Acción</th>
                </tr>
              </thead>
              <tbody>
                {backups.map((b) => <BackupRow key={b.id} backup={b} />)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
