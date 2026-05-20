'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

const LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  documents: 'Documentos',
  audits: 'Auditorías',
  findings: 'Hallazgos',
  kpis: 'Indicadores',
  users: 'Usuarios',
  settings: 'Configuración',
  new: 'Nuevo',
  edit: 'Editar',
}

export function Breadcrumbs() {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)

  return (
    <nav className="flex items-center gap-1 text-sm text-[hsl(var(--muted-foreground))]">
      <Link href="/dashboard" className="hover:text-[hsl(var(--foreground))] transition-colors">
        <Home className="h-3.5 w-3.5" />
      </Link>
      {segments.map((seg, i) => {
        const href = '/' + segments.slice(0, i + 1).join('/')
        const isLast = i === segments.length - 1
        const label = LABELS[seg] ?? seg

        return (
          <span key={href} className="flex items-center gap-1">
            <ChevronRight className="h-3 w-3" />
            {isLast ? (
              <span className={cn('font-medium', isLast && 'text-[hsl(var(--foreground))]')}>
                {label}
              </span>
            ) : (
              <Link
                href={href}
                className="hover:text-[hsl(var(--foreground))] transition-colors"
              >
                {label}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
