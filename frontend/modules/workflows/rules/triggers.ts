import { TriggerType } from '../types'

export interface TriggerDef {
  type: TriggerType
  label: string
  description: string
  icon: string
  module: 'documents' | 'audits' | 'findings' | 'capa'
  color: string
  configFields: TriggerConfigField[]
}

export interface TriggerConfigField {
  key: string
  label: string
  type: 'number' | 'select' | 'text'
  options?: { value: string; label: string }[]
  defaultValue?: string | number
}

export const TRIGGER_DEFS: TriggerDef[] = [
  {
    type: 'document.expiring',
    label: 'Documento por vencer',
    description: 'Se activa cuando un documento está próximo a vencer',
    icon: '📄',
    module: 'documents',
    color: '#f59e0b',
    configFields: [
      { key: 'days_before', label: 'Días de anticipación', type: 'number', defaultValue: 7 },
    ],
  },
  {
    type: 'document.approved',
    label: 'Documento aprobado',
    description: 'Se activa cuando un documento es aprobado',
    icon: '✅',
    module: 'documents',
    color: '#10b981',
    configFields: [],
  },
  {
    type: 'document.new_version',
    label: 'Nueva versión de documento',
    description: 'Se activa cuando se crea una nueva versión',
    icon: '🔄',
    module: 'documents',
    color: '#6366f1',
    configFields: [],
  },
  {
    type: 'audit.completed',
    label: 'Auditoría finalizada',
    description: 'Se activa cuando una auditoría cambia a estado completado',
    icon: '🎯',
    module: 'audits',
    color: '#3b82f6',
    configFields: [],
  },
  {
    type: 'audit.low_score',
    label: 'Score de auditoría bajo',
    description: 'Se activa cuando el compliance score cae por debajo del umbral',
    icon: '⚠️',
    module: 'audits',
    color: '#ef4444',
    configFields: [
      { key: 'threshold', label: 'Umbral (%)', type: 'number', defaultValue: 80 },
    ],
  },
  {
    type: 'finding.critical',
    label: 'Hallazgo crítico registrado',
    description: 'Se activa al crear un hallazgo de severidad crítica',
    icon: '🚨',
    module: 'findings',
    color: '#dc2626',
    configFields: [],
  },
  {
    type: 'finding.recurrence',
    label: 'Hallazgo reincidente',
    description: 'Se activa cuando se detecta un hallazgo con reincidencia',
    icon: '🔁',
    module: 'findings',
    color: '#9333ea',
    configFields: [
      { key: 'recurrence_count', label: 'Número de reincidencias', type: 'number', defaultValue: 2 },
    ],
  },
  {
    type: 'capa.overdue',
    label: 'CAPA vencida',
    description: 'Se activa cuando una acción CAPA supera su fecha límite',
    icon: '⏰',
    module: 'capa',
    color: '#ea580c',
    configFields: [
      { key: 'grace_days', label: 'Días de gracia', type: 'number', defaultValue: 0 },
    ],
  },
  {
    type: 'capa.closed',
    label: 'CAPA cerrada',
    description: 'Se activa cuando una acción CAPA se marca como completada',
    icon: '✔️',
    module: 'capa',
    color: '#16a34a',
    configFields: [],
  },
]

export function getTriggerDef(type: TriggerType): TriggerDef {
  return TRIGGER_DEFS.find((t) => t.type === type) ?? TRIGGER_DEFS[0]
}
