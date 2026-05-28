export type TriggerType =
  | 'document.expiring'
  | 'document.approved'
  | 'document.new_version'
  | 'audit.completed'
  | 'audit.low_score'
  | 'finding.critical'
  | 'finding.recurrence'
  | 'capa.overdue'
  | 'capa.closed'

export type ConditionField =
  | 'severity'
  | 'compliance_score'
  | 'process_area'
  | 'days_until_expiry'
  | 'document_type'
  | 'audit_type'
  | 'classification'

export type ConditionOperator = 'eq' | 'neq' | 'lt' | 'lte' | 'gt' | 'gte' | 'contains' | 'in'

export type ActionType =
  | 'create_capa'
  | 'change_status'
  | 'send_notification'
  | 'generate_report'
  | 'create_audit'
  | 'assign_user'
  | 'create_task'

export interface WorkflowTrigger {
  type: TriggerType
  config: Record<string, unknown>
}

export interface WorkflowCondition {
  id: string
  field: ConditionField
  operator: ConditionOperator
  value: string | number | string[]
}

export interface WorkflowAction {
  id: string
  type: ActionType
  config: Record<string, unknown>
}

export type WorkflowStatus = 'active' | 'inactive' | 'draft'

export interface Workflow {
  id: string
  name: string
  description: string
  status: WorkflowStatus
  trigger: WorkflowTrigger
  conditions: WorkflowCondition[]
  actions: WorkflowAction[]
  createdAt: string
  updatedAt: string
  executionCount: number
  successCount: number
  lastExecutedAt: string | null
  tags: string[]
  estimatedTimeSavedMinutes: number
}

export type ExecutionStatus = 'success' | 'failed' | 'skipped'

export interface WorkflowExecution {
  id: string
  workflowId: string
  workflowName: string
  triggeredBy: string
  status: ExecutionStatus
  durationMs: number
  executedAt: string
  result: string
  actionsExecuted: string[]
  conditionsMatched: boolean
}

export interface AutomationStats {
  totalWorkflows: number
  activeWorkflows: number
  executionsToday: number
  executionsThisWeek: number
  successRate: number
  totalTimeSavedMinutes: number
  errorCount: number
}
