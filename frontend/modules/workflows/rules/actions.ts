import { ActionType } from '../types'

export interface ActionDef {
  type: ActionType
  label: string
  description: string
  icon: string
  color: string
  configFields: ActionConfigField[]
}

export interface ActionConfigField {
  key: string
  label: string
  type: 'text' | 'select' | 'number' | 'textarea'
  options?: { value: string; label: string }[]
  placeholder?: string
}

export const ACTION_DEFS: ActionDef[] = [
  {
    type: 'send_notification',
    label: 'Enviar notificación',
    description: 'Envía una alerta al responsable o equipo',
    icon: '🔔',
    color: '#6366f1',
    configFields: [
      {
        key: 'recipient',
        label: 'Destinatario',
        type: 'select',
        options: [
          { value: 'responsible', label: 'Responsable del elemento' },
          { value: 'coordinador_sig', label: 'Coordinador SIG' },
          { value: 'admin', label: 'Administrador' },
          { value: 'team', label: 'Todo el equipo' },
        ],
      },
      { key: 'message', label: 'Mensaje personalizado', type: 'textarea', placeholder: 'Dejar vacío para mensaje automático' },
    ],
  },
  {
    type: 'create_capa',
    label: 'Crear acción CAPA',
    description: 'Genera automáticamente una acción correctiva',
    icon: '⚡',
    color: '#10b981',
    configFields: [
      { key: 'title', label: 'Título de la CAPA', type: 'text', placeholder: 'Se genera automáticamente si vacío' },
      {
        key: 'due_days',
        label: 'Días para completar',
        type: 'number',
      },
      {
        key: 'assign_to',
        label: 'Asignar a',
        type: 'select',
        options: [
          { value: 'responsible', label: 'Responsable del hallazgo' },
          { value: 'coordinador_sig', label: 'Coordinador SIG' },
          { value: 'lider_proceso', label: 'Líder de proceso' },
        ],
      },
    ],
  },
  {
    type: 'create_audit',
    label: 'Crear auditoría',
    description: 'Genera una nueva auditoría de seguimiento',
    icon: '📋',
    color: '#3b82f6',
    configFields: [
      {
        key: 'audit_type',
        label: 'Tipo de auditoría',
        type: 'select',
        options: [
          { value: 'seguimiento', label: 'Seguimiento' },
          { value: 'interna', label: 'Interna' },
          { value: 'extraordinaria', label: 'Extraordinaria' },
        ],
      },
      { key: 'days_from_now', label: 'Programar en N días', type: 'number' },
    ],
  },
  {
    type: 'change_status',
    label: 'Cambiar estado',
    description: 'Actualiza el estado del elemento que disparó el workflow',
    icon: '🔄',
    color: '#8b5cf6',
    configFields: [
      {
        key: 'new_status',
        label: 'Nuevo estado',
        type: 'select',
        options: [
          { value: 'in_progress', label: 'En progreso' },
          { value: 'under_review', label: 'En revisión' },
          { value: 'escalated', label: 'Escalado' },
          { value: 'closed', label: 'Cerrado' },
        ],
      },
    ],
  },
  {
    type: 'generate_report',
    label: 'Generar reporte',
    description: 'Genera y guarda un reporte ejecutivo automáticamente',
    icon: '📊',
    color: '#ec4899',
    configFields: [
      {
        key: 'report_type',
        label: 'Tipo de reporte',
        type: 'select',
        options: [
          { value: 'executive', label: 'Resumen ejecutivo' },
          { value: 'compliance', label: 'Informe de compliance' },
          { value: 'findings', label: 'Informe de hallazgos' },
          { value: 'capa', label: 'Estado de CAPA' },
        ],
      },
    ],
  },
  {
    type: 'assign_user',
    label: 'Asignar usuario',
    description: 'Reasigna el elemento a un rol o usuario específico',
    icon: '👤',
    color: '#f59e0b',
    configFields: [
      {
        key: 'assign_to',
        label: 'Asignar a',
        type: 'select',
        options: [
          { value: 'coordinador_sig', label: 'Coordinador SIG' },
          { value: 'lider_proceso', label: 'Líder de proceso' },
          { value: 'auditor', label: 'Auditor' },
          { value: 'admin', label: 'Administrador' },
        ],
      },
    ],
  },
  {
    type: 'create_task',
    label: 'Crear tarea',
    description: 'Registra una tarea de seguimiento en el sistema',
    icon: '✅',
    color: '#14b8a6',
    configFields: [
      { key: 'title', label: 'Título de la tarea', type: 'text', placeholder: 'Tarea generada por workflow' },
      { key: 'due_days', label: 'Días para completar', type: 'number' },
    ],
  },
]

export function getActionDef(type: ActionType): ActionDef {
  return ACTION_DEFS.find((a) => a.type === type) ?? ACTION_DEFS[0]
}
