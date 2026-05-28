'use client'

import { useState } from 'react'
import { Plus, Play, Save, ChevronDown, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Workflow, WorkflowCondition, WorkflowAction, TriggerType, ConditionField, ConditionOperator, ActionType } from '../types'
import { WorkflowBlock, BlockConnector } from './workflow-block'
import { TRIGGER_DEFS, getTriggerDef } from '../rules/triggers'
import { CONDITION_FIELDS, OPERATOR_LABELS, getConditionFieldDef } from '../rules/conditions'
import { ACTION_DEFS, getActionDef } from '../rules/actions'

function randomId() {
  return Math.random().toString(36).slice(2, 9)
}

// ── Generic config field renderer ─────────────────────────────────────────────

function ConfigField({
  field,
  value,
  onChange,
}: {
  field: { key: string; label: string; type: string; options?: { value: string; label: string }[]; placeholder?: string }
  value: unknown
  onChange: (v: unknown) => void
}) {
  const base = 'w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]'
  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-[hsl(var(--muted-foreground))]">{field.label}</label>
      {field.type === 'select' ? (
        <select value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} className={base}>
          {field.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : field.type === 'textarea' ? (
        <textarea
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={2}
          className={cn(base, 'resize-none')}
        />
      ) : (
        <input
          type={field.type === 'number' ? 'number' : 'text'}
          value={String(value ?? '')}
          onChange={(e) => onChange(field.type === 'number' ? Number(e.target.value) : e.target.value)}
          placeholder={field.placeholder}
          className={base}
        />
      )}
    </div>
  )
}

// ── Add-item picker panel ─────────────────────────────────────────────────────

function TriggerPicker({ value, onChange }: { value: TriggerType; onChange: (t: TriggerType) => void }) {
  const grouped = TRIGGER_DEFS.reduce<Record<string, typeof TRIGGER_DEFS>>((acc, t) => {
    acc[t.module] = [...(acc[t.module] ?? []), t]
    return acc
  }, {})
  const moduleLabels: Record<string, string> = { documents: 'Documentos', audits: 'Auditorías', findings: 'Hallazgos', capa: 'CAPA' }

  return (
    <div className="space-y-3">
      {Object.entries(grouped).map(([mod, triggers]) => (
        <div key={mod}>
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))]">{moduleLabels[mod]}</p>
          <div className="space-y-1">
            {triggers.map((t) => (
              <button
                key={t.type}
                onClick={() => onChange(t.type)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                  value === t.type
                    ? 'bg-blue-50 dark:bg-blue-950 font-medium text-blue-700 dark:text-blue-300'
                    : 'hover:bg-[hsl(var(--accent))]'
                )}
              >
                <span className="text-base">{t.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{t.label}</div>
                  <div className="truncate text-xs text-[hsl(var(--muted-foreground))]">{t.description}</div>
                </div>
                {value === t.type && <div className="h-2 w-2 shrink-0 rounded-full bg-blue-500" />}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function ActionPicker({ onSelect }: { onSelect: (t: ActionType) => void }) {
  return (
    <div className="space-y-1">
      {ACTION_DEFS.map((a) => (
        <button
          key={a.type}
          onClick={() => onSelect(a.type)}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-[hsl(var(--accent))] transition-colors"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-base" style={{ background: a.color + '22' }}>
            {a.icon}
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate font-medium">{a.label}</div>
            <div className="truncate text-xs text-[hsl(var(--muted-foreground))]">{a.description}</div>
          </div>
        </button>
      ))}
    </div>
  )
}

// ── Condition form ────────────────────────────────────────────────────────────

function ConditionForm({
  condition,
  onChange,
}: {
  condition: WorkflowCondition
  onChange: (c: WorkflowCondition) => void
}) {
  const fieldDef = getConditionFieldDef(condition.field)
  const base = 'rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]'

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={condition.field}
        onChange={(e) => {
          const newField = e.target.value as ConditionField
          const newDef = getConditionFieldDef(newField)
          onChange({ ...condition, field: newField, operator: newDef.operators[0], value: '' })
        }}
        className={base}
      >
        {CONDITION_FIELDS.map((f) => <option key={f.field} value={f.field}>{f.label}</option>)}
      </select>

      <select
        value={condition.operator}
        onChange={(e) => onChange({ ...condition, operator: e.target.value as ConditionOperator })}
        className={base}
      >
        {fieldDef.operators.map((op) => <option key={op} value={op}>{OPERATOR_LABELS[op]}</option>)}
      </select>

      {fieldDef.type === 'enum' && fieldDef.options ? (
        <select
          value={String(condition.value)}
          onChange={(e) => onChange({ ...condition, value: e.target.value })}
          className={base}
        >
          {fieldDef.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : (
        <input
          type={fieldDef.type === 'number' ? 'number' : 'text'}
          value={String(condition.value)}
          onChange={(e) => onChange({
            ...condition,
            value: fieldDef.type === 'number' ? Number(e.target.value) : e.target.value,
          })}
          placeholder="valor..."
          className={cn(base, 'w-28')}
        />
      )}
    </div>
  )
}

// ── Main builder ──────────────────────────────────────────────────────────────

export interface WorkflowBuilderProps {
  initial?: Partial<Workflow>
  onSave: (data: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt' | 'executionCount' | 'successCount' | 'lastExecutedAt'>) => void
  onRun?: () => void
  saving?: boolean
  isExisting?: boolean
}

export function WorkflowBuilder({ initial, onSave, onRun, saving, isExisting }: WorkflowBuilderProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [triggerType, setTriggerType] = useState<TriggerType>(initial?.trigger?.type ?? 'document.expiring')
  const [triggerConfig, setTriggerConfig] = useState<Record<string, unknown>>(
    (initial?.trigger?.config as Record<string, unknown>) ?? {}
  )
  const [conditions, setConditions] = useState<WorkflowCondition[]>(initial?.conditions ?? [])
  const [actions, setActions] = useState<WorkflowAction[]>(initial?.actions ?? [{ id: randomId(), type: 'send_notification', config: { recipient: 'responsible', message: '' } }])
  const [showActionPicker, setShowActionPicker] = useState(false)

  const triggerDef = getTriggerDef(triggerType)

  function addCondition() {
    const field = CONDITION_FIELDS[0]
    setConditions((prev) => [...prev, { id: randomId(), field: field.field, operator: field.operators[0], value: '' }])
  }

  function removeCondition(id: string) {
    setConditions((prev) => prev.filter((c) => c.id !== id))
  }

  function addAction(type: ActionType) {
    const def = getActionDef(type)
    const config: Record<string, unknown> = {}
    def.configFields.forEach((f) => { config[f.key] = f.type === 'number' ? 0 : '' })
    setActions((prev) => [...prev, { id: randomId(), type, config }])
    setShowActionPicker(false)
  }

  function removeAction(id: string) {
    setActions((prev) => prev.filter((a) => a.id !== id))
  }

  function handleSave() {
    if (!name.trim()) return
    onSave({
      name: name.trim(),
      description: description.trim(),
      status: initial?.status ?? 'active',
      trigger: { type: triggerType, config: triggerConfig },
      conditions,
      actions,
      tags: initial?.tags ?? [],
      estimatedTimeSavedMinutes: initial?.estimatedTimeSavedMinutes ?? 15,
    })
  }

  const canSave = name.trim().length > 0 && actions.length > 0

  return (
    <div className="flex h-full flex-col">
      {/* Top bar */}
      <div className="flex items-center gap-3 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] px-5 py-3">
        <div className="flex-1 min-w-0">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre de la automatización..."
            className="w-full bg-transparent text-base font-semibold placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none"
          />
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descripción breve (opcional)"
            className="w-full bg-transparent text-xs text-[hsl(var(--muted-foreground))] placeholder:text-[hsl(var(--muted-foreground))]/60 focus:outline-none mt-0.5"
          />
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {isExisting && onRun && (
            <button
              onClick={onRun}
              className="flex items-center gap-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950 px-3 py-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors"
            >
              <Play className="h-3.5 w-3.5" /> Ejecutar
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!canSave || saving}
            className="flex items-center gap-1.5 rounded-lg bg-[hsl(var(--primary))] px-3 py-1.5 text-sm font-medium text-[hsl(var(--primary-foreground))] hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            <Save className="h-3.5 w-3.5" /> {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-y-auto p-5">
        <div className="mx-auto max-w-xl space-y-0">

          {/* ── TRIGGER ── */}
          <WorkflowBlock
            type="trigger"
            icon={triggerDef.icon}
            title={triggerDef.label}
            subtitle={triggerDef.description}
            color={triggerDef.color}
            defaultOpen
          >
            <div className="space-y-3">
              <TriggerPicker value={triggerType} onChange={(t) => {
                setTriggerType(t)
                setTriggerConfig({})
              }} />
              {getTriggerDef(triggerType).configFields.map((f) => (
                <ConfigField
                  key={f.key}
                  field={f}
                  value={triggerConfig[f.key] ?? f.defaultValue ?? ''}
                  onChange={(v) => setTriggerConfig((prev) => ({ ...prev, [f.key]: v }))}
                />
              ))}
            </div>
          </WorkflowBlock>

          {/* ── CONDITIONS ── */}
          {conditions.length > 0 && (
            <>
              <BlockConnector label="SI" />
              {conditions.map((cond, i) => (
                <div key={cond.id}>
                  <WorkflowBlock
                    type="condition"
                    icon="🔍"
                    title={`Condición ${i + 1}`}
                    subtitle={`${CONDITION_FIELDS.find((f) => f.field === cond.field)?.label ?? cond.field} ${OPERATOR_LABELS[cond.operator]} "${cond.value}"`}
                    color="#f59e0b"
                    removable
                    onRemove={() => removeCondition(cond.id)}
                    defaultOpen={i === conditions.length - 1}
                  >
                    <ConditionForm condition={cond} onChange={(updated) => setConditions((prev) => prev.map((c) => c.id === updated.id ? updated : c))} />
                  </WorkflowBlock>
                  {i < conditions.length - 1 && <BlockConnector label="Y" />}
                </div>
              ))}
            </>
          )}

          {/* Add condition */}
          <div className="flex justify-center py-1">
            <button
              onClick={addCondition}
              className="flex items-center gap-1.5 rounded-lg border border-dashed border-amber-300 dark:border-amber-700 px-4 py-1.5 text-xs font-medium text-amber-600 dark:text-amber-400 hover:border-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950 transition-colors"
            >
              <Plus className="h-3 w-3" /> Agregar condición
            </button>
          </div>

          {/* ── ACTIONS ── */}
          <BlockConnector label="ENTONCES" />
          {actions.map((action, i) => {
            const def = getActionDef(action.type)
            return (
              <div key={action.id}>
                <WorkflowBlock
                  type="action"
                  icon={def.icon}
                  title={def.label}
                  subtitle={def.description}
                  color={def.color}
                  removable={actions.length > 1}
                  onRemove={() => removeAction(action.id)}
                  defaultOpen={i === actions.length - 1}
                >
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-[hsl(var(--muted-foreground))]">Tipo de acción</label>
                      <select
                        value={action.type}
                        onChange={(e) => {
                          const newType = e.target.value as ActionType
                          const newDef = getActionDef(newType)
                          const newConfig: Record<string, unknown> = {}
                          newDef.configFields.forEach((f) => { newConfig[f.key] = f.type === 'number' ? 0 : '' })
                          setActions((prev) => prev.map((a) => a.id === action.id ? { ...a, type: newType, config: newConfig } : a))
                        }}
                        className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"
                      >
                        {ACTION_DEFS.map((a) => <option key={a.type} value={a.type}>{a.icon} {a.label}</option>)}
                      </select>
                    </div>
                    {def.configFields.map((f) => (
                      <ConfigField
                        key={f.key}
                        field={f}
                        value={action.config[f.key] ?? ''}
                        onChange={(v) => setActions((prev) => prev.map((a) => a.id === action.id ? { ...a, config: { ...a.config, [f.key]: v } } : a))}
                      />
                    ))}
                  </div>
                </WorkflowBlock>
                {i < actions.length - 1 && <BlockConnector />}
              </div>
            )
          })}

          {/* Add action */}
          <BlockConnector />
          <div className="flex justify-center">
            <button
              onClick={() => setShowActionPicker((v) => !v)}
              className="flex items-center gap-1.5 rounded-lg border border-dashed border-emerald-300 dark:border-emerald-700 px-4 py-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950 transition-colors"
            >
              <Plus className="h-3 w-3" /> Agregar acción
              <ChevronDown className={cn('h-3 w-3 transition-transform', showActionPicker && 'rotate-180')} />
            </button>
          </div>
          {showActionPicker && (
            <div className="mt-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 shadow-md">
              <ActionPicker onSelect={addAction} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
