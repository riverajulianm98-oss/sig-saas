import { ConditionField, ConditionOperator } from '../types'

export interface ConditionFieldDef {
  field: ConditionField
  label: string
  type: 'string' | 'number' | 'enum'
  operators: ConditionOperator[]
  options?: { value: string; label: string }[]
}

export const CONDITION_FIELDS: ConditionFieldDef[] = [
  {
    field: 'severity',
    label: 'Severidad',
    type: 'enum',
    operators: ['eq', 'neq', 'in'],
    options: [
      { value: 'baja', label: 'Baja' },
      { value: 'media', label: 'Media' },
      { value: 'alta', label: 'Alta' },
      { value: 'critica', label: 'Crítica' },
    ],
  },
  {
    field: 'compliance_score',
    label: 'Score de compliance (%)',
    type: 'number',
    operators: ['lt', 'lte', 'gt', 'gte', 'eq'],
  },
  {
    field: 'process_area',
    label: 'Área de proceso',
    type: 'enum',
    operators: ['eq', 'neq', 'in'],
    options: [
      { value: 'Calidad', label: 'Calidad' },
      { value: 'HSEQ', label: 'HSEQ' },
      { value: 'Medio Ambiente', label: 'Medio Ambiente' },
      { value: 'Producción', label: 'Producción' },
      { value: 'Compras', label: 'Compras' },
      { value: 'RRHH', label: 'RRHH' },
      { value: 'Dirección', label: 'Dirección' },
    ],
  },
  {
    field: 'days_until_expiry',
    label: 'Días hasta vencimiento',
    type: 'number',
    operators: ['lt', 'lte', 'gt', 'gte'],
  },
  {
    field: 'document_type',
    label: 'Tipo de documento',
    type: 'enum',
    operators: ['eq', 'neq'],
    options: [
      { value: 'procedimiento', label: 'Procedimiento' },
      { value: 'instructivo', label: 'Instructivo' },
      { value: 'politica', label: 'Política' },
      { value: 'manual', label: 'Manual' },
      { value: 'formato', label: 'Formato' },
    ],
  },
  {
    field: 'audit_type',
    label: 'Tipo de auditoría',
    type: 'enum',
    operators: ['eq', 'neq'],
    options: [
      { value: 'interna', label: 'Interna' },
      { value: 'externa', label: 'Externa' },
      { value: 'seguimiento', label: 'Seguimiento' },
    ],
  },
  {
    field: 'classification',
    label: 'Clasificación del hallazgo',
    type: 'enum',
    operators: ['eq', 'neq'],
    options: [
      { value: 'no_conformidad', label: 'No conformidad' },
      { value: 'observacion', label: 'Observación' },
      { value: 'oportunidad_mejora', label: 'Oportunidad de mejora' },
    ],
  },
]

export const OPERATOR_LABELS: Record<ConditionOperator, string> = {
  eq: 'es igual a',
  neq: 'no es igual a',
  lt: 'es menor que',
  lte: 'es menor o igual que',
  gt: 'es mayor que',
  gte: 'es mayor o igual que',
  contains: 'contiene',
  in: 'está en',
}

export function getConditionFieldDef(field: ConditionField): ConditionFieldDef {
  return CONDITION_FIELDS.find((f) => f.field === field) ?? CONDITION_FIELDS[0]
}

export function describeCondition(field: ConditionField, operator: ConditionOperator, value: string | number | string[]): string {
  const fieldDef = getConditionFieldDef(field)
  const opLabel = OPERATOR_LABELS[operator]
  const displayValue = Array.isArray(value)
    ? value.join(', ')
    : (fieldDef.options?.find((o) => o.value === value)?.label ?? String(value))
  return `${fieldDef.label} ${opLabel} "${displayValue}"`
}
