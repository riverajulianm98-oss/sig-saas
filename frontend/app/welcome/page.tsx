'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowRight, ArrowLeft, CheckCircle2, Building2, BookOpen,
  Users, FileText, ClipboardCheck, Sparkles,
} from 'lucide-react'
import { SIGLogo } from '@/components/brand/logo'
import { useAuthStore } from '@/store/auth.store'
import { DEMO_USER, DEMO_TENANT, DEMO_TOKEN, DEMO_REFRESH } from '@/lib/demo-data'
import { TOKEN_KEYS } from '@/lib/constants'
import { isDemoMode } from '@/lib/demo-mode'

const NORMS = [
  { id: '9001', label: 'ISO 9001:2015', desc: 'Sistema de Gestión de Calidad', color: '#6366f1' },
  { id: '14001', label: 'ISO 14001:2015', desc: 'Sistema de Gestión Ambiental', color: '#10b981' },
  { id: '45001', label: 'ISO 45001:2018', desc: 'Seguridad y Salud en el Trabajo', color: '#f59e0b' },
]

const ROLES = ['Coordinador SIG', 'Auditor interno', 'Líder de proceso', 'Gerente', 'Asesor HSEQ']

const DOC_TYPES = ['Procedimiento', 'Instructivo', 'Formato', 'Manual', 'Política', 'Plan']

const PROCESSES = ['Calidad', 'Producción', 'HSEQ', 'Medio Ambiente', 'Compras', 'Recursos Humanos']

const AUDIT_TYPES = [
  { id: 'interna', label: 'Interna', desc: 'Por auditores de la empresa' },
  { id: 'externa', label: 'Externa', desc: 'Por organismo certificador' },
  { id: 'seguimiento', label: 'Seguimiento', desc: 'Seguimiento de acciones' },
]

const STEPS = [
  { id: 1, label: 'Empresa',    icon: Building2 },
  { id: 2, label: 'Normas',    icon: BookOpen },
  { id: 3, label: 'Equipo',    icon: Users },
  { id: 4, label: 'Documento', icon: FileText },
  { id: 5, label: 'Auditoría', icon: ClipboardCheck },
]

const STORAGE_KEY = 'sig_welcome_progress'

function saveProgress(data: Record<string, unknown>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function loadProgress(): Record<string, unknown> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

export default function WelcomePage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const [step, setStep] = useState(1)

  // Step 1 — company
  const [companyName, setCompanyName] = useState('SIGCYA Consulting S.A.S.')
  const [industry, setIndustry] = useState('Consultoría')
  const [employees, setEmployees] = useState('11-50')

  // Step 2 — norms
  const [selectedNorms, setSelectedNorms] = useState<string[]>(['9001'])

  // Step 3 — team
  const [teamMembers, setTeamMembers] = useState([
    { name: 'Alejandro Gómez', role: 'Coordinador SIG', email: 'a.gomez@sigcya.com' },
  ])

  // Step 4 — document
  const [docName, setDocName] = useState('Procedimiento control de documentos')
  const [docType, setDocType] = useState('Procedimiento')
  const [docProcess, setDocProcess] = useState('Calidad')

  // Step 5 — audit
  const [auditType, setAuditType] = useState('interna')
  const [auditAuditor, setAuditAuditor] = useState('Alejandro Gómez')
  const [auditDate, setAuditDate] = useState(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0])

  useEffect(() => {
    const saved = loadProgress()
    if (saved.step) setStep(saved.step as number)
    if (saved.companyName) setCompanyName(saved.companyName as string)
    if (saved.industry) setIndustry(saved.industry as string)
    if (saved.selectedNorms) setSelectedNorms(saved.selectedNorms as string[])
  }, [])

  useEffect(() => {
    if (!isAuthenticated && isDemoMode()) {
      const { setAuth } = useAuthStore.getState()
      localStorage.setItem(TOKEN_KEYS.access, DEMO_TOKEN)
      localStorage.setItem(TOKEN_KEYS.refresh, DEMO_REFRESH)
      localStorage.setItem(TOKEN_KEYS.tenantId, DEMO_TENANT.id)
      setAuth(DEMO_USER, DEMO_TENANT, { access: DEMO_TOKEN, refresh: DEMO_REFRESH })
    }
  }, [isAuthenticated])

  const next = () => {
    const progress = { step: step + 1, companyName, industry, selectedNorms }
    saveProgress(progress)
    if (step < 5) setStep(step + 1)
    else finish()
  }

  const prev = () => {
    if (step > 1) setStep(step - 1)
  }

  const finish = () => {
    localStorage.removeItem(STORAGE_KEY)
    router.push('/dashboard')
  }

  const toggleNorm = (id: string) =>
    setSelectedNorms((prev) => prev.includes(id) ? prev.filter((n) => n !== id) : [...prev, id])

  const addTeamMember = () =>
    setTeamMembers((prev) => [...prev, { name: '', role: 'Coordinador SIG', email: '' }])

  const updateMember = (i: number, field: 'name' | 'role' | 'email', value: string) =>
    setTeamMembers((prev) => prev.map((m, idx) => idx === i ? { ...m, [field]: value } : m))

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col">

      {/* Top nav */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <SIGLogo size={28} />
        <button onClick={finish} className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
          Omitir configuración →
        </button>
      </div>

      {/* Progress stepper */}
      <div className="flex justify-center pt-10 pb-6 px-6">
        <div className="flex items-center gap-0">
          {STEPS.map((s, i) => {
            const done = step > s.id
            const active = step === s.id
            const Icon = s.icon
            return (
              <div key={s.id} className="flex items-center">
                <div className="flex flex-col items-center gap-1.5">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                    done ? 'bg-indigo-600 border-indigo-600' :
                    active ? 'bg-white border-indigo-600 shadow-md shadow-indigo-500/20' :
                    'bg-white border-gray-200'
                  }`}>
                    {done
                      ? <CheckCircle2 className="h-5 w-5 text-white" />
                      : <Icon className={`h-4 w-4 ${active ? 'text-indigo-600' : 'text-gray-300'}`} />
                    }
                  </div>
                  <span className={`text-[11px] font-semibold hidden sm:block ${
                    active ? 'text-indigo-600' : done ? 'text-gray-500' : 'text-gray-300'
                  }`}>{s.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-0.5 w-12 sm:w-20 mx-1 mb-5 rounded-full transition-all ${
                    step > s.id ? 'bg-indigo-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 flex items-start justify-center px-6 pb-12">
        <div className="w-full max-w-xl">
          <div className="rounded-2xl border border-gray-100 bg-white shadow-xl shadow-gray-900/5 p-8">

            {/* Step 1 — Empresa */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2.5 mb-1">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100">
                      <Building2 className="h-4 w-4 text-indigo-600" />
                    </div>
                    <h2 className="text-xl font-black">Cuéntanos sobre tu empresa</h2>
                  </div>
                  <p className="text-sm text-gray-400 ml-10">Configuramos la plataforma a tu medida</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Nombre de la empresa *
                    </label>
                    <input
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                      placeholder="Ej: Mi Empresa S.A.S."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Sector / Industria
                    </label>
                    <select
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                    >
                      {['Manufactura', 'Consultoría', 'Construcción', 'Alimentos', 'Servicios', 'Logística', 'Minería', 'Salud', 'Educación'].map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Número de empleados
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {['1-10', '11-50', '51-200', '200+'].map((r) => (
                        <button
                          key={r}
                          onClick={() => setEmployees(r)}
                          className={`rounded-xl border py-2.5 text-sm font-semibold transition-all ${
                            employees === r
                              ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                              : 'border-gray-200 text-gray-500 hover:border-gray-300'
                          }`}
                        >{r}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2 — Normas */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2.5 mb-1">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
                      <BookOpen className="h-4 w-4 text-emerald-600" />
                    </div>
                    <h2 className="text-xl font-black">¿Qué normas gestiona tu SIG?</h2>
                  </div>
                  <p className="text-sm text-gray-400 ml-10">Puedes seleccionar varias</p>
                </div>

                <div className="space-y-3">
                  {NORMS.map((n) => {
                    const selected = selectedNorms.includes(n.id)
                    return (
                      <button
                        key={n.id}
                        onClick={() => toggleNorm(n.id)}
                        className={`w-full flex items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all ${
                          selected ? 'border-indigo-500 bg-indigo-50' : 'border-gray-100 hover:border-gray-200'
                        }`}
                      >
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg font-black ${
                          selected ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'
                        }`}>
                          {selected ? '✓' : n.id.slice(-2)}
                        </div>
                        <div>
                          <p className={`font-bold text-sm ${selected ? 'text-indigo-700' : 'text-gray-700'}`}>{n.label}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{n.desc}</p>
                        </div>
                        <div className={`ml-auto h-5 w-5 rounded-full border-2 shrink-0 ${
                          selected ? 'border-indigo-600 bg-indigo-600' : 'border-gray-200'
                        }`}>
                          {selected && <CheckCircle2 className="h-4 w-4 text-white" />}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Step 3 — Equipo */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2.5 mb-1">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <h2 className="text-xl font-black">Agrega tu equipo SIG</h2>
                  </div>
                  <p className="text-sm text-gray-400 ml-10">Puedes agregar más personas después</p>
                </div>

                <div className="space-y-4">
                  {teamMembers.map((m, i) => (
                    <div key={i} className="rounded-2xl border border-gray-100 bg-gray-50 p-4 space-y-3">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        {i === 0 ? 'Tú (administrador)' : `Miembro ${i + 1}`}
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          value={m.name}
                          onChange={(e) => updateMember(i, 'name', e.target.value)}
                          placeholder="Nombre completo"
                          className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                        />
                        <input
                          value={m.email}
                          onChange={(e) => updateMember(i, 'email', e.target.value)}
                          placeholder="correo@empresa.com"
                          type="email"
                          className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                        />
                        <select
                          value={m.role}
                          onChange={(e) => updateMember(i, 'role', e.target.value)}
                          className="col-span-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                        >
                          {ROLES.map((r) => <option key={r}>{r}</option>)}
                        </select>
                      </div>
                    </div>
                  ))}
                  {teamMembers.length < 3 && (
                    <button
                      onClick={addTeamMember}
                      className="w-full rounded-2xl border-2 border-dashed border-gray-200 py-3 text-sm font-medium text-gray-400 hover:border-indigo-300 hover:text-indigo-500 transition-all"
                    >
                      + Agregar otro miembro
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Step 4 — Documento */}
            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2.5 mb-1">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100">
                      <FileText className="h-4 w-4 text-purple-600" />
                    </div>
                    <h2 className="text-xl font-black">Registra tu primer documento</h2>
                  </div>
                  <p className="text-sm text-gray-400 ml-10">Comenzamos a construir tu sistema documental</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Nombre del documento *
                    </label>
                    <input
                      value={docName}
                      onChange={(e) => setDocName(e.target.value)}
                      placeholder="Ej: Procedimiento control de documentos"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                        Tipo
                      </label>
                      <select
                        value={docType}
                        onChange={(e) => setDocType(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                      >
                        {DOC_TYPES.map((t) => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                        Proceso
                      </label>
                      <select
                        value={docProcess}
                        onChange={(e) => setDocProcess(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                      >
                        {PROCESSES.map((p) => <option key={p}>{p}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Preview card */}
                  <div className="rounded-xl border border-purple-100 bg-purple-50 p-4">
                    <p className="text-xs font-semibold text-purple-500 uppercase tracking-wider mb-2">Vista previa</p>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/20">
                        <FileText className="h-4 w-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700">{docName || 'Sin nombre'}</p>
                        <p className="text-xs text-gray-400">{docType} · {docProcess} · v1.0</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5 — Auditoría */}
            {step === 5 && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2.5 mb-1">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
                      <ClipboardCheck className="h-4 w-4 text-amber-600" />
                    </div>
                    <h2 className="text-xl font-black">Planifica tu primera auditoría</h2>
                  </div>
                  <p className="text-sm text-gray-400 ml-10">La crearemos en tu sistema al finalizar</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                      Tipo de auditoría
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {AUDIT_TYPES.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setAuditType(t.id)}
                          className={`rounded-xl border-2 p-3 text-left transition-all ${
                            auditType === t.id
                              ? 'border-amber-500 bg-amber-50'
                              : 'border-gray-100 hover:border-gray-200'
                          }`}
                        >
                          <p className={`text-sm font-bold ${auditType === t.id ? 'text-amber-700' : 'text-gray-700'}`}>{t.label}</p>
                          <p className="text-[11px] text-gray-400 mt-0.5 leading-tight">{t.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                        Auditor líder
                      </label>
                      <select
                        value={auditAuditor}
                        onChange={(e) => setAuditAuditor(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                      >
                        {teamMembers.filter(m => m.name).map((m) => <option key={m.name}>{m.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                        Fecha programada
                      </label>
                      <input
                        type="date"
                        value={auditDate}
                        onChange={(e) => setAuditDate(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                      />
                    </div>
                  </div>

                  {/* Completion teaser */}
                  <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 p-5 text-center">
                    <Sparkles className="h-8 w-8 text-indigo-400 mx-auto mb-3" />
                    <p className="text-base font-bold text-gray-700 mb-1">¡Listo para comenzar!</p>
                    <p className="text-sm text-gray-400">
                      Tu plataforma SIG estará configurada con{' '}
                      <strong className="text-indigo-600">{selectedNorms.length} norma{selectedNorms.length !== 1 ? 's' : ''}</strong>,{' '}
                      <strong className="text-indigo-600">{teamMembers.filter(m => m.name).length} usuario{teamMembers.filter(m => m.name).length !== 1 ? 's' : ''}</strong>,{' '}
                      1 documento y 1 auditoría programada.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
              <button
                onClick={prev}
                disabled={step === 1}
                className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ArrowLeft className="h-4 w-4" /> Anterior
              </button>

              <span className="text-xs text-gray-300 font-medium">Paso {step} de {STEPS.length}</span>

              <button
                onClick={next}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-500/20"
              >
                {step === 5 ? (
                  <><CheckCircle2 className="h-4 w-4" /> Ir al dashboard</>
                ) : (
                  <>Siguiente <ArrowRight className="h-4 w-4" /></>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
