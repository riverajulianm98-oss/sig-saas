'use client'

import { useState } from 'react'
import { Save, RefreshCw, Shield, Mail, Globe, Sliders, ToggleLeft, ToggleRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AdminService } from '../services/admin.service'

interface ToggleRowProps {
  label: string
  description: string
  value: boolean
  onChange: (v: boolean) => void
}

function ToggleRow({ label, description, value, onChange }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-[hsl(var(--muted-foreground))]">{description}</p>
      </div>
      <button onClick={() => onChange(!value)} className="shrink-0">
        {value
          ? <ToggleRight className="h-6 w-6 text-[hsl(var(--primary))]" />
          : <ToggleLeft className="h-6 w-6 text-[hsl(var(--muted-foreground))]" />
        }
      </button>
    </div>
  )
}

function Section({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] overflow-hidden">
      <div className="flex items-center gap-3 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] px-5 py-3">
        <Icon className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
        <h2 className="font-semibold text-sm">{title}</h2>
      </div>
      <div className="p-5 space-y-3">{children}</div>
    </div>
  )
}

const inputCls = 'w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]'

export function AdminSettingsView() {
  const [saved, setSaved] = useState(false)

  // Feature flags
  const [flags, setFlags] = useState({
    registration: true,
    demoMode: true,
    maintenanceMode: false,
    twoFactor: false,
    auditLogs: true,
    apiAccess: true,
  })

  // Email config
  const [email, setEmail] = useState({
    from: 'noreply@sigcya.com',
    replyTo: 'soporte@sigcya.com',
    smtpHost: 'smtp.sendgrid.net',
    smtpPort: '587',
  })

  // Platform config
  const [platform, setPlatform] = useState({
    platformName: 'SIG CYA',
    supportEmail: 'soporte@sigcya.com',
    trialDays: '14',
    maxLoginAttempts: '5',
  })

  function setFlag(k: keyof typeof flags, v: boolean) {
    setFlags((prev) => ({ ...prev, [k]: v }))
  }

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleReset() {
    if (window.confirm('¿Resetear todos los datos demo? Esto borrara todas las empresas, usuarios y logs personalizados.')) {
      AdminService.reset()
      window.location.reload()
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Configuracion global</h1>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Ajustes de la plataforma SIG CYA</p>
        </div>
        <button
          onClick={handleSave}
          className={cn(
            'flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all',
            saved
              ? 'bg-emerald-500 text-white'
              : 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90'
          )}
        >
          <Save className="h-4 w-4" /> {saved ? 'Guardado' : 'Guardar cambios'}
        </button>
      </div>

      {/* Platform */}
      <Section icon={Globe} title="Configuracion de plataforma">
        <div className="grid grid-cols-2 gap-3">
          {[
            { key: 'platformName', label: 'Nombre de la plataforma' },
            { key: 'supportEmail', label: 'Email de soporte' },
            { key: 'trialDays', label: 'Dias de trial por defecto' },
            { key: 'maxLoginAttempts', label: 'Max intentos de login' },
          ].map(({ key, label }) => (
            <div key={key} className="space-y-1">
              <label className="block text-xs font-medium text-[hsl(var(--muted-foreground))]">{label}</label>
              <input
                className={inputCls}
                value={platform[key as keyof typeof platform]}
                onChange={(e) => setPlatform((p) => ({ ...p, [key]: e.target.value }))}
              />
            </div>
          ))}
        </div>
      </Section>

      {/* Feature flags */}
      <Section icon={Sliders} title="Feature flags">
        <ToggleRow label="Registro de nuevas empresas" description="Permite que nuevas empresas se registren" value={flags.registration} onChange={(v) => setFlag('registration', v)} />
        <ToggleRow label="Modo demostracion" description="Muestra datos demo y tour guiado" value={flags.demoMode} onChange={(v) => setFlag('demoMode', v)} />
        <ToggleRow label="Modo mantenimiento" description="Bloquea acceso a todos los usuarios excepto super admin" value={flags.maintenanceMode} onChange={(v) => setFlag('maintenanceMode', v)} />
        <ToggleRow label="Autenticacion de dos factores" description="Requiere 2FA para todos los admin_empresa" value={flags.twoFactor} onChange={(v) => setFlag('twoFactor', v)} />
        <ToggleRow label="Logs de auditoria" description="Registra todas las acciones de los usuarios" value={flags.auditLogs} onChange={(v) => setFlag('auditLogs', v)} />
        <ToggleRow label="Acceso API externo" description="Permite a las empresas usar la API REST" value={flags.apiAccess} onChange={(v) => setFlag('apiAccess', v)} />
      </Section>

      {/* Email */}
      <Section icon={Mail} title="Configuracion de email">
        <div className="grid grid-cols-2 gap-3">
          {[
            { key: 'from', label: 'From address' },
            { key: 'replyTo', label: 'Reply-to' },
            { key: 'smtpHost', label: 'SMTP Host' },
            { key: 'smtpPort', label: 'SMTP Port' },
          ].map(({ key, label }) => (
            <div key={key} className="space-y-1">
              <label className="block text-xs font-medium text-[hsl(var(--muted-foreground))]">{label}</label>
              <input
                className={inputCls}
                value={email[key as keyof typeof email]}
                onChange={(e) => setEmail((em) => ({ ...em, [key]: e.target.value }))}
              />
            </div>
          ))}
        </div>
      </Section>

      {/* Danger zone */}
      <Section icon={Shield} title="Zona de peligro">
        <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-4">
          <p className="text-sm font-semibold text-red-700 dark:text-red-300">Reset de datos demo</p>
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
            Borra todos los datos personalizados y restaura el estado inicial de demostración. No afecta el backend real.
          </p>
          <button
            onClick={handleReset}
            className="mt-3 flex items-center gap-2 rounded-lg border border-red-300 dark:border-red-700 bg-white dark:bg-red-950 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
          >
            <RefreshCw className="h-4 w-4" /> Restaurar datos demo
          </button>
        </div>
      </Section>
    </div>
  )
}
