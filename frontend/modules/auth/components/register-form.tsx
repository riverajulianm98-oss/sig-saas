'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/store/auth.store'
import { TOKEN_KEYS } from '@/lib/constants'

const schema = z.object({
  company_name: z.string().min(2, 'Mínimo 2 caracteres'),
  full_name: z.string().min(2, 'Mínimo 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe tener al menos una mayúscula')
    .regex(/[0-9]/, 'Debe tener al menos un número'),
})

type FormValues = z.infer<typeof schema>

export function RegisterForm() {
  const router = useRouter()
  const { setAuth } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (values: FormValues) => {
    setError(null)
    try {
      const res = await authService.register({
        tenant: { company_name: values.company_name },
        admin: {
          email: values.email,
          password: values.password,
          full_name: values.full_name,
        },
      })
      localStorage.setItem(TOKEN_KEYS.access, res.token.access_token)
      localStorage.setItem(TOKEN_KEYS.refresh, res.token.refresh_token)
      localStorage.setItem(TOKEN_KEYS.tenantId, res.tenant.id)
      setAuth(res.user, res.tenant, {
        access: res.token.access_token,
        refresh: res.token.refresh_token,
      })
      router.push('/dashboard')
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Error al registrar. Intenta de nuevo.')
    }
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="space-y-1.5 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Crea tu cuenta</h1>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Empieza tu prueba gratuita de 14 días
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="rounded-md bg-[hsl(var(--destructive))]/10 p-3 text-sm text-[hsl(var(--destructive))]">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="company_name">Nombre de la empresa</Label>
          <Input id="company_name" placeholder="Empresa S.A.S." {...register('company_name')} />
          {errors.company_name && (
            <p className="text-xs text-[hsl(var(--destructive))]">{errors.company_name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="full_name">Tu nombre</Label>
          <Input id="full_name" placeholder="Juan Pérez" {...register('full_name')} />
          {errors.full_name && (
            <p className="text-xs text-[hsl(var(--destructive))]">{errors.full_name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="juan@empresa.com"
            autoComplete="email"
            {...register('email')}
          />
          {errors.email && (
            <p className="text-xs text-[hsl(var(--destructive))]">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="new-password"
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-[hsl(var(--destructive))]">{errors.password.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle className="h-4 w-4" />
          )}
          {isSubmitting ? 'Creando cuenta…' : 'Crear cuenta gratuita'}
        </Button>
      </form>

      <p className="text-center text-xs text-[hsl(var(--muted-foreground))]">
        Al registrarte aceptas los{' '}
        <span className="underline underline-offset-2 cursor-pointer">Términos de servicio</span> y la{' '}
        <span className="underline underline-offset-2 cursor-pointer">Política de privacidad</span>.
      </p>

      <p className="text-center text-sm text-[hsl(var(--muted-foreground))]">
        ¿Ya tienes cuenta?{' '}
        <Link
          href="/login"
          className="font-medium text-[hsl(var(--primary))] hover:underline underline-offset-4"
        >
          Inicia sesión
        </Link>
      </p>
    </div>
  )
}
