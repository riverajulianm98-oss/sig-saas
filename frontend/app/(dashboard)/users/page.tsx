import type { Metadata } from 'next'
import { Users } from 'lucide-react'

export const metadata: Metadata = { title: 'Usuarios' }

export default function UsersPage() {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[hsl(var(--primary))]/10">
        <Users className="h-8 w-8 text-[hsl(var(--primary))]" />
      </div>
      <div>
        <h1 className="text-xl font-semibold">Gestión de Usuarios</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
          Módulo completo próximamente
        </p>
      </div>
    </div>
  )
}
