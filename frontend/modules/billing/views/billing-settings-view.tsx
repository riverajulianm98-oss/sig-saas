'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  CreditCard, Zap, FileText, Users, HardDrive, AlertTriangle,
  Check, ChevronRight, ArrowUpRight, Shield, RefreshCw, X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSubscription, useUsage, useChangePlan, useCancelSubscription } from '../hooks/use-billing'
import { PLANS, getPlan, getMonthlyEquivalent } from '../services/billing.service'
import { PlanId, BillingCycle } from '../types'

function UsageMeter({
  label, icon: Icon, used, limit, unit = '',
}: { label: string; icon: React.ElementType; used: number; limit: number; unit?: string }) {
  const unlimited = limit === -1
  const pct = unlimited ? 0 : Math.min(100, Math.round((used / limit) * 100))
  const warning = !unlimited && pct >= 80
  const exceeded = !unlimited && pct >= 100

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Icon className="h-4 w-4 text-gray-400" />
          <span>{label}</span>
        </div>
        <span className={cn('text-xs font-semibold', exceeded ? 'text-red-600' : warning ? 'text-amber-600' : 'text-gray-500')}>
          {unlimited ? (
            <span className="text-indigo-600">Ilimitado</span>
          ) : (
            `${used.toLocaleString()} / ${limit.toLocaleString()} ${unit}`
          )}
        </span>
      </div>
      {!unlimited && (
        <div className="h-2 w-full rounded-full bg-gray-100">
          <div
            className={cn(
              'h-2 rounded-full transition-all',
              exceeded ? 'bg-red-500' : warning ? 'bg-amber-400' : 'bg-indigo-500'
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
      {(warning || exceeded) && (
        <p className={cn('text-xs', exceeded ? 'text-red-500' : 'text-amber-500')}>
          {exceeded ? 'Límite superado — upgrade necesario' : `Cerca del límite (${pct}%)`}
        </p>
      )}
    </div>
  )
}

function CancelModal({ onConfirm, onClose }: { onConfirm: () => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">¿Cancelar suscripción?</h3>
            <p className="mt-1 text-sm text-gray-500">
              Mantendrás el acceso hasta el fin del período actual. Después perderás el acceso a funciones premium.
            </p>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Mantener plan
          </button>
          <button onClick={onConfirm} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
            Sí, cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

function ChangePlanModal({ currentPlanId, currentCycle, onClose }: {
  currentPlanId: PlanId; currentCycle: BillingCycle; onClose: () => void
}) {
  const [planId, setPlanId] = useState<PlanId>(currentPlanId)
  const [cycle, setCycle] = useState<BillingCycle>(currentCycle)
  const changePlan = useChangePlan()

  async function handleSave() {
    await changePlan.mutateAsync({ planId, cycle })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-900">Cambiar plan</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-gray-100">
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        <div className="mb-4 flex gap-2">
          {(['monthly', 'annual'] as BillingCycle[]).map((c) => (
            <button
              key={c}
              onClick={() => setCycle(c)}
              className={cn(
                'flex-1 rounded-lg border py-2 text-sm font-medium transition-all',
                cycle === c ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
              )}
            >
              {c === 'monthly' ? 'Mensual' : 'Anual (-20%)'}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {PLANS.map((p) => {
            const m = getMonthlyEquivalent(p, cycle)
            const selected = planId === p.id
            return (
              <button
                key={p.id}
                onClick={() => setPlanId(p.id)}
                className={cn(
                  'flex w-full items-center justify-between rounded-xl border-2 p-4 text-left transition-all',
                  selected ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <div>
                  <p className="text-sm font-semibold text-gray-900">{p.name}</p>
                  <p className="text-xs text-gray-500">{p.tagline}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-extrabold text-gray-900">${m}<span className="text-xs font-normal text-gray-400">/mo</span></p>
                  {selected && <Check className="ml-auto h-4 w-4 text-indigo-600" />}
                </div>
              </button>
            )
          })}
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={changePlan.isPending || (planId === currentPlanId && cycle === currentCycle)}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {changePlan.isPending && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
            Confirmar cambio
          </button>
        </div>
      </div>
    </div>
  )
}

export default function BillingSettingsView() {
  const router = useRouter()
  const { data: sub, isLoading: subLoading } = useSubscription()
  const { data: usage } = useUsage()
  const cancelSub = useCancelSubscription()

  const [showChangePlan, setShowChangePlan] = useState(false)
  const [showCancel, setShowCancel] = useState(false)

  if (subLoading || !sub) {
    return <div className="flex h-64 items-center justify-center text-sm text-gray-400">Cargando...</div>
  }

  const plan = getPlan(sub.planId)
  const monthly = getMonthlyEquivalent(plan, sub.billingCycle)
  const renewalDate = new Date(sub.currentPeriodEnd).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })
  const trialEndsAt = sub.trialEndsAt ? new Date(sub.trialEndsAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'long' }) : null
  const isTrialing = sub.status === 'trial'

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      {showChangePlan && (
        <ChangePlanModal
          currentPlanId={sub.planId}
          currentCycle={sub.billingCycle}
          onClose={() => setShowChangePlan(false)}
        />
      )}
      {showCancel && (
        <CancelModal
          onClose={() => setShowCancel(false)}
          onConfirm={async () => {
            await cancelSub.mutateAsync()
            setShowCancel(false)
          }}
        />
      )}

      <div>
        <h1 className="text-xl font-bold text-gray-900">Facturación y plan</h1>
        <p className="mt-1 text-sm text-gray-500">Gestiona tu suscripción, método de pago y uso.</p>
      </div>

      {/* Trial banner */}
      {isTrialing && trialEndsAt && (
        <div className="flex items-center gap-3 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />
          <div className="flex-1 text-sm">
            <span className="font-semibold text-amber-700">Período de prueba activo</span>
            <span className="text-amber-600"> — Finaliza el {trialEndsAt}. Añade un método de pago para continuar.</span>
          </div>
          <button onClick={() => setShowChangePlan(true)} className="shrink-0 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-600">
            Activar plan
          </button>
        </div>
      )}

      {/* Canceled banner */}
      {sub.cancelAtPeriodEnd && (
        <div className="flex items-center gap-3 rounded-xl bg-red-50 border border-red-200 px-4 py-3">
          <AlertTriangle className="h-5 w-5 shrink-0 text-red-500" />
          <p className="flex-1 text-sm text-red-700">
            <span className="font-semibold">Suscripción cancelada.</span> Mantendrás el acceso hasta el {renewalDate}.
          </p>
          <button onClick={() => setShowChangePlan(true)} className="shrink-0 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700">
            Reactivar
          </button>
        </div>
      )}

      {/* Current plan */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-gray-900">Plan {plan.name}</h2>
              <span className={cn(
                'rounded-full px-2.5 py-0.5 text-xs font-bold',
                sub.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                sub.status === 'trial' ? 'bg-amber-100 text-amber-700' :
                'bg-red-100 text-red-700'
              )}>
                {sub.status === 'active' ? 'Activo' : sub.status === 'trial' ? 'Prueba' : 'Cancelado'}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500">{plan.tagline}</p>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-gray-900">${monthly}</span>
              <span className="text-sm text-gray-500">/mes · {sub.billingCycle === 'annual' ? 'Facturación anual' : 'Facturación mensual'}</span>
            </div>
            {!sub.cancelAtPeriodEnd && (
              <p className="mt-1 text-xs text-gray-400">
                {isTrialing ? 'Prueba gratuita hasta' : 'Próxima renovación'} el {renewalDate}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setShowChangePlan(true)}
              className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cambiar plan <ChevronRight className="h-3.5 w-3.5" />
            </button>
            <Link
              href="/pricing"
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
            >
              Ver planes <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Payment method */}
      {sub.lastFour && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-sm font-bold text-gray-900">Método de pago</h2>
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-14 items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
              <CreditCard className="h-5 w-5 text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{sub.cardBrand} •••• {sub.lastFour}</p>
              <p className="text-xs text-gray-500">Tarjeta de crédito</p>
            </div>
            <button className="ml-auto text-xs text-indigo-600 hover:underline">Actualizar</button>
          </div>
        </div>
      )}

      {/* Usage meters */}
      {usage && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900">Uso del período actual</h2>
            <Link href="/usage" className="flex items-center gap-1 text-xs text-indigo-600 hover:underline">
              Ver detalle <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-5">
            <UsageMeter label="Usuarios" icon={Users} used={usage.usersCount} limit={plan.limits.users} />
            <UsageMeter label="Documentos" icon={FileText} used={usage.documentsCount} limit={plan.limits.documents} />
            <UsageMeter label="Automatizaciones ejecutadas" icon={Zap} used={usage.automationRuns} limit={plan.limits.automations} />
            <UsageMeter label="Reportes generados" icon={FileText} used={usage.reportsGenerated} limit={plan.limits.reports} />
            <UsageMeter label="Almacenamiento" icon={HardDrive} used={usage.storageUsedMb} limit={plan.limits.storageMb} unit="MB" />
          </div>
        </div>
      )}

      {/* Security */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="mb-3 text-sm font-bold text-gray-900">Seguridad y cumplimiento</h2>
        <div className="grid gap-3 sm:grid-cols-2 text-sm text-gray-600">
          {[
            { icon: Shield, text: 'Datos cifrados en reposo y tránsito' },
            { icon: Check, text: 'ISO 27001 compliant' },
            { icon: Shield, text: 'Backups diarios automáticos' },
            { icon: Check, text: 'GDPR / Ley 1581 Colombia' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-indigo-600 shrink-0" />
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Danger zone */}
      {!sub.cancelAtPeriodEnd && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <h2 className="mb-1 text-sm font-bold text-red-700">Zona de peligro</h2>
          <p className="mb-4 text-xs text-red-500">
            Cancelar al final del período actual. Perderás el acceso a funciones premium.
          </p>
          <button
            onClick={() => setShowCancel(true)}
            className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100"
          >
            Cancelar suscripción
          </button>
        </div>
      )}
    </div>
  )
}
