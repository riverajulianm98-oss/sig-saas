'use client'

import Link from 'next/link'
import { FlaskConical, ExternalLink } from 'lucide-react'

export function DemoBanner() {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[hsl(var(--primary))]/20 bg-[hsl(var(--primary))]/8 px-4 py-1.5">
      <div className="flex items-center gap-2">
        <FlaskConical className="h-3 w-3 text-[hsl(var(--primary))]" />
        <span className="text-xs font-medium text-[hsl(var(--primary))]">
          Modo demostración ·{' '}
          <strong>SIGCYA Consulting S.A.S.</strong>
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Demo Ready status */}
        <div className="hidden sm:flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            Demo Ready
          </span>
        </div>

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
