import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export const metadata: Metadata = { title: 'Recuperar contraseña' }

export default function ForgotPasswordPage() {
  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="space-y-2 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--primary))]/10">
          <Mail className="h-6 w-6 text-[hsl(var(--primary))]" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Recuperar contraseña</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Ingresa tu email y te enviaremos instrucciones.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="tu@empresa.com" />
        </div>
        <Button className="w-full" disabled>
          Enviar instrucciones
          <span className="ml-2 text-xs opacity-60">(próximamente)</span>
        </Button>
      </div>

      <Button variant="ghost" asChild className="w-full">
        <Link href="/login">
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio de sesión
        </Link>
      </Button>
    </div>
  )
}
