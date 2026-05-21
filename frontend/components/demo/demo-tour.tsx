'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, ChevronLeft, X, Map } from 'lucide-react'
import { Button } from '@/components/ui/button'

const STEPS = [
  {
    title: 'Dashboard principal',
    description: 'Vista ejecutiva con KPIs de compliance, hallazgos críticos y estado de auditorías. Todo en tiempo real.',
    href: '/dashboard',
    highlight: 'Métricas globales del SIG',
    emoji: '📊',
  },
  {
    title: 'Documentos ISO',
    description: 'Gestiona todos los documentos del sistema: procedimientos, formatos, instructivos, políticas y manuales con control de versiones.',
    href: '/documents',
    highlight: '15 documentos controlados',
    emoji: '📄',
  },
  {
    title: 'Auditorías enterprise',
    description: 'Planifica y ejecuta auditorías ISO 9001, 14001 y 45001 con checklists automáticos desde templates.',
    href: '/audits',
    highlight: '8 auditorías activas',
    emoji: '🔍',
  },
  {
    title: 'Detalle de auditoría',
    description: 'Vista detallada con checklist interactivo, hallazgos, sugerencias IA, evidencias, compliance por cláusula y timeline de actividad.',
    href: '/audits/aud-002',
    highlight: 'ISO 14001 certificación en proceso',
    emoji: '📋',
  },
  {
    title: 'Hallazgos inteligentes (IA)',
    description: 'Motor de sugerencias automáticas analiza respuestas del checklist y propone hallazgos con confidence score. Aprueba, descarta o convierte en acción correctiva.',
    href: '/audits/aud-003',
    highlight: 'IA → tab Hallazgos IA',
    emoji: '✨',
  },
  {
    title: 'Compliance visual',
    description: 'Score por cláusula, distribución cumple/parcial/no cumple y progreso del checklist con gráficos interactivos.',
    href: '/audits/aud-001',
    highlight: '87% compliance auditado',
    emoji: '📈',
  },
]

interface DemoTourProps {
  onClose: () => void
}

export function DemoTour({ onClose }: DemoTourProps) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const current = STEPS[step]

  const goTo = (href: string) => {
    router.push(href)
  }

  const next = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1)
      goTo(STEPS[step + 1].href)
    } else {
      onClose()
    }
  }

  const prev = () => {
    if (step > 0) {
      setStep(step - 1)
      goTo(STEPS[step - 1].href)
    }
  }

  const jumpTo = (i: number) => {
    setStep(i)
    goTo(STEPS[i].href)
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
      <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-2xl overflow-hidden">
        {/* Progress dots */}
        <div className="flex items-center gap-1.5 px-5 pt-4">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => jumpTo(i)}
              className={`transition-all rounded-full ${
                i === step
                  ? 'h-2 w-6 bg-[hsl(var(--primary))]'
                  : i < step
                  ? 'h-2 w-2 bg-[hsl(var(--primary))]/40'
                  : 'h-2 w-2 bg-[hsl(var(--border))]'
              }`}
            />
          ))}
          <span className="ml-auto text-xs text-[hsl(var(--muted-foreground))]">
            {step + 1} / {STEPS.length}
          </span>
        </div>

        {/* Content */}
        <div className="px-5 py-4 space-y-2">
          <div className="flex items-start gap-3">
            <span className="text-2xl">{current.emoji}</span>
            <div>
              <h3 className="font-semibold text-base">{current.title}</h3>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1 leading-relaxed">
                {current.description}
              </p>
            </div>
          </div>
          <div className="rounded-lg bg-[hsl(var(--primary))]/10 border border-[hsl(var(--primary))]/20 px-3 py-2">
            <span className="text-xs font-medium text-[hsl(var(--primary))]">
              👉 {current.highlight}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between px-5 pb-4 gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={prev}
            disabled={step === 0}
            className="gap-1"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Anterior
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-[hsl(var(--muted-foreground))]">
            <X className="h-3.5 w-3.5 mr-1" /> Salir del tour
          </Button>
          <Button size="sm" onClick={next} className="gap-1">
            {step === STEPS.length - 1 ? 'Finalizar' : 'Siguiente'}
            {step < STEPS.length - 1 && <ChevronRight className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>
    </div>
  )
}

export function DemoTourButton() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-lg border border-[hsl(var(--primary))]/30 bg-[hsl(var(--primary))]/10 px-3 py-1.5 text-xs font-medium text-[hsl(var(--primary))] transition-all hover:bg-[hsl(var(--primary))]/20"
      >
        <Map className="h-3.5 w-3.5" /> Ver recorrido
      </button>
      {open && <DemoTour onClose={() => setOpen(false)} />}
    </>
  )
}
