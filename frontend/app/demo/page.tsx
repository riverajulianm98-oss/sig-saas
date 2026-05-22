'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  BarChart2, FileText, ClipboardCheck, AlertTriangle,
  TrendingUp, Download, CheckSquare, ArrowRight, ChevronLeft,
} from 'lucide-react'
import { SIGLogo } from '@/components/brand/logo'
import { useAuthStore } from '@/store/auth.store'
import { DEMO_USER, DEMO_TENANT, DEMO_TOKEN, DEMO_REFRESH } from '@/lib/demo-data'
import { TOKEN_KEYS } from '@/lib/constants'

const MODULES = [
  {
    icon: BarChart2,
    label: 'Dashboard',
    subtitle: 'Resumen ejecutivo',
    desc: 'KPIs de compliance, hallazgos críticos, auditorías activas y mapa de riesgo global en tiempo real.',
    href: '/dashboard',
    metric: '87% compliance',
    color: '#6366f1',
    bg: 'from-indigo-500/10 to-indigo-500/5',
    border: 'border-indigo-200',
  },
  {
    icon: FileText,
    label: 'Documentos',
    subtitle: 'Control documental',
    desc: 'Gestión de procedimientos, formatos, instructivos y políticas con versionado y flujo de aprobación.',
    href: '/documents',
    metric: '15 documentos',
    color: '#8b5cf6',
    bg: 'from-purple-500/10 to-purple-500/5',
    border: 'border-purple-200',
  },
  {
    icon: ClipboardCheck,
    label: 'Auditorías',
    subtitle: 'Planificación y ejecución',
    desc: 'Auditorías ISO 9001, 14001 y 45001 con checklists interactivos, evidencias y sugerencias IA.',
    href: '/audits',
    metric: '8 auditorías activas',
    color: '#3b82f6',
    bg: 'from-blue-500/10 to-blue-500/5',
    border: 'border-blue-200',
  },
  {
    icon: AlertTriangle,
    label: 'Hallazgos',
    subtitle: 'No conformidades',
    desc: 'Registro y seguimiento de hallazgos con causa raíz (6M), evidencias y pipeline CAPA integrado.',
    href: '/findings',
    metric: '10 abiertos',
    color: '#f59e0b',
    bg: 'from-amber-500/10 to-amber-500/5',
    border: 'border-amber-200',
  },
  {
    icon: CheckSquare,
    label: 'CAPA',
    subtitle: 'Acciones correctivas',
    desc: 'Kanban de acciones correctivas con estados, responsables, vencimientos y control de eficacia.',
    href: '/capa',
    metric: '15 acciones',
    color: '#10b981',
    bg: 'from-emerald-500/10 to-emerald-500/5',
    border: 'border-emerald-200',
  },
  {
    icon: TrendingUp,
    label: 'Analytics',
    subtitle: 'Centro ejecutivo',
    desc: 'Tendencias 12 meses, mapa de calor por proceso, cumplimiento ISO por cláusula y gauge de riesgo.',
    href: '/analytics',
    metric: 'Riesgo: MEDIO',
    color: '#06b6d4',
    bg: 'from-cyan-500/10 to-cyan-500/5',
    border: 'border-cyan-200',
  },
  {
    icon: Download,
    label: 'Reportes',
    subtitle: 'Generador de informes',
    desc: 'Genera reportes ejecutivos en PDF, Excel o CSV con selección de módulos, procesos y fechas.',
    href: '/reports',
    metric: 'PDF · Excel · CSV',
    color: '#ec4899',
    bg: 'from-pink-500/10 to-pink-500/5',
    border: 'border-pink-200',
  },
]

export default function DemoPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()

  const enterModule = (href: string) => {
    if (isAuthenticated) {
      router.push(href)
      return
    }
    const { setAuth } = useAuthStore.getState()
    localStorage.setItem(TOKEN_KEYS.access, DEMO_TOKEN)
    localStorage.setItem(TOKEN_KEYS.refresh, DEMO_REFRESH)
    localStorage.setItem(TOKEN_KEYS.tenantId, DEMO_TENANT.id)
    setAuth(DEMO_USER, DEMO_TENANT, { access: DEMO_TOKEN, refresh: DEMO_REFRESH })
    router.push(href)
  }

  return (
    <div className="min-h-screen bg-[#080c14] text-white">

      {/* Nav */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 lg:px-12">
        <SIGLogo dark size={30} />
        <div className="flex items-center gap-3">
          <Link href="/landing" className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white/80 transition-colors">
            <ChevronLeft className="h-4 w-4" />
            Volver
          </Link>
          <Link href="/showcase" className="rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-white/80 hover:bg-white/10 transition-all">
            Showcase
          </Link>
        </div>
      </div>

      {/* Hero text */}
      <div className="px-6 pt-14 pb-10 text-center lg:px-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-400 mb-6">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
          Demo activa · SIGCYA Consulting S.A.S.
        </div>
        <h1 className="text-4xl font-black tracking-tight lg:text-5xl">
          Elige por dónde empezar
        </h1>
        <p className="text-white/50 mt-3 text-lg max-w-xl mx-auto">
          Explora cualquier módulo de la plataforma con datos reales de demostración.
        </p>
      </div>

      {/* Module grid */}
      <div className="px-6 pb-16 lg:px-12">
        <div className="grid gap-4 max-w-6xl mx-auto sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {MODULES.map((m) => (
            <div
              key={m.href}
              className={`group relative flex flex-col rounded-2xl border bg-gradient-to-br p-6 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-xl ${m.bg} ${m.border}`}
              onClick={() => enterModule(m.href)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && enterModule(m.href)}
            >
              {/* Icon */}
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl mb-4"
                style={{ background: m.color + '25', border: `1.5px solid ${m.color}40` }}
              >
                <m.icon className="h-5.5 w-5.5 h-[22px] w-[22px]" style={{ color: m.color }} />
              </div>

              {/* Labels */}
              <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: m.color }}>
                {m.subtitle}
              </p>
              <p className="text-lg font-black text-white mb-2">{m.label}</p>
              <p className="text-sm text-white/50 leading-relaxed flex-1">{m.desc}</p>

              {/* Metric pill */}
              <div className="mt-4 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                style={{ background: m.color + '20', color: m.color }}>
                {m.metric}
              </div>

              {/* Enter button */}
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-white/30 group-hover:text-white/60 transition-colors">Explorar</span>
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-full transition-all group-hover:scale-110"
                  style={{ background: m.color }}
                >
                  <ArrowRight className="h-3.5 w-3.5 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer note */}
      <div className="text-center pb-10 text-xs text-white/25">
        Datos simulados · SIGCYA Consulting S.A.S. · Plataforma de demostración
      </div>
    </div>
  )
}
