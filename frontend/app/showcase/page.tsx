'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  BarChart2, FileText, ClipboardCheck, AlertTriangle,
  TrendingUp, Download, CheckSquare, ArrowRight, CheckCircle2,
  Shield, Zap, Globe,
} from 'lucide-react'
import { SIGLogo } from '@/components/brand/logo'
import { useAuthStore } from '@/store/auth.store'
import { DEMO_USER, DEMO_TENANT, DEMO_TOKEN, DEMO_REFRESH } from '@/lib/demo-data'
import { TOKEN_KEYS } from '@/lib/constants'

const KPIS = [
  { value: '87%', label: 'Compliance global', sublabel: 'Score promedio SIG', color: '#6366f1' },
  { value: '10', label: 'Hallazgos abiertos', sublabel: '3 críticos · 7 en seguimiento', color: '#ef4444' },
  { value: '15', label: 'Acciones CAPA', sublabel: '5 en validación · 3 cerradas', color: '#10b981' },
  { value: '3', label: 'Auditorías activas', sublabel: '9001 · 14001 · 45001', color: '#3b82f6' },
]

const MODULES = [
  { icon: BarChart2,      label: 'Dashboard',    status: 'Activo',    color: '#6366f1' },
  { icon: FileText,       label: 'Documentos',   status: 'Activo',    color: '#8b5cf6' },
  { icon: ClipboardCheck, label: 'Auditorías',   status: 'Activo',    color: '#3b82f6' },
  { icon: AlertTriangle,  label: 'Hallazgos',    status: 'Activo',    color: '#f59e0b' },
  { icon: CheckSquare,    label: 'CAPA',         status: 'Activo',    color: '#10b981' },
  { icon: TrendingUp,     label: 'Analytics',    status: 'Activo',    color: '#06b6d4' },
  { icon: Download,       label: 'Reportes',     status: 'Activo',    color: '#ec4899' },
]

const TECH = ['Next.js 15', 'TypeScript', 'Tailwind v4', 'FastAPI', 'PostgreSQL', 'Redis', 'TanStack Query', 'Zustand']
const NORMS = ['ISO 9001:2015', 'ISO 14001:2015', 'ISO 45001:2018', 'HSEQ Colombia', 'RUC', 'BASC']

export default function ShowcasePage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()

  const startDemo = () => {
    if (isAuthenticated) {
      router.push('/dashboard')
      return
    }
    const { setAuth } = useAuthStore.getState()
    localStorage.setItem(TOKEN_KEYS.access, DEMO_TOKEN)
    localStorage.setItem(TOKEN_KEYS.refresh, DEMO_REFRESH)
    localStorage.setItem(TOKEN_KEYS.tenantId, DEMO_TENANT.id)
    setAuth(DEMO_USER, DEMO_TENANT, { access: DEMO_TOKEN, refresh: DEMO_REFRESH })
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white overflow-auto">

      {/* Status bar */}
      <div className="flex items-center justify-center gap-2 border-b border-white/5 bg-emerald-500/10 px-4 py-2">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-xs font-semibold text-emerald-400">
          Plataforma operativa · Todos los sistemas normales · Demo Ready
        </span>
      </div>

      {/* Top bar */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-white/8">
        <SIGLogo dark size={36} />
        <div className="flex items-center gap-4">
          <Link href="/landing" className="text-sm text-white/40 hover:text-white/70 transition-colors">
            Landing
          </Link>
          <Link href="/demo" className="text-sm text-white/40 hover:text-white/70 transition-colors">
            Explorar módulos
          </Link>
          <Link href="/login" className="rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-white/80 hover:bg-white/10 transition-all">
            Iniciar sesión
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-12 space-y-14">

        {/* Hero headline */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-5 py-2 text-sm font-semibold text-indigo-400">
            <Shield className="h-4 w-4" />
            SIGCYA Integrated Management Platform
          </div>
          <h1 className="text-5xl font-black tracking-tight lg:text-6xl bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
            Enterprise SIG en una
            <br />sola plataforma
          </h1>
          <p className="text-white/40 text-xl max-w-2xl mx-auto">
            ISO 9001 · 14001 · 45001 · HSEQ — Auditorías, documentos, hallazgos
            y CAPA con IA integrada para PYMES latinoamericanas.
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {KPIS.map((kpi, i) => (
            <div key={i} className="rounded-2xl border border-white/8 bg-white/5 p-6 backdrop-blur">
              <p className="text-5xl font-black tabular-nums mb-2" style={{ color: kpi.color }}>
                {kpi.value}
              </p>
              <p className="text-base font-bold text-white/80">{kpi.label}</p>
              <p className="text-xs text-white/35 mt-1">{kpi.sublabel}</p>
            </div>
          ))}
        </div>

        {/* Module grid */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-white/30 mb-5">
            Módulos disponibles
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {MODULES.map((m) => (
              <div key={m.label} className="rounded-2xl border border-white/8 bg-white/5 p-4 text-center">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl mx-auto mb-3"
                  style={{ background: m.color + '20' }}
                >
                  <m.icon className="h-5 w-5" style={{ color: m.color }} />
                </div>
                <p className="text-sm font-semibold text-white/80">{m.label}</p>
                <div className="mt-2 flex items-center justify-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span className="text-[10px] text-emerald-400 font-medium">{m.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Two column: tech + norms */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Tech stack */}
          <div className="rounded-2xl border border-white/8 bg-white/5 p-6">
            <div className="flex items-center gap-2 mb-5">
              <Zap className="h-4 w-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white/70 uppercase tracking-wider">Stack técnico</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {TECH.map((t) => (
                <span key={t} className="rounded-lg border border-white/10 bg-white/8 px-3 py-1.5 text-xs font-semibold text-white/60">
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Norms */}
          <div className="rounded-2xl border border-white/8 bg-white/5 p-6">
            <div className="flex items-center gap-2 mb-5">
              <Globe className="h-4 w-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white/70 uppercase tracking-wider">Normas soportadas</h3>
            </div>
            <div className="space-y-2">
              {NORMS.map((n) => (
                <div key={n} className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span className="text-sm font-medium text-white/60">{n}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Risk gauge strip */}
        <div className="rounded-2xl border border-white/8 bg-white/5 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white/70 uppercase tracking-wider mb-1">Estado de riesgo global</h3>
              <p className="text-white/35 text-sm">Distribución de hallazgos por nivel de riesgo</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-6">
                {[
                  { label: 'Bajo', pct: '35%', color: '#10b981' },
                  { label: 'Medio', pct: '42%', color: '#f59e0b' },
                  { label: 'Alto', pct: '23%', color: '#ef4444' },
                ].map((z) => (
                  <div key={z.label} className="text-center">
                    <p className="text-2xl font-black" style={{ color: z.color }}>{z.pct}</p>
                    <p className="text-[11px] text-white/35 mt-0.5">{z.label}</p>
                  </div>
                ))}
              </div>
              <div className="h-16 w-1 bg-white/10 rounded-full" />
              <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-2">
                <p className="text-xs text-yellow-400/70 font-medium">Riesgo global</p>
                <p className="text-xl font-black text-yellow-400">MEDIO</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center py-8 space-y-6">
          <p className="text-white/30 text-sm uppercase tracking-widest font-semibold">
            Plataforma lista para demostración
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={startDemo}
              className="flex items-center gap-2.5 rounded-2xl bg-indigo-600 px-10 py-4 text-lg font-bold text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5"
            >
              Iniciar demostración
              <ArrowRight className="h-5 w-5" />
            </button>
            <Link
              href="/demo"
              className="flex items-center gap-2 rounded-2xl border border-white/20 px-10 py-4 text-base font-semibold text-white/70 hover:bg-white/10 hover:text-white transition-all"
            >
              Explorar módulos
            </Link>
          </div>
          <p className="text-white/20 text-xs">
            Sin registro · Sin tarjeta de crédito · Datos simulados de SIGCYA Consulting S.A.S.
          </p>
        </div>
      </div>
    </div>
  )
}
