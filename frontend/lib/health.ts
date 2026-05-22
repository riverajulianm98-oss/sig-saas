'use client'

import { useState, useEffect, useCallback } from 'react'
import { config } from './config'

export interface HealthStatus {
  reachable: boolean
  status: 'healthy' | 'degraded' | 'unreachable' | 'checking'
  database: 'up' | 'down' | 'unknown'
  latencyMs: number | null
  version: string | null
  checkedAt: Date | null
}

const INITIAL: HealthStatus = {
  reachable: false,
  status: 'checking',
  database: 'unknown',
  latencyMs: null,
  version: null,
  checkedAt: null,
}

export function useHealth(intervalMs = 30_000) {
  const [health, setHealth] = useState<HealthStatus>(INITIAL)

  const check = useCallback(async () => {
    const t0 = Date.now()
    try {
      const res = await fetch(`${config.apiBase}/health`, {
        signal: AbortSignal.timeout(5000),
        cache: 'no-store',
      })
      const latencyMs = Date.now() - t0
      if (!res.ok) {
        setHealth({ reachable: true, status: 'degraded', database: 'unknown', latencyMs, version: null, checkedAt: new Date() })
        return
      }
      const data = await res.json()
      setHealth({
        reachable: true,
        status: data.status === 'healthy' ? 'healthy' : 'degraded',
        database: data.database ?? 'unknown',
        latencyMs,
        version: data.version ?? null,
        checkedAt: new Date(),
      })
    } catch {
      setHealth({ reachable: false, status: 'unreachable', database: 'unknown', latencyMs: null, version: null, checkedAt: new Date() })
    }
  }, [])

  useEffect(() => {
    if (config.demoMode) return // skip health polling in pure demo mode
    check()
    const id = setInterval(check, intervalMs)
    return () => clearInterval(id)
  }, [check, intervalMs])

  return { health, check }
}
