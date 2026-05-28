'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { WorkflowService } from '../services/workflow.service'
import { Workflow, WorkflowExecution } from '../types'
import { executeWorkflow } from '../engine/executor'

export const WORKFLOW_KEYS = {
  all: ['workflows'] as const,
  executions: (id?: string) => ['workflow-executions', id ?? 'all'] as const,
  stats: ['workflow-stats'] as const,
}

export function useWorkflows() {
  return useQuery({
    queryKey: WORKFLOW_KEYS.all,
    queryFn: () => WorkflowService.getAll(),
    staleTime: 0,
  })
}

export function useWorkflowStats() {
  return useQuery({
    queryKey: WORKFLOW_KEYS.stats,
    queryFn: () => WorkflowService.getStats(),
    staleTime: 30_000,
  })
}

export function useWorkflowExecutions(workflowId?: string) {
  return useQuery({
    queryKey: WORKFLOW_KEYS.executions(workflowId),
    queryFn: () => WorkflowService.getExecutions(workflowId),
    staleTime: 10_000,
  })
}

export function useCreateWorkflow() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt' | 'executionCount' | 'successCount' | 'lastExecutedAt'>) =>
      WorkflowService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: WORKFLOW_KEYS.all })
      qc.invalidateQueries({ queryKey: WORKFLOW_KEYS.stats })
    },
  })
}

export function useUpdateWorkflow() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Workflow> }) =>
      WorkflowService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: WORKFLOW_KEYS.all })
      qc.invalidateQueries({ queryKey: WORKFLOW_KEYS.stats })
    },
  })
}

export function useDeleteWorkflow() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => { WorkflowService.delete(id); return id },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: WORKFLOW_KEYS.all })
      qc.invalidateQueries({ queryKey: WORKFLOW_KEYS.stats })
    },
  })
}

export function useToggleWorkflow() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => WorkflowService.toggleStatus(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: WORKFLOW_KEYS.all })
      qc.invalidateQueries({ queryKey: WORKFLOW_KEYS.stats })
    },
  })
}

export function useRunWorkflow() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (workflow: Workflow): Promise<WorkflowExecution> => {
      const execution = executeWorkflow(workflow)
      WorkflowService.addExecution(execution)
      return execution
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: WORKFLOW_KEYS.all })
      qc.invalidateQueries({ queryKey: WORKFLOW_KEYS.executions() })
      qc.invalidateQueries({ queryKey: WORKFLOW_KEYS.stats })
    },
  })
}
