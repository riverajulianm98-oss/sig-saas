'use client'

import { FlaskConical } from 'lucide-react'

export function DemoBanner() {
  return (
    <div className="flex items-center justify-center gap-2 bg-[hsl(var(--primary))]/10 border-b border-[hsl(var(--primary))]/20 px-4 py-1.5">
      <FlaskConical className="h-3 w-3 text-[hsl(var(--primary))]" />
      <span className="text-xs font-medium text-[hsl(var(--primary))]">
        Modo demostración — empresa: <strong>SIGCYA Consulting S.A.S.</strong>
      </span>
    </div>
  )
}
