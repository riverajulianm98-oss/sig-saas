'use client'

import { Workflow, WorkflowExecution, AutomationStats } from '../types'
import { generateMockExecutions } from '../engine/executor'

const WORKFLOWS_KEY = 'sig_workflows'
const EXECUTIONS_KEY = 'sig_workflow_executions'

function randomId() {
  return Math.random().toString(36).slice(2, 10)
}

const DEMO_WORKFLOWS: Workflow[] = [
  {
    id: 'wf-001',
    name: 'Alerta documento por vencer',
    description: 'Notifica al responsable cuando un documento vence en 7 días',
    status: 'active',
    trigger: { type: 'document.expiring', config: { days_before: 7 } },
    conditions: [{ id: 'c1', field: 'document_type', operator: 'neq', value: 'formato' }],
    actions: [{ id: 'a1', type: 'send_notification', config: { recipient: 'responsible', message: '' } }],
    createdAt: '2025-01-10T08:00:00Z',
    updatedAt: '2025-04-15T10:30:00Z',
    executionCount: 47,
    successCount: 44,
    lastExecutedAt: '2026-05-21T09:15:00Z',
    tags: ['documentos', 'alertas'],
    estimatedTimeSavedMinutes: 15,
  },
  {
    id: 'wf-002',
    name: 'Compliance bajo → Crear auditoría',
    description: 'Cuando el score cae por debajo del 80%, programa una auditoría de seguimiento',
    status: 'active',
    trigger: { type: 'audit.low_score', config: { threshold: 80 } },
    conditions: [{ id: 'c1', field: 'compliance_score', operator: 'lt', value: 80 }],
    actions: [
      { id: 'a1', type: 'create_audit', config: { audit_type: 'seguimiento', days_from_now: 14 } },
      { id: 'a2', type: 'send_notification', config: { recipient: 'coordinador_sig', message: '' } },
    ],
    createdAt: '2025-01-15T09:00:00Z',
    updatedAt: '2025-05-01T11:00:00Z',
    executionCount: 12,
    successCount: 12,
    lastExecutedAt: '2026-05-20T14:22:00Z',
    tags: ['auditorías', 'compliance'],
    estimatedTimeSavedMinutes: 45,
  },
  {
    id: 'wf-003',
    name: 'Hallazgo crítico → CAPA inmediata',
    description: 'Crea automáticamente una CAPA cuando se registra un hallazgo crítico',
    status: 'active',
    trigger: { type: 'finding.critical', config: {} },
    conditions: [{ id: 'c1', field: 'classification', operator: 'eq', value: 'no_conformidad' }],
    actions: [
      { id: 'a1', type: 'create_capa', config: { due_days: 5, assign_to: 'lider_proceso' } },
      { id: 'a2', type: 'send_notification', config: { recipient: 'coordinador_sig', message: '' } },
    ],
    createdAt: '2025-02-01T10:00:00Z',
    updatedAt: '2025-04-20T08:45:00Z',
    executionCount: 31,
    successCount: 30,
    lastExecutedAt: '2026-05-22T08:00:00Z',
    tags: ['hallazgos', 'capa', 'crítico'],
    estimatedTimeSavedMinutes: 30,
  },
  {
    id: 'wf-004',
    name: 'CAPA vencida → Escalar a coordinador',
    description: 'Reasigna y notifica cuando una CAPA supera su fecha límite',
    status: 'active',
    trigger: { type: 'capa.overdue', config: { grace_days: 1 } },
    conditions: [],
    actions: [
      { id: 'a1', type: 'assign_user', config: { assign_to: 'coordinador_sig' } },
      { id: 'a2', type: 'change_status', config: { new_status: 'escalated' } },
      { id: 'a3', type: 'send_notification', config: { recipient: 'admin', message: '' } },
    ],
    createdAt: '2025-02-10T09:00:00Z',
    updatedAt: '2025-05-05T14:00:00Z',
    executionCount: 8,
    successCount: 8,
    lastExecutedAt: '2026-05-21T16:30:00Z',
    tags: ['capa', 'escalación'],
    estimatedTimeSavedMinutes: 20,
  },
  {
    id: 'wf-005',
    name: 'Auditoría completada → Reporte ejecutivo',
    description: 'Genera automáticamente el informe ejecutivo al cerrar una auditoría',
    status: 'active',
    trigger: { type: 'audit.completed', config: {} },
    conditions: [{ id: 'c1', field: 'audit_type', operator: 'eq', value: 'externa' }],
    actions: [
      { id: 'a1', type: 'generate_report', config: { report_type: 'executive' } },
      { id: 'a2', type: 'send_notification', config: { recipient: 'admin', message: '' } },
    ],
    createdAt: '2025-03-01T11:00:00Z',
    updatedAt: '2025-05-10T09:00:00Z',
    executionCount: 6,
    successCount: 6,
    lastExecutedAt: '2026-05-19T11:00:00Z',
    tags: ['auditorías', 'reportes'],
    estimatedTimeSavedMinutes: 60,
  },
  {
    id: 'wf-006',
    name: 'Hallazgo reincidente → Escalación dirección',
    description: 'Notifica a dirección y genera reporte cuando hay reincidencia',
    status: 'active',
    trigger: { type: 'finding.recurrence', config: { recurrence_count: 2 } },
    conditions: [{ id: 'c1', field: 'severity', operator: 'in', value: ['alta', 'critica'] }],
    actions: [
      { id: 'a1', type: 'send_notification', config: { recipient: 'admin', message: '' } },
      { id: 'a2', type: 'generate_report', config: { report_type: 'findings' } },
      { id: 'a3', type: 'create_audit', config: { audit_type: 'extraordinaria', days_from_now: 7 } },
    ],
    createdAt: '2025-03-15T10:00:00Z',
    updatedAt: '2025-04-25T15:00:00Z',
    executionCount: 3,
    successCount: 3,
    lastExecutedAt: '2026-05-18T10:45:00Z',
    tags: ['hallazgos', 'dirección', 'reincidencia'],
    estimatedTimeSavedMinutes: 90,
  },
  {
    id: 'wf-007',
    name: 'Documento aprobado → Notificar equipo',
    description: 'Informa a todo el equipo cuando se aprueba un documento de proceso',
    status: 'active',
    trigger: { type: 'document.approved', config: {} },
    conditions: [{ id: 'c1', field: 'document_type', operator: 'in', value: ['procedimiento', 'instructivo'] }],
    actions: [
      { id: 'a1', type: 'send_notification', config: { recipient: 'team', message: '' } },
    ],
    createdAt: '2025-04-01T09:00:00Z',
    updatedAt: '2025-04-01T09:00:00Z',
    executionCount: 22,
    successCount: 21,
    lastExecutedAt: '2026-05-22T07:30:00Z',
    tags: ['documentos', 'notificaciones'],
    estimatedTimeSavedMinutes: 10,
  },
  {
    id: 'wf-008',
    name: 'Score < 70% → Auditoría urgente',
    description: 'Score crítico activa una auditoría extraordinaria inmediata',
    status: 'inactive',
    trigger: { type: 'audit.low_score', config: { threshold: 70 } },
    conditions: [{ id: 'c1', field: 'compliance_score', operator: 'lt', value: 70 }],
    actions: [
      { id: 'a1', type: 'create_audit', config: { audit_type: 'extraordinaria', days_from_now: 3 } },
      { id: 'a2', type: 'send_notification', config: { recipient: 'admin', message: 'URGENTE: Score crítico detectado' } },
      { id: 'a3', type: 'generate_report', config: { report_type: 'compliance' } },
    ],
    createdAt: '2025-04-10T10:00:00Z',
    updatedAt: '2025-04-10T10:00:00Z',
    executionCount: 2,
    successCount: 2,
    lastExecutedAt: '2026-04-15T09:00:00Z',
    tags: ['auditorías', 'urgente', 'compliance'],
    estimatedTimeSavedMinutes: 120,
  },
  {
    id: 'wf-009',
    name: 'CAPA cerrada → Verificación 30 días',
    description: 'Programa verificación de efectividad 30 días después del cierre',
    status: 'active',
    trigger: { type: 'capa.closed', config: {} },
    conditions: [],
    actions: [
      { id: 'a1', type: 'create_task', config: { title: 'Verificar efectividad de acción CAPA', due_days: 30 } },
      { id: 'a2', type: 'send_notification', config: { recipient: 'responsible', message: '' } },
    ],
    createdAt: '2025-04-20T11:00:00Z',
    updatedAt: '2025-05-12T14:00:00Z',
    executionCount: 14,
    successCount: 14,
    lastExecutedAt: '2026-05-21T13:00:00Z',
    tags: ['capa', 'verificación'],
    estimatedTimeSavedMinutes: 25,
  },
  {
    id: 'wf-010',
    name: 'Nueva versión → Archivar anterior',
    description: 'Cambia el estado del documento previo al crear una nueva versión',
    status: 'active',
    trigger: { type: 'document.new_version', config: {} },
    conditions: [{ id: 'c1', field: 'document_type', operator: 'neq', value: 'formato' }],
    actions: [
      { id: 'a1', type: 'change_status', config: { new_status: 'closed' } },
      { id: 'a2', type: 'send_notification', config: { recipient: 'team', message: '' } },
    ],
    createdAt: '2025-05-01T10:00:00Z',
    updatedAt: '2025-05-01T10:00:00Z',
    executionCount: 18,
    successCount: 18,
    lastExecutedAt: '2026-05-22T06:00:00Z',
    tags: ['documentos', 'versiones'],
    estimatedTimeSavedMinutes: 12,
  },
]

// ── Storage helpers ───────────────────────────────────────────────────────────

function loadWorkflows(): Workflow[] {
  if (typeof window === 'undefined') return DEMO_WORKFLOWS
  try {
    const raw = localStorage.getItem(WORKFLOWS_KEY)
    if (!raw) {
      localStorage.setItem(WORKFLOWS_KEY, JSON.stringify(DEMO_WORKFLOWS))
      return DEMO_WORKFLOWS
    }
    return JSON.parse(raw) as Workflow[]
  } catch {
    return DEMO_WORKFLOWS
  }
}

function saveWorkflows(workflows: Workflow[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(WORKFLOWS_KEY, JSON.stringify(workflows))
}

function loadExecutions(): WorkflowExecution[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(EXECUTIONS_KEY)
    if (!raw) {
      const executions = generateMockExecutions(DEMO_WORKFLOWS)
      localStorage.setItem(EXECUTIONS_KEY, JSON.stringify(executions))
      return executions
    }
    return JSON.parse(raw) as WorkflowExecution[]
  } catch {
    return []
  }
}

function saveExecutions(executions: WorkflowExecution[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(EXECUTIONS_KEY, JSON.stringify(executions))
}

// ── Service API ───────────────────────────────────────────────────────────────

export const WorkflowService = {
  getAll(): Workflow[] {
    return loadWorkflows()
  },

  getById(id: string): Workflow | null {
    return loadWorkflows().find((w) => w.id === id) ?? null
  },

  create(data: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt' | 'executionCount' | 'successCount' | 'lastExecutedAt'>): Workflow {
    const workflows = loadWorkflows()
    const workflow: Workflow = {
      ...data,
      id: `wf-${randomId()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      executionCount: 0,
      successCount: 0,
      lastExecutedAt: null,
    }
    saveWorkflows([...workflows, workflow])
    return workflow
  },

  update(id: string, data: Partial<Workflow>): Workflow | null {
    const workflows = loadWorkflows()
    const idx = workflows.findIndex((w) => w.id === id)
    if (idx === -1) return null
    const updated = { ...workflows[idx], ...data, updatedAt: new Date().toISOString() }
    workflows[idx] = updated
    saveWorkflows(workflows)
    return updated
  },

  delete(id: string): void {
    const workflows = loadWorkflows().filter((w) => w.id !== id)
    saveWorkflows(workflows)
  },

  toggleStatus(id: string): Workflow | null {
    const wf = loadWorkflows().find((w) => w.id === id)
    if (!wf) return null
    const newStatus = wf.status === 'active' ? 'inactive' : 'active'
    return WorkflowService.update(id, { status: newStatus })
  },

  getExecutions(workflowId?: string): WorkflowExecution[] {
    const all = loadExecutions()
    return workflowId ? all.filter((e) => e.workflowId === workflowId) : all
  },

  addExecution(execution: WorkflowExecution): void {
    const executions = loadExecutions()
    saveExecutions([execution, ...executions])

    // Update workflow stats
    const workflows = loadWorkflows()
    const idx = workflows.findIndex((w) => w.id === execution.workflowId)
    if (idx !== -1) {
      workflows[idx].executionCount += 1
      if (execution.status === 'success') workflows[idx].successCount += 1
      workflows[idx].lastExecutedAt = execution.executedAt
      workflows[idx].updatedAt = new Date().toISOString()
      saveWorkflows(workflows)
    }
  },

  getStats(): AutomationStats {
    const workflows = loadWorkflows()
    const executions = loadExecutions()
    const now = Date.now()
    const todayStart = new Date().setHours(0, 0, 0, 0)
    const weekStart = now - 7 * 24 * 3600_000

    const executionsToday = executions.filter((e) => new Date(e.executedAt).getTime() >= todayStart).length
    const executionsThisWeek = executions.filter((e) => new Date(e.executedAt).getTime() >= weekStart).length
    const successCount = executions.filter((e) => e.status === 'success').length
    const errorCount = executions.filter((e) => e.status === 'failed').length
    const successRate = executions.length > 0 ? Math.round((successCount / executions.length) * 100) : 0
    const totalTimeSaved = workflows.reduce((sum, wf) => sum + wf.successCount * wf.estimatedTimeSavedMinutes, 0)

    return {
      totalWorkflows: workflows.length,
      activeWorkflows: workflows.filter((w) => w.status === 'active').length,
      executionsToday,
      executionsThisWeek,
      successRate,
      totalTimeSavedMinutes: totalTimeSaved,
      errorCount,
    }
  },

  reset(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(WORKFLOWS_KEY)
    localStorage.removeItem(EXECUTIONS_KEY)
  },
}
