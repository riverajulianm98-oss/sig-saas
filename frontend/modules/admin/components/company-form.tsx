'use client'

import { useState } from 'react'
import { Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Company, CompanyFormData, PlanType } from '../types'

const INDUSTRIES = [
  'Alimentos y Bebidas', 'Construccion', 'Consultoria', 'Educacion', 'Energia',
  'Farmaceutica', 'Financiero', 'Manufactura', 'Mineria', 'Oil & Gas',
  'Retail', 'Salud', 'Tecnologia', 'Transporte', 'Otro',
]

const PLAN_OPTIONS: { id: PlanType; label: string; price: string }[] = [
  { id: 'starter', label: 'Starter', price: '$49/mes' },
  { id: 'professional', label: 'Professional', price: '$149/mes' },
  { id: 'enterprise', label: 'Enterprise', price: '$399/mes' },
]

interface FieldProps {
  label: string
  required?: boolean
  children: React.ReactNode
}

function Field({ label, required, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputCls = 'w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]'

interface CompanyFormProps {
  open: boolean
  onClose: () => void
  initial?: Partial<Company>
  onSubmit: (data: CompanyFormData) => void
  submitting?: boolean
}

export function CompanyForm({ open, onClose, initial, onSubmit, submitting }: CompanyFormProps) {
  const isEdit = !!initial?.id

  const [form, setForm] = useState<CompanyFormData>({
    name: initial?.name ?? '',
    adminName: initial?.adminName ?? '',
    adminEmail: initial?.adminEmail ?? '',
    plan: initial?.plan ?? 'professional',
    industry: initial?.industry ?? '',
    country: initial?.country ?? 'Colombia',
  })

  function set<K extends keyof CompanyFormData>(key: K, value: CompanyFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.adminEmail || !form.adminName) return
    onSubmit(form)
  }

  const valid = form.name.trim() && form.adminEmail.trim() && form.adminName.trim()

  return (
    <Dialog open={open} onOpenChange={(isOpen: boolean) => !isOpen && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--primary))]/10">
              <Building2 className="h-5 w-5 text-[hsl(var(--primary))]" />
            </div>
            <div>
              <DialogTitle>{isEdit ? 'Editar empresa' : 'Nueva empresa'}</DialogTitle>
              <DialogDescription>
                {isEdit ? 'Actualiza los datos de la empresa.' : 'Crea una nueva empresa cliente en la plataforma.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <Field label="Nombre de la empresa" required>
            <input className={inputCls} value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Ej. Empresa Colombia SAS" />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Nombre del admin" required>
              <input className={inputCls} value={form.adminName} onChange={(e) => set('adminName', e.target.value)} placeholder="Juan García" />
            </Field>
            <Field label="Email del admin" required>
              <input type="email" className={inputCls} value={form.adminEmail} onChange={(e) => set('adminEmail', e.target.value)} placeholder="admin@empresa.com" />
            </Field>
          </div>

          <Field label="Plan">
            <div className="grid grid-cols-3 gap-2">
              {PLAN_OPTIONS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => set('plan', p.id)}
                  className={cn(
                    'rounded-lg border-2 p-2.5 text-center transition-colors',
                    form.plan === p.id
                      ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/8'
                      : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]/50'
                  )}
                >
                  <div className="text-sm font-semibold">{p.label}</div>
                  <div className="text-[10px] text-[hsl(var(--muted-foreground))]">{p.price}</div>
                </button>
              ))}
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Industria">
              <select className={inputCls} value={form.industry} onChange={(e) => set('industry', e.target.value)}>
                <option value="">Seleccionar...</option>
                {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
            </Field>
            <Field label="País">
              <input className={inputCls} value={form.country} onChange={(e) => set('country', e.target.value)} placeholder="Colombia" />
            </Field>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={!valid || submitting}>
              {submitting ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear empresa'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
