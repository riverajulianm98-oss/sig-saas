'use client'

import { useTheme } from 'next-themes'
import { Moon, Sun, Bell, LogOut, User, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/hooks/use-auth'
import { initials } from '@/lib/utils'
import { ROLE_LABELS } from '@/lib/constants'
import { Breadcrumbs } from './breadcrumbs'
import { DemoTourButton } from '@/components/demo/demo-tour'
import { isDemoMode } from '@/lib/demo-mode'

export function Navbar() {
  const { resolvedTheme, setTheme } = useTheme()
  const { user, tenant, logout } = useAuth()

  return (
    <header className="flex h-14 items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--background))] px-6">
      <Breadcrumbs />

      <div className="flex items-center gap-2">
        {isDemoMode() && <DemoTourButton />}
        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          className="h-8 w-8 text-[hsl(var(--muted-foreground))]"
        >
          {resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="h-8 w-8 text-[hsl(var(--muted-foreground))]">
          <Bell className="h-4 w-4" />
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 gap-2 px-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-[10px] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]">
                  {user ? initials(user.full_name) : '?'}
                </AvatarFallback>
              </Avatar>
              <span className="hidden max-w-[120px] truncate text-sm font-medium sm:block">
                {user?.full_name ?? 'Usuario'}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <p className="font-medium">{user?.full_name}</p>
              <p className="text-xs font-normal text-[hsl(var(--muted-foreground))]">{user?.email}</p>
              <p className="mt-0.5 text-[10px] font-normal text-[hsl(var(--muted-foreground))]">
                {user?.role ? ROLE_LABELS[user.role] : ''} · {tenant?.name}
              </p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="h-4 w-4" />
              Mi perfil
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="h-4 w-4" />
              Configuración
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-[hsl(var(--destructive))] focus:text-[hsl(var(--destructive))]"
              onClick={() => logout()}
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
