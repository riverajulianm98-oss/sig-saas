'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowRight, CheckCircle2, Sparkles, BarChart2, FileText,
  ClipboardCheck, AlertTriangle, TrendingUp, Download, CheckSquare,
  Shield, Users, Zap, Globe,
} from 'lucide-react'
import { SIGLogo } from '@/components/brand/logo'
import { useAuthStore } from '@/store/auth.store'
import { DEMO_USER, DEMO_TENANT, DEMO_TOKEN, DEMO_REFRESH } from '@/lib/demo-data'
import { TOKEN_KEYS } from '@/lib/constants'

const MODULES = [
  { icon: BarChart2,    label: 'Dashboard ejecutivo',  desc: 'KPIs, compliance, riesgo global en tiempo real', color: '#6366f1' },
  { icon: FileText,     label: 'Control documental',   desc: 'Versionado, flujo de aprobación, alertas de vencimiento', color: '#8b5cf6' },
  { icon: ClipboardCheck, label: 'Auditorías ISO',     desc: 'Planifica y ejecuta auditorías 9001, 14001, 45001', color: '#3b82f6' },
  { icon: AlertTriangle, label: 'Hallazgos',           desc: 'Registro, clasificación y seguimiento de no conformidades', color: '#f59e0b' },
  { icon: CheckSquare,  label: 'CAPA',                 desc: 'Acciones correctivas con Kanban y control de vencimiento', color: '#10b981' },
  { icon: TrendingUp,   label: 'Analytics',            desc: 'Mapa de calor, tendencias 12 meses, gauge de riesgo', color: '#06b6d4' },
  { icon: Download,     label: 'Reportes',             desc: 'Genera informes ejecutivos en PDF, Excel y CSV', color: '#ec4899' },
]

const PROBLEMS = [
  {
    icon: '📊',
    problem: 'Gestión dispersa en Excel y correos',
    solution: 'Todo centralizado: documentos, auditorías, hallazgos y CAPA en una sola plataforma.',
  },
  {
    icon: '🔍',
    problem: 'Hallazgos sin trazabilidad ni cierre',
    solution: 'Desde la auditoría hasta el cierre del hallazgo y la verificación de la acción correctiva.',
  },
  {
    icon: '📈',
    problem: 'Compliance invisible para la dirección',
    solution: 'Dashboard ejecutivo con score en tiempo real, exportable en un clic para comités directivos.',
  },
]

const BENEFITS = [
  'Certificación ISO más rápida con checklists automatizados',
  'IA detecta no conformidades en el checklist de auditoría',
  'Trazabilidad completa: hallazgo → CAPA → cierre → verificación',
  'Control documental con flujo de aprobación y alertas de vencimiento',
  'Dashboard ejecutivo listo para presentar a dirección',
  'Reportes en PDF y Excel generados en segundos',
]

function DashboardMockup() {
  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 shadow-2xl ring-1 ring-gray-900/5">
      {/* Browser chrome */}
      <div className="flex items-center gap-2.5 px-4 py-2.5 bg-gray-100 border-b border-gray-200">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <div className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <div className="h-3 w-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex-1 bg-white rounded-md px-3 py-1 text-[11px] text-gray-400 text-center font-mono">
          app.sigcya.com/dashboard
        </div>
        <div className="w-6" />
      </div>

      {/* App UI */}
      <div className="flex bg-gray-50" style={{ height: 280 }}>
        {/* Sidebar */}
        <div className="w-14 bg-white border-r border-gray-100 flex flex-col items-center pt-4 pb-4 gap-3 shrink-0">
          <div className="h-7 w-7 rounded-lg bg-indigo-500" />
          <div className="mt-2 space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className={`h-4.5 w-9 h-[18px] w-[36px] rounded-md mx-auto ${i === 0 ? 'bg-indigo-100' : 'bg-gray-100'}`} />
            ))}
          </div>
        </div>

        {/* Main */}
        <div className="flex-1 p-4 space-y-3 overflow-hidden">
          {/* Header bar */}
          <div className="flex items-center justify-between mb-1">
            <div className="h-3 w-40 bg-gray-200 rounded-full" />
            <div className="flex gap-1.5">
              <div className="h-5 w-14 bg-indigo-100 rounded-md" />
              <div className="h-5 w-14 bg-gray-100 rounded-md" />
            </div>
          </div>

          {/* KPI cards */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { v: '87%', l: 'Compliance', c: '#6366f1', bg: '#eef2ff' },
              { v: '10', l: 'Hallazgos', c: '#ef4444', bg: '#fef2f2' },
              { v: '5', l: 'CAPA venc.', c: '#f59e0b', bg: '#fffbeb' },
              { v: '3', l: 'Auditorías', c: '#3b82f6', bg: '#eff6ff' },
            ].map((kpi, i) => (
              <div key={i} className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm">
                <div className="text-xl font-black" style={{ color: kpi.c }}>{kpi.v}</div>
                <div className="text-[9px] text-gray-400 mt-0.5 font-medium">{kpi.l}</div>
              </div>
            ))}
          </div>

          {/* Bottom row */}
          <div className="grid grid-cols-3 gap-2">
            {/* Chart */}
            <div className="col-span-2 bg-white rounded-lg p-3 border border-gray-100 shadow-sm">
              <div className="h-2 w-28 bg-gray-100 rounded-full mb-3" />
              <div className="flex items-end gap-1" style={{ height: 64 }}>
                {[55, 68, 60, 75, 72, 83, 87].map((h, i) => (
                  <div key={i} className="flex-1 rounded-sm transition-all"
                    style={{ height: `${h}%`, background: i === 6 ? '#6366f1' : i >= 4 ? '#a5b4fc' : '#e0e7ff' }} />
                ))}
              </div>
            </div>

            {/* Process bars */}
            <div className="bg-white rounded-lg p-3 border border-gray-100 shadow-sm space-y-2">
              <div className="h-2 w-16 bg-gray-100 rounded-full mb-3" />
              {[
                { l: 'Calidad', p: 87, c: '#10b981' },
                { l: 'HSEQ', p: 72, c: '#f59e0b' },
                { l: 'Producción', p: 54, c: '#ef4444' },
              ].map((row, i) => (
                <div key={i} className="space-y-0.5">
                  <div className="flex justify-between" style={{ fontSize: 8, color: '#94a3b8' }}>
                    <span>{row.l}</span><span>{row.p}%</span>
                  </div>
                  <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${row.p}%`, background: row.c }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Alert strip */}
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-2 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              <div className="h-2 w-2 rounded-full bg-red-500" />
              <div className="h-2 flex-1 bg-red-100 rounded-full" />
            </div>
            <div className="flex-1 flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
              <div className="h-2 w-2 rounded-full bg-amber-500" />
              <div className="h-2 flex-1 bg-amber-100 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

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
    <div className="min-h-screen bg-white text-gray-900 font-sans">

      {/* ── Sticky nav ── */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 border-b border-gray-100 bg-white/80 backdrop-blur-md lg:px-12">
        <SIGLogo size={30} />
        <div className="hidden sm:flex items-center gap-8 text-sm font-medium text-gray-500">
          <a href="#modules" className="hover:text-gray-900 transition-colors">Módulos</a>
          <a href="#benefits" className="hover:text-gray-900 transition-colors">Beneficios</a>
          <a href="#demo" className="hover:text-gray-900 transition-colors">Demo</a>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            Iniciar sesión
          </Link>
          <button
            onClick={isAuthenticated ? () => router.push('/dashboard') : enterDemo}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-all shadow-sm"
          >
            Ver demo <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden px-6 pt-20 pb-24 text-center lg:px-12 lg:pt-28">
        {/* Background gradient */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-indigo-50/60 via-white to-white" />
        <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-64 w-[600px] rounded-full bg-indigo-400/10 blur-3xl" />

        <div className="relative max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-xs font-semibold text-indigo-700 mb-8">
            <Sparkles className="h-3 w-3" />
            ISO 9001 · 14001 · 45001 · HSEQ — Enterprise Platform
          </div>

          <h1 className="text-5xl font-black tracking-tight leading-[1.1] lg:text-6xl">
            La plataforma que tu{' '}
            <span className="text-indigo-600">SIG merece</span>
          </h1>

          <p className="mt-6 text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Auditorías, documentos, hallazgos y CAPA en un solo lugar.
            Con inteligencia artificial que detecta no conformidades antes de que se conviertan en problemas.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <button
              onClick={isAuthenticated ? () => router.push('/dashboard') : enterDemo}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-4 text-base font-bold text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5"
            >
              Explorar demo gratis
              <ArrowRight className="h-4 w-4" />
            </button>
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-8 py-4 text-base font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
            >
              Iniciar sesión
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-sm text-gray-400">
            {['ISO 9001', 'ISO 14001', 'ISO 45001'].map((std) => (
              <div key={std} className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>{std}</span>
              </div>
            ))}
            <div className="flex items-center gap-1.5">
              <Shield className="h-4 w-4 text-indigo-500" />
              <span>Multi-tenant · RBAC</span>
            </div>
          </div>

          {/* Product mockup */}
          <div className="mt-16 mx-auto max-w-3xl">
            <DashboardMockup />
          </div>
        </div>
      </section>

      {/* ── Problems section ── */}
      <section className="px-6 py-20 bg-gray-50 lg:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black">¿Qué resuelve SIGCYA?</h2>
            <p className="text-gray-500 mt-3">Los tres problemas más comunes en la gestión ISO — resueltos</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {PROBLEMS.map((p, i) => (
              <div key={i} className="relative rounded-2xl bg-white border border-gray-100 p-7 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-3xl mb-4">{p.icon}</div>
                <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2 line-through">
                  {p.problem}
                </p>
                <p className="text-base font-medium text-gray-700 leading-relaxed">{p.solution}</p>
                <div className="absolute -top-3 -right-3 h-6 w-6 rounded-full bg-emerald-500 flex items-center justify-center">
                  <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Modules section ── */}
      <section id="modules" className="px-6 py-20 lg:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black">Todo lo que necesitas</h2>
            <p className="text-gray-500 mt-3">7 módulos integrados, un solo sistema</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {MODULES.map((m, i) => (
              <div
                key={i}
                className="group relative rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-default"
              >
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl mb-4"
                  style={{ background: m.color + '1a' }}
                >
                  <m.icon className="h-5 w-5" style={{ color: m.color }} />
                </div>
                <p className="font-bold text-gray-900 mb-1">{m.label}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{m.desc}</p>
              </div>
            ))}

            {/* Enterprise card */}
            <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 p-6 shadow-lg shadow-indigo-500/20 text-white">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 mb-4">
                <Users className="h-5 w-5 text-white" />
              </div>
              <p className="font-bold mb-1">Enterprise</p>
              <p className="text-sm text-indigo-100 leading-relaxed">Multi-empresa, RBAC granular, auditoría de acciones</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Benefits ── */}
      <section id="benefits" className="px-6 py-20 bg-gray-50 lg:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <h2 className="text-3xl font-black mb-4">Resultados desde el primer mes</h2>
              <p className="text-gray-500 mb-8 leading-relaxed">
                Diseñado para equipos SIG en empresas con certificación activa o en proceso.
                Funciona desde el día uno, sin configuración compleja.
              </p>
              <ul className="space-y-3">
                {BENEFITS.map((b, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100">
                      <CheckCircle2 className="h-3 w-3 text-indigo-600" />
                    </div>
                    <span className="text-sm text-gray-700">{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { v: '87%', l: 'Score de compliance', s: 'promedio en clientes activos', c: '#6366f1' },
                { v: '-60%', l: 'Tiempo en hallazgos', s: 'desde apertura hasta cierre', c: '#10b981' },
                { v: '100%', l: 'Trazabilidad', s: 'en toda la cadena SIG', c: '#3b82f6' },
                { v: '15s', l: 'Para generar un reporte', s: 'ejecutivo completo', c: '#f59e0b' },
              ].map((stat, i) => (
                <div key={i} className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm">
                  <div className="text-3xl font-black mb-1" style={{ color: stat.c }}>{stat.v}</div>
                  <div className="text-sm font-semibold text-gray-700">{stat.l}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{stat.s}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section id="demo" className="px-6 py-24 lg:px-12">
        <div className="max-w-3xl mx-auto text-center">
          <div className="rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 px-10 py-14 shadow-2xl shadow-indigo-500/25 text-white">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 border border-white/20 px-4 py-1.5 text-xs font-semibold mb-8">
              <Zap className="h-3 w-3" />
              Demo lista · Sin registro requerido
            </div>
            <h2 className="text-4xl font-black mb-4 leading-tight">
              Mira cómo funciona
              <br />en tiempo real
            </h2>
            <p className="text-indigo-100 mb-10 text-lg max-w-md mx-auto leading-relaxed">
              Explora la plataforma completa con datos reales de SIGCYA Consulting S.A.S.
              Sin tarjeta de crédito, sin instalación.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={isAuthenticated ? () => router.push('/dashboard') : enterDemo}
                className="flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-bold text-indigo-700 hover:bg-indigo-50 transition-all shadow-lg"
              >
                Entrar a la demo
                <ArrowRight className="h-4 w-4" />
              </button>
              <Link
                href="/showcase"
                className="flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-8 py-4 text-base font-semibold text-white hover:bg-white/20 transition-all"
              >
                Ver showcase
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 px-6 py-6 lg:px-12">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <SIGLogo size={24} />
          <div className="flex items-center gap-6 text-xs text-gray-400">
            <div className="flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5" />
              Hecho para equipos SIG en LATAM
            </div>
            <span>© {new Date().getFullYear()} SIGCYA</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <Link href="/login" className="hover:text-gray-600 transition-colors">Iniciar sesión</Link>
            <Link href="/demo" className="hover:text-gray-600 transition-colors">Demo</Link>
            <Link href="/showcase" className="hover:text-gray-600 transition-colors">Showcase</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
