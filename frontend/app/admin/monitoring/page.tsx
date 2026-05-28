'use client'

import { useState, useEffect } from 'react'
import {
  CheckCircle2, AlertCircle, XCircle, RefreshCw,
  Database, Server, Globe, Zap, Clock, TrendingUp, Activity
} from 'lucide-react'
import { cn } from '@/lib/utils'

type ServiceStatus = 'operational' | 'degraded' | 'down'

interface ServiceCheck {
  name: string
  status: ServiceStatus
  latencyMs: number
  uptime: number
  icon: React.ElementType
  description: string
}

interface MetricPoint { t: string; v: number }

function randomLatency(base: number, jitter = 15) {
  return base + Math.round((Math.random() - 0.5) * jitter)
}

function generateServices(): ServiceCheck[] {
  return [
    { name: 'API REST', status: 'operational', latencyMs: randomLatency(42), uptime: 99.97, icon: Globe, description: 'Gateway principal' },
    { name: 'Base de datos', status: 'operational', latencyMs: randomLatency(8, 5), uptime: 99.99, icon: Database, description: 'PostgreSQL 15' },
    { name: 'Almacenamiento', status: 'operational', latencyMs: randomLatency(120, 30), uptime: 99.95, icon: Server, description: 'S3-compatible object store' },
    { name: 'Auth Service', status: 'operational', latencyMs: randomLatency(18, 8), uptime: 100, icon: Zap, description: 'JWT + SSO provider' },
    { name: 'Email (SMTP)', status: 'degraded', latencyMs: randomLatency(480, 80), uptime: 99.1, icon: Globe, description: 'Transactional email' },
    { name: 'Worker / Queue', status: 'operational', latencyMs: randomLatency(55, 20), uptime: 99.88, icon: Activity, description: 'Automatizaciones & cron' },
    { name: 'Webhook delivery', status: 'operational', latencyMs: randomLatency(210, 50), uptime: 99.72, icon: Zap, description: 'Outbound webhook relay' },
    { name: 'CDN', status: 'operational', latencyMs: randomLatency(28, 10), uptime: 100, icon: Globe, description: 'Edge cache & static assets' },
  ]
}

function generateHistory(): MetricPoint[] {
  const points: MetricPoint[] = []
  const now = Date.now()
  for (let i = 23; i >= 0; i--) {
    const t = new Date(now - i * 3600000)
    points.push({
      t: t.getHours().toString().padStart(2, '0') + ':00',
      v: 20 + Math.round(Math.random() * 60),
    })
  }
  return points
}

const STATUS_CONFIG: Record<ServiceStatus, { label: string; color: string; icon: React.ElementType; dot: string }> = {
  operational: { label: 'Operacional', color: 'text-emerald-600', icon: CheckCircle2, dot: 'bg-emerald-500' },
  degraded: { label: 'Degradado', color: 'text-amber-600', icon: AlertCircle, dot: 'bg-amber-500' },
  down: { label: 'Caído', color: 'text-red-600', icon: XCircle, dot: 'bg-red-500' },
}

function StatusBadge({ status }: { status: ServiceStatus }) {
  const cfg = STATUS_CONFIG[status]
  const Icon = cfg.icon
  return (
    <span className={cn('flex items-center gap-1.5 text-xs font-semibold', cfg.color)}>
      <span className={cn('h-2 w-2 rounded-full animate-pulse', cfg.dot)} />
      {cfg.label}
    </span>
  )
}

function ServiceRow({ svc }: { svc: ServiceCheck }) {
  const Icon = svc.icon
  const latencyColor = svc.latencyMs < 100 ? 'text-emerald-600' : svc.latencyMs < 300 ? 'text-amber-600' : 'text-red-600'

  return (
    <tr className="hover:bg-gray-50/50 border-b border-gray-100 last:border-0">
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
            <Icon className="h-4 w-4 text-gray-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{svc.name}</p>
            <p className="text-xs text-gray-400">{svc.description}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-3.5"><StatusBadge status={svc.status} /></td>
      <td className={cn('px-5 py-3.5 text-sm font-mono font-semibold', latencyColor)}>{svc.latencyMs}ms</td>
      <td className="px-5 py-3.5 text-sm text-gray-600">{svc.uptime.toFixed(2)}%</td>
    </tr>
  )
}

function LatencyChart({ points }: { points: MetricPoint[] }) {
  const max = Math.max(...points.map((p) => p.v), 1)
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-bold text-gray-900">Latencia API — últimas 24h</h2>
        <span className="text-xs text-gray-400">ms (p95)</span>
      </div>
      <div className="flex items-end gap-1 h-28">
        {points.map((p, i) => {
          const h = Math.round((p.v / max) * 100)
          const isHigh = p.v > 60
          return (
            <div key={i} className="flex flex-1 flex-col items-center gap-0.5" title={`${p.t}: ${p.v}ms`}>
              <div
                className={cn('w-full rounded-t-sm', isHigh ? 'bg-amber-400' : 'bg-indigo-400')}
                style={{ height: `${h}%` }}
              />
            </div>
          )
        })}
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-gray-400">
        <span>{points[0]?.t}</span>
        <span>{points[Math.floor(points.length / 2)]?.t}</span>
        <span>{points[points.length - 1]?.t}</span>
      </div>
    </div>
  )
}

export default function MonitoringPage() {
  const [services, setServices] = useState<ServiceCheck[]>([])
  const [history, setHistory] = useState<MetricPoint[]>([])
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const [refreshing, setRefreshing] = useState(false)

  function refresh() {
    setRefreshing(true)
    setTimeout(() => {
      setServices(generateServices())
      setHistory(generateHistory())
      setLastRefresh(new Date())
      setRefreshing(false)
    }, 600)
  }

  useEffect(() => {
    setServices(generateServices())
    setHistory(generateHistory())
    const id = setInterval(refresh, 30000)
    return () => clearInterval(id)
  }, [])

  const operational = services.filter((s) => s.status === 'operational').length
  const degraded = services.filter((s) => s.status === 'degraded').length
  const down = services.filter((s) => s.status === 'down').length
  const overallStatus: ServiceStatus = down > 0 ? 'down' : degraded > 0 ? 'degraded' : 'operational'
  const avgLatency = services.length ? Math.round(services.reduce((s, x) => s + x.latencyMs, 0) / services.length) : 0

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Monitorización del sistema</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Actualizado: {lastRefresh.toLocaleTimeString('es-CO')} · Auto-refresca cada 30s
            </p>
          </div>
          <button
            onClick={refresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', refreshing && 'animate-spin')} /> Refrescar
          </button>
        </div>
      </div>

      <div className="flex-1 space-y-6 p-6">
        {/* Overall status */}
        <div className={cn(
          'rounded-2xl border px-6 py-4',
          overallStatus === 'operational' ? 'border-emerald-200 bg-emerald-50' :
          overallStatus === 'degraded' ? 'border-amber-200 bg-amber-50' :
          'border-red-200 bg-red-50'
        )}>
          <div className="flex items-center gap-3">
            {overallStatus === 'operational' ? (
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            ) : overallStatus === 'degraded' ? (
              <AlertCircle className="h-6 w-6 text-amber-600" />
            ) : (
              <XCircle className="h-6 w-6 text-red-600" />
            )}
            <div>
              <p className={cn('text-base font-bold',
                overallStatus === 'operational' ? 'text-emerald-700' :
                overallStatus === 'degraded' ? 'text-amber-700' : 'text-red-700'
              )}>
                {overallStatus === 'operational' ? 'Todos los sistemas operacionales' :
                 overallStatus === 'degraded' ? 'Algunos servicios degradados' :
                 'Incidencia activa — Revisar servicios'}
              </p>
              <p className="text-xs text-gray-500">
                {operational} operacionales · {degraded} degradados · {down} caídos
              </p>
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid gap-4 sm:grid-cols-4">
          {[
            { label: 'Latencia promedio', value: `${avgLatency}ms`, icon: Clock, color: 'bg-blue-100 text-blue-600' },
            { label: 'Uptime API', value: '99.97%', icon: TrendingUp, color: 'bg-emerald-100 text-emerald-600' },
            { label: 'Req/min ahora', value: `${Math.floor(Math.random() * 200 + 100)}`, icon: Activity, color: 'bg-indigo-100 text-indigo-600' },
            { label: 'Errores (1h)', value: `${Math.floor(Math.random() * 8)}`, icon: XCircle, color: 'bg-red-100 text-red-600' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className={cn('mb-3 flex h-9 w-9 items-center justify-center rounded-xl', color)}>
                <Icon className="h-4 w-4" />
              </div>
              <p className="text-xs text-gray-500">{label}</p>
              <p className="mt-1 text-2xl font-extrabold text-gray-900">{value}</p>
            </div>
          ))}
        </div>

        {/* Services table */}
        <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="text-sm font-bold text-gray-900">Estado de servicios</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-500">
                <th className="px-5 py-3 text-left">Servicio</th>
                <th className="px-5 py-3 text-left">Estado</th>
                <th className="px-5 py-3 text-left">Latencia</th>
                <th className="px-5 py-3 text-left">Uptime 30d</th>
              </tr>
            </thead>
            <tbody>
              {services.map((svc) => <ServiceRow key={svc.name} svc={svc} />)}
            </tbody>
          </table>
        </div>

        {/* Latency chart */}
        {history.length > 0 && <LatencyChart points={history} />}
      </div>
    </div>
  )
}
