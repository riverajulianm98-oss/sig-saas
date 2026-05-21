'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Shield, ClipboardCheck, FileText, BarChart3,
  ArrowRight, CheckCircle2, Sparkles, Users,
} from 'lucide-react'
import { isDemoMode } from '@/lib/demo-mode'
import { useAuthStore } from '@/store/auth.store'
import { DEMO_USER, DEMO_TENANT, DEMO_TOKEN, DEMO_REFRESH } from '@/lib/demo-data'
import { TOKEN_KEYS } from '@/lib/constants'

const FEATURES = [
  { icon: ClipboardCheck, label: 'Auditorías ISO', desc: '9001 · 14001 · 45001', color: 'text-blue-600 bg-blue-500/10' },
  { icon: FileText, label: 'Control documental', desc: 'Versionado · Flujo aprobación', color: 'text-purple-600 bg-purple-500/10' },
  { icon: Sparkles, label: 'IA para hallazgos', desc: 'Sugerencias automáticas', color: 'text-amber-600 bg-amber-500/10' },
  { icon: BarChart3, label: 'Compliance visual', desc: 'Score por cláusula', color: 'text-emerald-600 bg-emerald-500/10' },
  { icon: Users, label: 'RBAC enterprise', desc: 'Roles y permisos', color: 'text-rose-600 bg-rose-500/10' },
  { icon: Shield, label: 'Seguridad', desc: 'JWT · Multi-tenant', color: 'text-indigo-600 bg-indigo-500/10' },
]

export default function LandingPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated) router.replace('/dashboard')
  }, [isAuthenticated, router])

  const enterDemo = () => {
    const { setAuth } = useAuthStore.getState()
    localStorage.setItem(TOKEN_KEYS.access, DEMO_TOKEN)
    localStorage.setItem(TOKEN_KEYS.refresh, DEMO_REFRESH)
    localStorage.setItem(TOKEN_KEYS.tenantId, DEMO_TENANT.id)
    setAuth(DEMO_USER, DEMO_TENANT, { access: DEMO_TOKEN, refresh: DEMO_REFRESH })
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] flex flex-col">
      {/* Demo indicator */}
      {isDemoMode() && (
        <div className="flex items-center justify-center gap-2 bg-[hsl(var(--primary))]/10 border-b border-[hsl(var(--primary))]/20 px-4 py-1.5">
          <span className="text-xs font-medium text-[hsl(var(--primary))]">
            Modo demostración activo — datos simulados de SIGCYA Consulting S.A.S.
          </span>
        </div>
      )}

      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-[hsl(var(--border))]">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--primary))]">
            <Shield className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">SIG SaaS</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
            Iniciar sesión
          </Link>
          {isDemoMode() && (
            <button
              onClick={enterDemo}
              className="flex items-center gap-1.5 rounded-lg bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-white hover:bg-[hsl(var(--primary))]/90 transition-all"
            >
              Ver demo <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--primary))]/30 bg-[hsl(var(--primary))]/10 px-4 py-1.5 text-xs font-medium text-[hsl(var(--primary))] mb-8">
          <Sparkles className="h-3 w-3" />
          Sistema Integrado de Gestión · Enterprise
        </div>

        <h1 className="text-5xl font-bold tracking-tight max-w-2xl leading-tight">
          Gestión ISO{' '}
          <span className="text-[hsl(var(--primary))]">inteligente</span>{' '}
          para tu empresa
        </h1>

        <p className="mt-5 text-lg text-[hsl(var(--muted-foreground))] max-w-lg leading-relaxed">
          Auditorías, documentos, hallazgos y compliance en una sola plataforma.
          Con inteligencia artificial para detectar no conformidades automáticamente.
        </p>

        <div className="flex items-center gap-4 mt-10">
          {isDemoMode() ? (
            <button
              onClick={enterDemo}
              className="flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-8 py-3.5 text-base font-semibold text-white hover:bg-[hsl(var(--primary))]/90 transition-all shadow-lg shadow-[hsl(var(--primary))]/20"
            >
              Explorar demo <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <Link
              href="/register"
              className="flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-8 py-3.5 text-base font-semibold text-white hover:bg-[hsl(var(--primary))]/90 transition-all"
            >
              Comenzar gratis <ArrowRight className="h-4 w-4" />
            </Link>
          )}
          <Link
            href="/login"
            className="rounded-xl border border-[hsl(var(--border))] px-8 py-3.5 text-base font-medium hover:bg-[hsl(var(--accent))] transition-all"
          >
            Iniciar sesión
          </Link>
        </div>

        {/* Trust indicators */}
        <div className="flex items-center gap-6 mt-10 text-xs text-[hsl(var(--muted-foreground))]">
          {['ISO 9001', 'ISO 14001', 'ISO 45001'].map((std) => (
            <div key={std} className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              {std}
            </div>
          ))}
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-2 gap-4 mt-16 max-w-xl w-full sm:grid-cols-3">
          {FEATURES.map((f) => {
            const Icon = f.icon
            return (
              <div
                key={f.label}
                className="rounded-xl border border-[hsl(var(--border))] p-4 text-left hover:border-[hsl(var(--primary))]/30 hover:bg-[hsl(var(--accent))]/30 transition-all"
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${f.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <p className="mt-3 text-sm font-semibold">{f.label}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">{f.desc}</p>
              </div>
            )
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[hsl(var(--border))] px-8 py-4 text-center text-xs text-[hsl(var(--muted-foreground))]">
        SIG SaaS Enterprise · {new Date().getFullYear()} · Sistema Integrado de Gestión
      </footer>
    </div>
  )
}
