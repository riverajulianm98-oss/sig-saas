'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  ClipboardCheck,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  TrendingUp,
  Download,
  Zap,
  Shield,
  CreditCard,
  Activity,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/store/ui.store'
import { useAuthStore } from '@/store/auth.store'
import { ROLE_LEVEL } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'
import { SIGLogo } from '@/components/brand/logo'

const navItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    minRole: 0,
  },
  {
    label: 'Documentos',
    href: '/documents',
    icon: FileText,
    minRole: 0,
  },
  {
    label: 'Auditorías',
    href: '/audits',
    icon: ClipboardCheck,
    minRole: 0,
  },
  {
    label: 'Hallazgos',
    href: '/findings',
    icon: AlertTriangle,
    minRole: 0,
  },
  {
    label: 'CAPA',
    href: '/capa',
    icon: CheckCircle2,
    minRole: 0,
  },
  {
    label: 'Analytics',
    href: '/analytics',
    icon: TrendingUp,
    minRole: 0,
  },
  {
    label: 'Reportes',
    href: '/reports',
    icon: Download,
    minRole: 0,
  },
  {
    label: 'Automatización',
    href: '/automation',
    icon: Zap,
    minRole: 0,
  },
  {
    label: 'Indicadores',
    href: '/kpis',
    icon: BarChart3,
    minRole: 0,
    badge: 'Próximo',
  },
  {
    label: 'Usuarios',
    href: '/users',
    icon: Users,
    minRole: ROLE_LEVEL['coordinador_sig'],
  },
  {
    label: 'Uso y consumo',
    href: '/usage',
    icon: Activity,
    minRole: ROLE_LEVEL['admin_empresa'],
  },
  {
    label: 'Facturación',
    href: '/settings/billing',
    icon: CreditCard,
    minRole: ROLE_LEVEL['admin_empresa'],
  },
  {
    label: 'Configuración',
    href: '/settings',
    icon: Settings,
    minRole: ROLE_LEVEL['admin_empresa'],
  },
  {
    label: 'Super Admin',
    href: '/admin',
    icon: Shield,
    minRole: ROLE_LEVEL['super_admin'] ?? 99,
    badge: 'Admin',
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarCollapsed, toggleSidebar } = useUIStore()
  const { user } = useAuthStore()
  const userLevel = ROLE_LEVEL[user?.role ?? 'usuario'] ?? 0

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'relative flex h-screen flex-col border-r border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-bg))] transition-all duration-200',
          sidebarCollapsed ? 'w-16' : 'w-60'
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            'flex h-14 items-center border-b border-[hsl(var(--sidebar-border))] px-4',
            sidebarCollapsed && 'justify-center px-0'
          )}
        >
          <SIGLogo size={28} variant={sidebarCollapsed ? 'icon' : 'full'} />
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
          {navItems
            .filter((item) => userLevel >= item.minRole)
            .map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + '/')
              const Icon = item.icon

              if (sidebarCollapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        className={cn(
                          'flex h-9 w-9 items-center justify-center rounded-md transition-colors mx-auto',
                          active
                            ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                            : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]'
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">{item.label}</TooltipContent>
                  </Tooltip>
                )
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex h-9 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors',
                    active
                      ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                      : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))]'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto rounded-full bg-[hsl(var(--muted))] px-1.5 py-0.5 text-[10px] font-medium text-[hsl(var(--muted-foreground))]">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
        </nav>

        {/* Collapse toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className={cn(
            'absolute -right-3 top-16 z-10 h-6 w-6 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--background))] shadow-sm hover:bg-[hsl(var(--accent))]'
          )}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </Button>
      </aside>
    </TooltipProvider>
  )
}
