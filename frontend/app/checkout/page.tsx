'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Check, ChevronRight, CreditCard, Building2, Shield, Zap, ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PLANS, getMonthlyEquivalent, BillingService } from '@/modules/billing/services/billing.service'
import { PlanId, BillingCycle, CheckoutState } from '@/modules/billing/types'
import { SIGLogo } from '@/components/brand/logo'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/store/auth.store'
import { TOKEN_KEYS } from '@/lib/constants'

const STEPS = ['Plan', 'Empresa', 'Pago', 'Listo']

const INDUSTRIES = [
  'Manufactura', 'Construcción', 'Alimentos y Bebidas', 'Salud y Farmacia',
  'Minería', 'Petróleo y Gas', 'Servicios', 'Tecnología', 'Logística y Transporte', 'Otro',
]

const COUNTRIES = [
  'Colombia', 'México', 'Argentina', 'Chile', 'Perú', 'Ecuador', 'Venezuela',
  'Brasil', 'Bolivia', 'Uruguay', 'Paraguay', 'Costa Rica', 'Panamá', 'Otro',
]

function StepIndicator({ current, steps }: { current: number; steps: string[] }) {
  return (
    <div className="flex items-center gap-0">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center">
          <div className="flex flex-col items-center gap-1">
            <div className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all',
              i < current ? 'bg-indigo-600 text-white' :
              i === current ? 'bg-indigo-600 text-white ring-4 ring-indigo-100' :
              'bg-gray-100 text-gray-400'
            )}>
              {i < current ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span className={cn('text-[10px] font-medium', i === current ? 'text-indigo-600' : 'text-gray-400')}>
              {s}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={cn('mb-4 h-px w-16 sm:w-24', i < current ? 'bg-indigo-600' : 'bg-gray-200')} />
          )}
        </div>
      ))}
    </div>
  )
}

function PlanBadge({ planId }: { planId: PlanId }) {
  const plan = PLANS.find((p) => p.id === planId)
  if (!plan) return null
  return (
    <span className={cn(
      'rounded-full px-2 py-0.5 text-[11px] font-bold',
      planId === 'professional' ? 'bg-indigo-100 text-indigo-700' :
      planId === 'enterprise' ? 'bg-violet-100 text-violet-700' :
      'bg-gray-100 text-gray-600'
    )}>
      {plan.name}
    </span>
  )
}

// ── Step 1: Plan selection ────────────────────────────────────────────────────

function StepPlan({
  state, setState, onNext,
}: { state: CheckoutState; setState: (s: CheckoutState) => void; onNext: () => void }) {
  const plan = PLANS.find((p) => p.id === state.planId)!
  const monthly = getMonthlyEquivalent(plan, state.billingCycle)
  const annualTotal = plan.priceAnnual
  const savings = Math.round((1 - plan.priceAnnual / (plan.priceMonthly * 12)) * 100)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Confirma tu plan</h2>
        <p className="mt-1 text-sm text-gray-500">Puedes cambiar o cancelar en cualquier momento.</p>
      </div>

      {/* Plan cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        {PLANS.map((p) => {
          const m = getMonthlyEquivalent(p, state.billingCycle)
          const selected = state.planId === p.id
          return (
            <button
              key={p.id}
              onClick={() => setState({ ...state, planId: p.id })}
              className={cn(
                'relative rounded-xl border-2 p-4 text-left transition-all',
                selected ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 bg-white hover:border-gray-300'
              )}
            >
              {p.highlighted && (
                <span className="absolute -top-2.5 right-3 rounded-full bg-indigo-600 px-2 py-0.5 text-[9px] font-bold text-white">
                  Popular
                </span>
              )}
              <p className="text-sm font-bold text-gray-900">{p.name}</p>
              <p className="mt-1 text-xl font-extrabold text-gray-900">${m}<span className="text-xs font-normal text-gray-500">/mo</span></p>
              {selected && <Check className="absolute right-3 bottom-3 h-4 w-4 text-indigo-600" />}
            </button>
          )
        })}
      </div>

      {/* Billing cycle */}
      <div className="rounded-xl border border-gray-200 p-4">
        <p className="mb-3 text-sm font-semibold text-gray-700">Ciclo de facturación</p>
        <div className="flex gap-3">
          {(['monthly', 'annual'] as BillingCycle[]).map((c) => (
            <button
              key={c}
              onClick={() => setState({ ...state, billingCycle: c })}
              className={cn(
                'flex-1 rounded-lg border-2 py-2.5 text-sm font-medium transition-all',
                state.billingCycle === c ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
              )}
            >
              {c === 'monthly' ? 'Mensual' : (
                <span className="flex items-center justify-center gap-2">
                  Anual
                  <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">-{savings}%</span>
                </span>
              )}
            </button>
          ))}
        </div>
        {state.billingCycle === 'annual' && (
          <p className="mt-2 text-xs text-emerald-600 font-medium">
            ${monthly}/mes · Total anual ${annualTotal} USD
          </p>
        )}
      </div>

      {/* Summary */}
      <div className="rounded-xl bg-gray-50 p-4 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>{plan.name} · {state.billingCycle === 'annual' ? 'Anual' : 'Mensual'}</span>
          <span className="font-semibold text-gray-900">${state.billingCycle === 'annual' ? annualTotal : plan.priceMonthly} USD</span>
        </div>
        <div className="mt-1 flex justify-between text-gray-500">
          <span>Prueba gratuita (14 días)</span>
          <span className="text-emerald-600 font-medium">Incluida</span>
        </div>
        <div className="mt-3 flex justify-between border-t border-gray-200 pt-3 font-semibold text-gray-900">
          <span>Cobro hoy</span>
          <span>$0.00 USD</span>
        </div>
        <p className="mt-2 text-xs text-gray-400">
          El primer cobro es en 14 días. Cancela antes sin costo.
        </p>
      </div>

      <button
        onClick={onNext}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white hover:bg-indigo-700 transition-colors"
      >
        Continuar <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}

// ── Step 2: Company + Admin account ──────────────────────────────────────────

function StepEmpresa({
  state, setState, onNext, onBack,
}: { state: CheckoutState; setState: (s: CheckoutState) => void; onNext: () => void; onBack: () => void }) {
  const [showPass, setShowPass] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutState, string>>>({})

  function validate() {
    const e: typeof errors = {}
    if (!state.companyName.trim()) e.companyName = 'Requerido'
    if (!state.adminName.trim()) e.adminName = 'Requerido'
    if (!state.adminEmail.trim() || !state.adminEmail.includes('@')) e.adminEmail = 'Email inválido'
    if (state.password.length < 8) e.password = 'Mínimo 8 caracteres'
    if (!state.industry) e.industry = 'Selecciona una industria'
    if (!state.country) e.country = 'Selecciona un país'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleNext() {
    if (validate()) onNext()
  }

  function field(
    label: string,
    key: keyof CheckoutState,
    type = 'text',
    placeholder = ''
  ) {
    return (
      <div>
        <label className="mb-1 block text-xs font-semibold text-gray-700">{label}</label>
        <input
          type={type}
          value={state[key] as string}
          onChange={(e) => setState({ ...state, [key]: e.target.value })}
          placeholder={placeholder}
          className={cn(
            'w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors',
            errors[key] ? 'border-red-400 bg-red-50' : 'border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
          )}
        />
        {errors[key] && <p className="mt-1 text-xs text-red-500">{errors[key]}</p>}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Crea tu empresa</h2>
        <p className="mt-1 text-sm text-gray-500">Configurarás el workspace SIG para tu organización.</p>
      </div>

      <div className="space-y-4">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Datos de la empresa</p>
        {field('Nombre de la empresa', 'companyName', 'text', 'Ej. Industrias ABC S.A.S')}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">Industria</label>
            <select
              value={state.industry}
              onChange={(e) => setState({ ...state, industry: e.target.value })}
              className={cn(
                'w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors bg-white',
                errors.industry ? 'border-red-400 bg-red-50' : 'border-gray-300 focus:border-indigo-500'
              )}
            >
              <option value="">Seleccionar...</option>
              {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
            </select>
            {errors.industry && <p className="mt-1 text-xs text-red-500">{errors.industry}</p>}
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">País</label>
            <select
              value={state.country}
              onChange={(e) => setState({ ...state, country: e.target.value })}
              className={cn(
                'w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors bg-white',
                errors.country ? 'border-red-400 bg-red-50' : 'border-gray-300 focus:border-indigo-500'
              )}
            >
              <option value="">Seleccionar...</option>
              {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.country && <p className="mt-1 text-xs text-red-500">{errors.country}</p>}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Cuenta de administrador</p>
        {field('Tu nombre completo', 'adminName', 'text', 'Ej. Juan Pérez')}
        {field('Email corporativo', 'adminEmail', 'email', 'juan@empresa.com')}
        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-700">Contraseña</label>
          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'}
              value={state.password}
              onChange={(e) => setState({ ...state, password: e.target.value })}
              placeholder="Mínimo 8 caracteres"
              className={cn(
                'w-full rounded-lg border px-3 py-2.5 pr-10 text-sm outline-none transition-colors',
                errors.password ? 'border-red-400 bg-red-50' : 'border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
              )}
            />
            <button
              type="button"
              onClick={() => setShowPass((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
        </div>
      </div>

      <p className="text-xs text-gray-400">
        Al continuar aceptas los{' '}
        <Link href="#" className="text-indigo-600 underline">Términos de Servicio</Link>
        {' '}y la{' '}
        <Link href="#" className="text-indigo-600 underline">Política de Privacidad</Link>.
      </p>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" /> Volver
        </button>
        <button
          onClick={handleNext}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white hover:bg-indigo-700 transition-colors"
        >
          Continuar <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

// ── Step 3: Payment ───────────────────────────────────────────────────────────

function StepPago({
  state, setState, onNext, onBack,
}: { state: CheckoutState; setState: (s: CheckoutState) => void; onNext: () => void; onBack: () => void }) {
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({})
  const { setAuth } = useAuthStore()
  const plan = PLANS.find((p) => p.id === state.planId)!
  const monthly = getMonthlyEquivalent(plan, state.billingCycle)

  function formatCardNumber(v: string) {
    return v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
  }
  function formatExpiry(v: string) {
    const d = v.replace(/\D/g, '').slice(0, 4)
    return d.length >= 3 ? `${d.slice(0, 2)}/${d.slice(2)}` : d
  }

  function validate() {
    const e: typeof errors = {}
    const raw = state.cardNumber.replace(/\s/g, '')
    if (raw.length !== 16) e.cardNumber = 'Número inválido'
    if (!state.cardName.trim()) e.cardName = 'Requerido'
    if (!/^\d{2}\/\d{2}$/.test(state.cardExpiry)) e.cardExpiry = 'Formato MM/AA'
    if (!/^\d{3,4}$/.test(state.cardCvc)) e.cardCvc = 'CVC inválido'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handlePay() {
    if (!validate()) return
    setLoading(true)
    setApiError(null)
    try {
      // Register the new company + admin user in the real backend
      const result = await authService.register({
        tenant: { company_name: state.companyName, plan: state.planId },
        admin: {
          email: state.adminEmail,
          password: state.password,
          full_name: state.adminName,
        },
      })

      // Store tokens and auth state
      localStorage.setItem(TOKEN_KEYS.access, result.token.access_token)
      localStorage.setItem(TOKEN_KEYS.refresh, result.token.refresh_token)
      localStorage.setItem(TOKEN_KEYS.tenantId, result.token.tenant_id)

      setAuth(
        result.user,
        result.tenant,
        { access: result.token.access_token, refresh: result.token.refresh_token },
      )

      // Also persist subscription state in localStorage for billing UI
      BillingService.setSubscription({
        id: `sub_${result.tenant.id}`,
        planId: state.planId,
        status: 'trial',
        billingCycle: state.billingCycle,
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 14 * 86400000).toISOString(),
        trialEndsAt: new Date(Date.now() + 14 * 86400000).toISOString(),
        cancelAtPeriodEnd: false,
        lastFour: state.cardNumber.replace(/\s/g, '').slice(-4),
        cardBrand: 'Visa',
      })

      onNext()
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setApiError(typeof detail === 'string' ? detail : 'Error al crear la empresa. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Información de pago</h2>
        <p className="mt-1 text-sm text-gray-500">No se realizará ningún cobro durante los 14 días de prueba.</p>
      </div>

      <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 text-sm text-amber-700">
        <Shield className="h-4 w-4 shrink-0" />
        Datos protegidos con cifrado SSL de 256 bits. No almacenamos tu tarjeta.
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-700">Número de tarjeta</label>
          <div className="relative">
            <input
              type="text"
              value={state.cardNumber}
              onChange={(e) => setState({ ...state, cardNumber: formatCardNumber(e.target.value) })}
              placeholder="0000 0000 0000 0000"
              className={cn(
                'w-full rounded-lg border px-3 py-2.5 pr-10 text-sm font-mono outline-none transition-colors',
                errors.cardNumber ? 'border-red-400 bg-red-50' : 'border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
              )}
            />
            <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          {errors.cardNumber && <p className="mt-1 text-xs text-red-500">{errors.cardNumber}</p>}
          <p className="mt-1 text-xs text-gray-400">Prueba: 4242 4242 4242 4242</p>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-700">Titular de la tarjeta</label>
          <input
            type="text"
            value={state.cardName}
            onChange={(e) => setState({ ...state, cardName: e.target.value })}
            placeholder="Nombre como aparece en la tarjeta"
            className={cn(
              'w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors',
              errors.cardName ? 'border-red-400 bg-red-50' : 'border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
            )}
          />
          {errors.cardName && <p className="mt-1 text-xs text-red-500">{errors.cardName}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">Vencimiento</label>
            <input
              type="text"
              value={state.cardExpiry}
              onChange={(e) => setState({ ...state, cardExpiry: formatExpiry(e.target.value) })}
              placeholder="MM/AA"
              maxLength={5}
              className={cn(
                'w-full rounded-lg border px-3 py-2.5 text-sm font-mono outline-none transition-colors',
                errors.cardExpiry ? 'border-red-400 bg-red-50' : 'border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
              )}
            />
            {errors.cardExpiry && <p className="mt-1 text-xs text-red-500">{errors.cardExpiry}</p>}
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700">CVC</label>
            <input
              type="text"
              value={state.cardCvc}
              onChange={(e) => setState({ ...state, cardCvc: e.target.value.replace(/\D/g, '').slice(0, 4) })}
              placeholder="123"
              maxLength={4}
              className={cn(
                'w-full rounded-lg border px-3 py-2.5 text-sm font-mono outline-none transition-colors',
                errors.cardCvc ? 'border-red-400 bg-red-50' : 'border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
              )}
            />
            {errors.cardCvc && <p className="mt-1 text-xs text-red-500">{errors.cardCvc}</p>}
          </div>
        </div>
      </div>

      {/* Order summary */}
      <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 text-sm space-y-2">
        <div className="flex justify-between text-gray-600">
          <span>{plan.name} · {state.billingCycle === 'annual' ? 'Anual' : 'Mensual'}</span>
          <span className="font-medium">${monthly}/mo</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Prueba gratis 14 días</span>
          <span className="text-emerald-600 font-medium">$0.00</span>
        </div>
        <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-gray-900">
          <span>Cobro hoy</span>
          <span>$0.00 USD</span>
        </div>
      </div>

      {apiError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {apiError}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onBack}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <ArrowLeft className="h-4 w-4" /> Volver
        </button>
        <button
          onClick={handlePay}
          disabled={loading}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white hover:bg-indigo-700 transition-colors disabled:opacity-70"
        >
          {loading ? (
            <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Creando empresa...</>
          ) : (
            <><Shield className="h-4 w-4" /> Activar prueba gratis</>
          )}
        </button>
      </div>
    </div>
  )
}

// ── Step 4: Success ───────────────────────────────────────────────────────────

function StepListo({ state }: { state: CheckoutState }) {
  const router = useRouter()
  const plan = PLANS.find((p) => p.id === state.planId)!

  return (
    <div className="flex flex-col items-center text-center space-y-6">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
        <Check className="h-10 w-10 text-emerald-600" />
      </div>
      <div>
        <h2 className="text-2xl font-extrabold text-gray-900">¡Bienvenido a SIG CYA!</h2>
        <p className="mt-2 text-gray-500">
          Tu workspace ha sido creado. Tienes 14 días de prueba gratuita del plan{' '}
          <span className="font-semibold text-indigo-600">{plan.name}</span>.
        </p>
      </div>

      <div className="w-full rounded-2xl border border-gray-200 p-5 text-left space-y-3">
        <p className="text-sm font-bold text-gray-700">Resumen de tu cuenta</p>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Empresa</span>
            <span className="font-medium text-gray-900">{state.companyName || 'Mi empresa'}</span>
          </div>
          <div className="flex justify-between">
            <span>Administrador</span>
            <span className="font-medium text-gray-900">{state.adminEmail}</span>
          </div>
          <div className="flex justify-between">
            <span>Plan</span>
            <span className="font-medium text-indigo-700">{plan.name}</span>
          </div>
          <div className="flex justify-between">
            <span>Prueba gratuita hasta</span>
            <span className="font-medium text-gray-900">
              {new Date(Date.now() + 14 * 86400000).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      <div className="grid w-full gap-3 sm:grid-cols-3 text-sm">
        {[
          { icon: Building2, title: 'Gestión documental', desc: 'Empieza cargando documentos ISO' },
          { icon: Zap, title: 'Automatizaciones', desc: 'Configura alertas y flujos' },
          { icon: Shield, title: 'Auditorías', desc: 'Programa tu primera auditoría' },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
            <Icon className="mb-2 h-5 w-5 text-indigo-600" />
            <p className="font-semibold text-gray-900">{title}</p>
            <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
          </div>
        ))}
      </div>

      <button
        onClick={() => router.push('/dashboard')}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-4 text-sm font-bold text-white hover:bg-indigo-700 transition-colors"
      >
        Ir al Dashboard <ChevronRight className="h-4 w-4" />
      </button>

      <p className="text-xs text-gray-400">
        ¿Necesitas ayuda?{' '}
        <Link href="#" className="text-indigo-600 underline">Contacta soporte</Link>
      </p>
    </div>
  )
}

// ── Main checkout ─────────────────────────────────────────────────────────────

const DEFAULT_STATE: CheckoutState = {
  planId: 'professional',
  billingCycle: 'monthly',
  companyName: '',
  adminName: '',
  adminEmail: '',
  password: '',
  industry: '',
  country: 'Colombia',
  cardNumber: '',
  cardName: '',
  cardExpiry: '',
  cardCvc: '',
}

function CheckoutFlow() {
  const params = useSearchParams()
  const [step, setStep] = useState(0)
  const [state, setState] = useState<CheckoutState>(() => {
    const planParam = params.get('plan') as PlanId | null
    const cycleParam = params.get('cycle') as BillingCycle | null
    return {
      ...DEFAULT_STATE,
      planId: planParam && ['starter', 'professional', 'enterprise'].includes(planParam) ? planParam : 'professional',
      billingCycle: cycleParam === 'annual' ? 'annual' : 'monthly',
    }
  })

  const plan = PLANS.find((p) => p.id === state.planId)!
  const monthly = getMonthlyEquivalent(plan, state.billingCycle)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="flex h-14 items-center justify-between border-b border-gray-100 bg-white px-6">
        <Link href="/pricing">
          <SIGLogo size={26} variant="full" />
        </Link>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Shield className="h-3.5 w-3.5 text-emerald-500" />
          Pago seguro SSL
        </div>
      </nav>

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          {/* Main card */}
          <div className="rounded-2xl bg-white p-8 shadow-sm border border-gray-100">
            {/* Step indicator */}
            <div className="mb-8 flex justify-center">
              <StepIndicator current={step} steps={STEPS} />
            </div>

            {step === 0 && <StepPlan state={state} setState={setState} onNext={() => setStep(1)} />}
            {step === 1 && <StepEmpresa state={state} setState={setState} onNext={() => setStep(2)} onBack={() => setStep(0)} />}
            {step === 2 && <StepPago state={state} setState={setState} onNext={() => setStep(3)} onBack={() => setStep(1)} />}
            {step === 3 && <StepListo state={state} />}
          </div>

          {/* Sidebar summary */}
          {step < 3 && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
                <p className="mb-4 text-sm font-bold text-gray-700">Resumen del pedido</p>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">{plan.name}</span>
                      <PlanBadge planId={state.planId} />
                    </div>
                    <p className="mt-0.5 text-xs text-gray-500">{state.billingCycle === 'annual' ? 'Facturación anual' : 'Facturación mensual'}</p>
                  </div>
                  <span className="text-lg font-extrabold text-gray-900">${monthly}<span className="text-xs font-normal text-gray-500">/mo</span></span>
                </div>

                <div className="mt-4 space-y-2 border-t border-gray-100 pt-4 text-xs text-gray-500">
                  <div className="flex justify-between">
                    <span>Cobro hoy</span>
                    <span className="font-semibold text-emerald-600">$0.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Primer cobro</span>
                    <span>En 14 días</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cancela cuando quieras</span>
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
                <p className="mb-3 text-sm font-bold text-gray-700">Incluye en {plan.name}</p>
                <ul className="space-y-2">
                  {plan.features.slice(0, 5).map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-gray-600">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                      {f}
                    </li>
                  ))}
                  {plan.features.length > 5 && (
                    <li className="text-xs text-indigo-600 font-medium">+{plan.features.length - 5} más incluido</li>
                  )}
                </ul>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-xs text-gray-500">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-indigo-600" />
                  <span className="font-semibold text-gray-700">Garantía de 30 días</span>
                </div>
                Si no estás satisfecho, te devolvemos el dinero sin preguntas.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><span className="text-gray-400">Cargando...</span></div>}>
      <CheckoutFlow />
    </Suspense>
  )
}
