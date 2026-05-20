import type { Metadata } from 'next'
import { AlertTriangle } from 'lucide-react'

export const metadata: Metadata = { title: 'Hallazgos' }

export default function FindingsPage() {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10">
        <AlertTriangle className="h-8 w-8 text-amber-500" />
      </div>
      <div>
        <h1 className="text-xl font-semibold">Hallazgos</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
          Módulo completo próximamente
        </p>
      </div>
    </div>
  )
}
