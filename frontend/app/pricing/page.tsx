'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, X, ArrowRight, Shield, Zap, Star, Building2, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PLANS, getMonthlyEquivalent } from '@/modules/billing/services/billing.service'
import { PlanId, BillingCycle, PlanDef } from '@/modules/billing/types'
import { SIGLogo } from '@/components/brand/logo'

// ── Feature comparison table ──────────────────────────────────────────────────

const COMPARISON_ROWS = [
  { label: 'Usuarios', values: ['5', '25', 'Ilimitados'] },
  { label: 'Documentos', values: ['200', '2.000', 'Ilimitados'] },
  { label: 'Almacenamiento', values: ['2 GB', '20 GB', '200 GB'] },
  { label: 'Automatizaciones', values: ['3', '20', 'Ilimitadas'] },
  { label: 'Reportes / mes', values: ['5', '50', 'Ilimitados'] },
  { label: 'Auditorías ISO 9001', values: [true, true, true] },
  { label: 'ISO 14001 / 45001', values: [false, true, true] },
  { label: 'Hallazgos y CAPA', values: [true, true, true] },
  { label: 'Analytics avanzado', values: [false, true, true] },
  { label: 'API REST', values: [false, true, true] },
  { label: 'SSO / LDAP', values: [false, false, true] },
  { label: 'Custom branding', values: [false, false, true] },
  { label: 'Soporte', values: ['Email', 'Prioritario', '24/7 Dedicado'] },
  { label: 'SLA garantizado', values: [false, false, true] },
]

const FAQ = [
  {
    q: '¿Puedo cambiar de plan en cualquier momento?',
    a: 'Sí. Puedes hacer upgrade o downgrade desde la configuración de facturación. Los cambios se aplican en el siguiente ciclo de facturación.',
  },
  {
    q: '¿Hay periodo de prueba gratuito?',
    a: 'Todos los planes incluyen 14 días de prueba gratuita, sin tarjeta de crédito requerida.',
  },
  {
    q: '¿Qué pasa si supero los límites?',
    a: 'Recibirás alertas al alcanzar el 80% del límite. Si los superas, se te notificará para hacer upgrade. No cortamos el servicio abruptamente.',
  },
  {
    q: '¿Puedo cancelar en cualquier momento?',
    a: 'Sí. Sin permanencia mínima. Si cancelas, conservas acceso hasta el final del período pagado.',
  },
  {
    q: '¿Los precios incluyen IVA?',
    a: 'Los precios están en USD y no incluyen impuestos locales. Para Colombia se aplicará el IVA vigente.',
  },
]

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-gray-200">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-medium text-gray-900 hover:text-gray-700"
      >
        {q}
        <ChevronDown className={cn('h-4 w-4 shrink-0 text-gray-400 transition-transform', open && 'rotate-180')} />
      </button>
      {open && <p className="pb-4 text-sm text-gray-600">{a}</p>}
    </div>
  )
}

function PlanCard({ plan, cycle, onSelect }: { plan: PlanDef; cycle: BillingCycle; onSelect: () => void }) {
  const monthly = getMonthlyEquivalent(plan, cycle)
  const savings = cycle === 'annual' ? Math.round((1 - plan.priceAnnual / (plan.priceMonthly * 12)) * 100) : 0

  return (
    <div
      className={cn(
        'relative flex flex-col rounded-2xl border-2 p-7 transition-shadow hover:shadow-lg',
        plan.highlighted
          ? 'border-indigo-600 bg-indigo-50'
          : 'border-gray-200 bg-white'
      )}
    >
      {plan.highlighted && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="flex items-center gap-1.5 rounded-full bg-indigo-600 px-4 py-1 text-xs font-bold text-white">
            <Star className="h-3 w-3" /> Más popular
          </span>
        </div>
      )}

      <div className="mb-5">
        <h2 className="text-lg font-bold text-gray-900">{plan.name}</h2>
        <p className="mt-1 text-sm text-gray-500">{plan.tagline}</p>
        <div className="mt-4 flex items-end gap-1">
          <span className="text-4xl font-extrabold text-gray-900">${monthly}</span>
          <span className="mb-1 text-sm text-gray-500">/mes</span>
        </div>
        {cycle === 'annual' && (
          <p className="mt-1 text-xs text-indigo-600 font-medium">
            ${plan.priceAnnual}/año · Ahorra {savings}%
          </p>
        )}
      </div>

      <button
        onClick={onSelect}
        className={cn(
          'mb-6 w-full rounded-xl py-3 text-sm font-semibold transition-all',
          plan.highlighted
            ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200'
            : 'border border-gray-300 bg-white text-gray-900 hover:bg-gray-50'
        )}
      >
        Comenzar gratis 14 días
      </button>

      <ul className="space-y-2.5 flex-1">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm text-gray-700">
            <Check className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
            {f}
          </li>
        ))}
        {plan.notIncluded?.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm text-gray-400">
            <X className="h-4 w-4 shrink-0 text-gray-300 mt-0.5" />
            {f}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function PricingPage() {
  const [cycle, setCycle] = useState<BillingCycle>('monthly')

  function handleSelect(planId: PlanId) {
    window.location.href = `/checkout?plan=${planId}&cycle=${cycle}`
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Navbar */}
      <nav className="flex h-14 items-center justify-between border-b border-gray-100 px-6 sticky top-0 bg-white/90 backdrop-blur z-10">
        <Link href="/landing">
          <SIGLogo size={28} variant="full" />
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/landing" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            Producto
          </Link>
          <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            Iniciar sesión
          </Link>
          <Link
            href="/checkout"
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
          >
            Comenzar gratis
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-b from-indigo-50 to-white py-16 text-center px-6">
        <div className="mx-auto max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-1.5 text-xs font-semibold text-indigo-700">
            <Zap className="h-3.5 w-3.5" /> 14 días gratis · Sin tarjeta · Cancela cuando quieras
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            Precios transparentes para<br className="hidden sm:block" /> cada etapa de crecimiento
          </h1>
          <p className="mt-4 text-lg text-gray-500">
            Desde la primera auditoría ISO hasta la gestión de decenas de sedes.
          </p>

          {/* Billing cycle toggle */}
          <div className="mt-8 inline-flex items-center gap-3 rounded-xl bg-gray-100 p-1">
            <button
              onClick={() => setCycle('monthly')}
              className={cn(
                'rounded-lg px-5 py-2 text-sm font-semibold transition-all',
                cycle === 'monthly' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              )}
            >
              Mensual
            </button>
            <button
              onClick={() => setCycle('annual')}
              className={cn(
                'flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold transition-all',
                cycle === 'annual' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              )}
            >
              Anual
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                -20%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Plan cards */}
      <section className="mx-auto max-w-6xl px-6 pb-16 -mt-4">
        <div className="grid gap-6 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              cycle={cycle}
              onSelect={() => handleSelect(plan.id)}
            />
          ))}
        </div>
      </section>

      {/* Trust indicators */}
      <section className="border-y border-gray-100 bg-gray-50 py-10">
        <div className="mx-auto max-w-4xl px-6">
          <div className="grid grid-cols-2 gap-8 text-center sm:grid-cols-4">
            {[
              { icon: Shield, label: 'ISO 27001 compliance', sub: 'Datos protegidos' },
              { icon: Building2, label: '+50 empresas', sub: 'En producción' },
              { icon: Zap, label: '99.9% uptime', sub: 'SLA garantizado' },
              { icon: Star, label: 'Soporte en español', sub: 'Equipo local' },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label}>
                <Icon className="mx-auto mb-2 h-6 w-6 text-indigo-600" />
                <p className="text-sm font-semibold text-gray-900">{label}</p>
                <p className="text-xs text-gray-500">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="mb-8 text-center text-2xl font-bold text-gray-900">
          Comparación de planes
        </h2>
        <div className="overflow-hidden rounded-2xl border border-gray-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-4 text-left font-semibold text-gray-700">Funcionalidad</th>
                {PLANS.map((p) => (
                  <th key={p.id} className={cn('px-4 py-4 text-center font-bold', p.highlighted && 'text-indigo-700')}>
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {COMPARISON_ROWS.map((row) => (
                <tr key={row.label} className="hover:bg-gray-50/50">
                  <td className="px-6 py-3 text-gray-600">{row.label}</td>
                  {row.values.map((val, i) => (
                    <td key={i} className="px-4 py-3 text-center">
                      {typeof val === 'boolean' ? (
                        val
                          ? <Check className="mx-auto h-4 w-4 text-emerald-500" />
                          : <X className="mx-auto h-4 w-4 text-gray-300" />
                      ) : (
                        <span className={cn('text-sm font-medium', PLANS[i]?.highlighted && 'text-indigo-700')}>{val}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-gray-200 bg-gray-50">
                <td className="px-6 py-4" />
                {PLANS.map((p) => (
                  <td key={p.id} className="px-4 py-4 text-center">
                    <button
                      onClick={() => handleSelect(p.id)}
                      className={cn(
                        'w-full rounded-lg py-2 text-sm font-semibold transition-colors',
                        p.highlighted
                          ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
                      )}
                    >
                      Elegir {p.name}
                    </button>
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-2xl px-6 pb-16">
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-900">Preguntas frecuentes</h2>
        <div className="divide-y divide-gray-200">
          {FAQ.map((item) => <FaqItem key={item.q} {...item} />)}
        </div>
      </section>

      {/* CTA Footer */}
      <section className="border-t border-gray-100 bg-indigo-600 py-14 text-center text-white">
        <h2 className="text-2xl font-bold">¿Listo para transformar tu gestión ISO?</h2>
        <p className="mt-2 text-indigo-200">14 días gratis. Sin tarjeta. Sin permanencia.</p>
        <Link
          href="/checkout?plan=professional"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3 text-sm font-bold text-indigo-600 hover:bg-indigo-50 transition-colors"
        >
          Comenzar gratis <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      <footer className="border-t border-gray-100 px-6 py-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <SIGLogo size={22} variant="full" />
          <p className="text-xs text-gray-400">© 2026 SIG CYA. Todos los derechos reservados.</p>
          <div className="flex gap-4 text-xs text-gray-400">
            <Link href="#" className="hover:text-gray-600">Privacidad</Link>
            <Link href="#" className="hover:text-gray-600">Términos</Link>
            <Link href="#" className="hover:text-gray-600">Soporte</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
