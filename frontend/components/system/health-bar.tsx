'use client'

import { useHealth } from '@/lib/health'
import { config } from '@/lib/config'
import { isDemoMode } from '@/lib/demo-mode'
import Link from 'next/link'
import { ExternalLink, FlaskConical, RefreshCw } from 'lucide-react'

export function HealthBar() {
  const { health, check } = useHealth()
  const demo = isDemoMode()

  return (
    <div className="flex items-center justify-between gap-4 border-b border-[hsl(var(--primary))]/20 bg-[hsl(var(--primary))]/8 px-4 py-1.5">

      {/* Left: mode + company */}
      <div className="flex items-center gap-2">
        <FlaskConical className="h-3 w-3 text-[hsl(var(--primary))]" />
        <span className="text-xs font-medium text-[hsl(var(--primary))]">
          {demo ? 'Modo demostración' : 'Modo producción'} ·{' '}
          <strong>SIGCYA Consulting S.A.S.</strong>
        </span>
      </div>

      {/* Right: status indicators */}
      <div className="flex items-center gap-4">

        {/* Backend status */}
        {demo ? (
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--primary))] animate-pulse" />
            <span className="text-[11px] font-semibold text-[hsl(var(--primary))]">Demo Mode</span>
          </div>
        ) : (
          <button
            onClick={check}
            className="flex items-center gap-1.5 group"
            title={`Latencia: ${health.latencyMs ?? '?'}ms · Verificado: ${health.checkedAt?.toLocaleTimeString() ?? '—'}`}
          >
            {health.status === 'checking' && (
              <>
                <RefreshCw className="h-3 w-3 text-gray-400 animate-spin" />
                <span className="text-[11px] font-semibold text-gray-400">Conectando...</span>
              </>
            )}
            {health.status === 'healthy' && (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  Backend conectado
                  {health.latencyMs !== null && (
                    <span className="font-normal opacity-60 ml-1">{health.latencyMs}ms</span>
                  )}
                </span>
              </>
            )}
            {health.status === 'degraded' && (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                  Backend degradado · DB {health.database}
                </span>
              </>
            )}
            {health.status === 'unreachable' && (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                <span className="text-[11px] font-semibold text-red-600 dark:text-red-400">
                  Backend offline
                  {config.useMockFallback && (
                    <span className="ml-1 font-normal opacity-80">· Fallback activo</span>
                  )}
                </span>
              </>
            )}
          </button>
        )}

        {/* DB indicator (only when connected) */}
        {!demo && health.status === 'healthy' && (
          <div className="hidden sm:flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              DB {health.database}
            </span>
          </div>
        )}

        {/* Quick links */}
        <div className="flex items-center gap-3">
          <Link
            href="/showcase"
            className="flex items-center gap-1 text-[11px] font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
          >
            Showcase <ExternalLink className="h-3 w-3" />
          </Link>
          <Link
            href="/demo"
            className="flex items-center gap-1 text-[11px] font-medium text-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]/80 transition-colors"
          >
            Módulos <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  )
}
