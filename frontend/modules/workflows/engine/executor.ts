import { Workflow, WorkflowExecution, ExecutionStatus } from '../types'
import { getActionDef } from '../rules/actions'
import { getTriggerDef } from '../rules/triggers'

function randomId() {
  return Math.random().toString(36).slice(2, 10)
}

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function executeWorkflow(
  workflow: Workflow,
  context: Record<string, unknown> = {}
): WorkflowExecution {
  const start = Date.now()

  // Simulate condition evaluation
  const conditionsMatched = workflow.conditions.length === 0 || Math.random() > 0.15

  let status: ExecutionStatus = 'success'
  let result = ''
  const actionsExecuted: string[] = []

  if (!conditionsMatched) {
    status = 'skipped'
    result = 'Condiciones no cumplidas — workflow omitido'
  } else {
    // Simulate action execution (5% failure rate)
    const failed = Math.random() < 0.05
    if (failed) {
      status = 'failed'
      result = 'Error al ejecutar acción: timeout de conexión'
    } else {
      workflow.actions.forEach((action) => {
        const def = getActionDef(action.type)
        actionsExecuted.push(def.label)
      })
      result = `${actionsExecuted.length} acción(es) ejecutada(s): ${actionsExecuted.join(', ')}`
    }
  }

  const durationMs = randomBetween(120, 850)
  const triggerDef = getTriggerDef(workflow.trigger.type)

  return {
    id: randomId(),
    workflowId: workflow.id,
    workflowName: workflow.name,
    triggeredBy: context.triggeredBy as string ?? triggerDef.label,
    status,
    durationMs,
    executedAt: new Date().toISOString(),
    result,
    actionsExecuted,
    conditionsMatched,
  }
}

// Generate historical mock executions for demo
export function generateMockExecutions(workflows: Workflow[]): WorkflowExecution[] {
  const executions: WorkflowExecution[] = []
  const now = Date.now()

  workflows.forEach((wf) => {
    const count = randomBetween(3, 12)
    for (let i = 0; i < count; i++) {
      const hoursAgo = randomBetween(1, 168) // within last 7 days
      const executedAt = new Date(now - hoursAgo * 3600_000).toISOString()
      const rand = Math.random()
      const status: ExecutionStatus = rand < 0.78 ? 'success' : rand < 0.90 ? 'skipped' : 'failed'
      const conditionsMatched = status !== 'skipped'

      const actionsExecuted = conditionsMatched
        ? wf.actions.map((a) => getActionDef(a.type).label)
        : []

      const triggerDef = getTriggerDef(wf.trigger.type)

      executions.push({
        id: randomId(),
        workflowId: wf.id,
        workflowName: wf.name,
        triggeredBy: triggerDef.label,
        status,
        durationMs: randomBetween(80, 920),
        executedAt,
        result: status === 'success'
          ? `${actionsExecuted.length} acción(es): ${actionsExecuted.join(', ')}`
          : status === 'skipped'
          ? 'Condiciones no cumplidas'
          : 'Error: timeout al ejecutar acción',
        actionsExecuted,
        conditionsMatched,
      })
    }
  })

  return executions.sort((a, b) => new Date(b.executedAt).getTime() - new Date(a.executedAt).getTime())
}
