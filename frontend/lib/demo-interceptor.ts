import type { AxiosRequestConfig, AxiosResponse } from 'axios'
import {
  DEMO_DOCUMENTS_LIST, DEMO_DOCUMENTS, DEMO_AUDIT_DASHBOARD,
  DEMO_AUDITS_LIST, DEMO_AUDITS, DEMO_CHECKLIST, DEMO_FINDINGS,
  DEMO_SUGGESTIONS, DEMO_EVIDENCES, DEMO_COMPLIANCE, DEMO_TIMELINE,
  DEMO_TEMPLATES, DEMO_ME_RESPONSE, DEMO_LOGIN_RESPONSE, DEMO_MAIN_DASHBOARD,
  DEMO_ALL_FINDINGS, DEMO_CAPA_ACTIONS,
  DEMO_CAPA_DASHBOARD, DEMO_FINDINGS_DASHBOARD, DEMO_FINDING_TIMELINE,
  DEMO_EXECUTIVE_SUMMARY, DEMO_ANALYTICS_TRENDS, DEMO_PROCESS_HEATMAP,
  DEMO_CLAUSE_SCORES, DEMO_AI_INSIGHTS,
} from './demo-data'

function mockResponse(data: unknown, config: AxiosRequestConfig): AxiosResponse {
  return {
    data,
    status: 200,
    statusText: 'OK',
    headers: { 'content-type': 'application/json' },
    config: config as never,
    request: {},
  }
}

export function matchDemoData(url: string, method: string, params: Record<string, unknown>, body: unknown): unknown | null {
  // Auth
  if (url === '/auth/login' || url.endsWith('/auth/login')) return DEMO_LOGIN_RESPONSE
  if (url === '/auth/me' || url.endsWith('/auth/me')) return DEMO_ME_RESPONSE
  if (url === '/auth/refresh' || url.endsWith('/auth/refresh')) return DEMO_LOGIN_RESPONSE
  if (url === '/auth/logout' || url.endsWith('/auth/logout')) return { message: 'Logged out' }

  // ── Analytics / Executive Center ──────────────────────────────────────────
  if (url.match(/\/analytics\/executive/))     return DEMO_EXECUTIVE_SUMMARY
  if (url.match(/\/analytics\/trends/))        return DEMO_ANALYTICS_TRENDS
  if (url.match(/\/analytics\/process-heatmap/)) return DEMO_PROCESS_HEATMAP
  if (url.match(/\/analytics\/clause-scores/)) return DEMO_CLAUSE_SCORES
  if (url.match(/\/analytics\/insights/))      return DEMO_AI_INSIGHTS
  if (url.match(/\/reports\/generate/))        return { url: '#', filename: 'reporte_sigcya.pdf', message: 'Reporte generado exitosamente' }

  // ── Standalone Findings module ────────────────────────────────────────────
  if (url.match(/\/findings\/dashboard/)) return DEMO_FINDINGS_DASHBOARD

  // Finding actions (must match before /findings/:id)
  if (url.match(/\/findings\/[^/]+\/actions\/[^/]+\/status/)) {
    const parts = url.split('/')
    const aid = parts[parts.indexOf('actions') + 1]
    const action = DEMO_CAPA_ACTIONS.find((a) => a.id === aid) ?? DEMO_CAPA_ACTIONS[0]
    return { ...action, status: (body as Record<string, string>)?.status ?? action.status, updated_at: new Date().toISOString() }
  }
  if (url.match(/\/findings\/[^/]+\/actions\/[^/]+\/comments/)) {
    return { id: `cmt-${Date.now()}`, capa_id: url.split('/').find((_, i, a) => a[i - 1] === 'actions') ?? 'acc-001', user_id: 'demo-user-001', user_name: 'Alejandro Gómez', content: (body as Record<string, string>)?.content ?? '', created_at: new Date().toISOString() }
  }
  if (url.match(/\/findings\/[^/]+\/actions\/[^/]+/)) {
    const aid = url.split('/').pop()!
    const action = DEMO_CAPA_ACTIONS.find((a) => a.id === aid) ?? DEMO_CAPA_ACTIONS[0]
    if (method === 'patch') return { ...action, ...(body as object), updated_at: new Date().toISOString() }
    return action
  }
  if (url.match(/\/findings\/[^/]+\/actions/)) {
    const fid = url.split('/')[url.split('/').indexOf('findings') + 1]
    if (method === 'post') {
      const b = body as Record<string, unknown>
      const finding = DEMO_ALL_FINDINGS.find((f) => f.id === fid) ?? DEMO_ALL_FINDINGS[0]
      return { id: `acc-new-${Date.now()}`, tenant_id: 'demo-tenant-001', finding_id: fid, finding_code: finding.code, finding_title: finding.title, code: null, status: 'pendiente', responsible_user_id: null, responsible_name: null, verifier_user_id: null, verifier_name: null, due_date: null, start_date: null, completed_at: null, verified_at: null, effectiveness_score: null, comments_count: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), ...b }
    }
    return DEMO_CAPA_ACTIONS.filter((a) => a.finding_id === fid)
  }
  if (url.match(/\/findings\/[^/]+\/timeline/)) {
    const fid = url.split('/')[url.split('/').indexOf('findings') + 1]
    return DEMO_FINDING_TIMELINE(fid)
  }

  // Finding CRUD
  if (url.match(/\/findings\/[^/]+$/)) {
    const id = url.split('/').pop()!
    if (method === 'delete') return { message: 'Deleted' }
    const finding = DEMO_ALL_FINDINGS.find((f) => f.id === id) ?? DEMO_ALL_FINDINGS[0]
    if (method === 'patch') return { ...finding, ...(body as object), updated_at: new Date().toISOString() }
    const actions = DEMO_CAPA_ACTIONS.filter((a) => a.finding_id === id)
    const timeline = DEMO_FINDING_TIMELINE(id)
    return { ...finding, actions, timeline }
  }
  if (url.match(/\/findings$/)) {
    if (method === 'post') {
      const b = body as Record<string, unknown>
      return { id: `fin-new-${Date.now()}`, tenant_id: 'demo-tenant-001', audit_id: null, audit_code: null, audit_title: null, code: null, status: 'abierto', source: 'inspeccion', root_cause: null, root_cause_category: null, actions_count: 0, open_actions_count: 0, is_recurrent: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), responsible_user_id: null, responsible_name: null, ...b }
    }
    const search = String(params.search ?? '').toLowerCase()
    const filtered = DEMO_ALL_FINDINGS.filter((f) => {
      if (search && !f.title.toLowerCase().includes(search) && !(f.code ?? '').toLowerCase().includes(search)) return false
      if (params.classification && f.classification !== params.classification) return false
      if (params.severity && f.severity !== params.severity) return false
      if (params.status && f.status !== params.status) return false
      if (params.source && f.source !== params.source) return false
      if (params.process_area && f.process_area !== params.process_area) return false
      if (params.audit_id && f.audit_id !== params.audit_id) return false
      return true
    })
    const skip = Number(params.skip ?? 0)
    const limit = Number(params.limit ?? 20)
    return { items: filtered.slice(skip, skip + limit), total: filtered.length, skip, limit }
  }

  // ── CAPA dashboard ─────────────────────────────────────────────────────────
  if (url.match(/\/capa\/dashboard/)) return DEMO_CAPA_DASHBOARD
  if (url.match(/\/capa\/actions/)) {
    const statusFilter = params.status as string | undefined
    const filtered = statusFilter
      ? DEMO_CAPA_ACTIONS.filter((a) => a.status === statusFilter)
      : DEMO_CAPA_ACTIONS
    const skip = Number(params.skip ?? 0)
    const limit = Number(params.limit ?? 50)
    return { items: filtered.slice(skip, skip + limit), total: filtered.length }
  }

  // Dashboard (main)
  if (url.match(/\/audits\/dashboard$/)) return DEMO_AUDIT_DASHBOARD

  // Documents
  if (url.match(/\/documents\/alerts/)) {
    return {
      expired: [{ severity: 'expired', document: DEMO_DOCUMENTS[14], expires_at: DEMO_DOCUMENTS[14].expires_at }],
      expiring_soon: [{ severity: 'warning', document: DEMO_DOCUMENTS[11], expires_at: DEMO_DOCUMENTS[11].expires_at }],
      expiring_critical: [],
      settings: {},
    }
  }
  if (url.match(/\/documents\/search/)) return { ...DEMO_DOCUMENTS_LIST, items: DEMO_DOCUMENTS.filter(d => !params.search || d.title.toLowerCase().includes(String(params.search).toLowerCase())) }
  if (url.match(/\/documents\/[^/]+\/timeline/)) return { items: [], total: 0, skip: 0, limit: 50 }
  if (url.match(/\/documents\/[^/]+$/)) {
    const id = url.split('/').pop()!
    const doc = DEMO_DOCUMENTS.find(d => d.id === id) ?? DEMO_DOCUMENTS[0]
    return { ...doc, current_version: { id: 'v-001', version_number: 1, change_summary: 'Versión inicial', file_name: null, storage_key: null, mime_type: null, file_size: null, file_hash_sha256: null, ai_metadata: null, created_by_id: null, created_at: doc.created_at }, versions: [] }
  }
  if (url.match(/\/documents$/)) return DEMO_DOCUMENTS_LIST

  // Audits — templates
  if (url.match(/\/audit-templates\/audits\/[^/]+\/compliance/)) {
    const id = url.split('/')[url.split('/').indexOf('audits') + 1]
    return DEMO_COMPLIANCE(id)
  }
  if (url.match(/\/audit-templates\/audits/)) {
    return { ...DEMO_AUDITS[0], id: 'aud-new', code: (body as Record<string, string>)?.code ?? 'AUD-NEW', title: (body as Record<string, string>)?.title ?? 'Nueva Auditoría' }
  }
  if (url.match(/\/audit-templates/)) return DEMO_TEMPLATES

  // Finding intelligence
  if (url.match(/\/audits\/[^/]+\/finding-suggestions\/generate/)) {
    return { generated: 2, suggestions: DEMO_SUGGESTIONS.slice(0, 2) }
  }
  if (url.match(/\/audits\/[^/]+\/finding-suggestions\/[^/]+\/approve/)) {
    const id = url.split('/')[url.split('/').indexOf('finding-suggestions') + 1]
    return { ...(DEMO_SUGGESTIONS.find(s => s.id === id) ?? DEMO_SUGGESTIONS[0]), status: 'aprobado' }
  }
  if (url.match(/\/audits\/[^/]+\/finding-suggestions\/[^/]+\/discard/)) {
    const id = url.split('/')[url.split('/').indexOf('finding-suggestions') + 1]
    return { ...(DEMO_SUGGESTIONS.find(s => s.id === id) ?? DEMO_SUGGESTIONS[0]), status: 'descartado' }
  }
  if (url.match(/\/audits\/[^/]+\/finding-suggestions\/[^/]+\/convert-action/)) {
    const id = url.split('/')[url.split('/').indexOf('finding-suggestions') + 1]
    return { ...(DEMO_SUGGESTIONS.find(s => s.id === id) ?? DEMO_SUGGESTIONS[0]), status: 'convertido_accion' }
  }
  if (url.match(/\/audits\/[^/]+\/finding-suggestions/)) {
    const auditId = url.split('/')[url.split('/').indexOf('audits') + 1]
    return DEMO_SUGGESTIONS.filter(s => s.audit_id === auditId)
  }

  // Audit sub-resources
  if (url.match(/\/audits\/[^/]+\/timeline/)) {
    const auditId = url.split('/')[url.split('/').indexOf('audits') + 1]
    return DEMO_TIMELINE(auditId)
  }
  if (url.match(/\/audits\/[^/]+\/checklists\/[^/]+\/response/)) {
    const parts = url.split('/')
    const checklistId = parts[parts.indexOf('checklists') + 1]
    const existing = DEMO_CHECKLIST.find(c => c.id === checklistId)
    return { ...(existing ?? DEMO_CHECKLIST[0]), ...(body as object) }
  }
  if (url.match(/\/audits\/[^/]+\/checklists/)) {
    const auditId = url.split('/')[url.split('/').indexOf('audits') + 1]
    return DEMO_CHECKLIST.filter(c => c.audit_id === auditId)
  }
  if (url.match(/\/audits\/[^/]+\/findings/)) {
    const auditId = url.split('/')[url.split('/').indexOf('audits') + 1]
    if (method === 'post') return { ...DEMO_FINDINGS[0], id: `fin-new-${Date.now()}`, ...(body as object) }
    return DEMO_FINDINGS.filter(f => f.audit_id === auditId)
  }
  if (url.match(/\/audits\/[^/]+\/evidences\/upload/)) {
    return { ...DEMO_EVIDENCES[0], id: `ev-new-${Date.now()}`, file_name: 'archivo_evidencia.pdf' }
  }
  if (url.match(/\/audits\/[^/]+\/evidences/)) {
    const auditId = url.split('/')[url.split('/').indexOf('audits') + 1]
    if (method === 'post') return { ...DEMO_EVIDENCES[0], id: `ev-new-${Date.now()}`, ...(body as object) }
    return DEMO_EVIDENCES.filter(e => e.audit_id === auditId)
  }
  if (url.match(/\/audits\/[^/]+\/status/)) {
    const auditId = url.split('/')[url.split('/').indexOf('audits') + 1]
    const audit = DEMO_AUDITS.find(a => a.id === auditId) ?? DEMO_AUDITS[0]
    return { ...audit, status: (body as Record<string, string>)?.status ?? audit.status }
  }

  // Audits CRUD
  if (url.match(/\/audits\/[^/]+$/)) {
    const id = url.split('/').pop()!
    if (method === 'delete') return { message: 'Deleted' }
    const audit = DEMO_AUDITS.find(a => a.id === id) ?? DEMO_AUDITS[0]
    if (method === 'patch') return { ...audit, ...(body as object) }
    return audit
  }
  if (url.match(/\/audits$/)) {
    if (method === 'post') return { ...DEMO_AUDITS[0], id: `aud-new-${Date.now()}`, ...(body as object), findings_count: 0, open_findings_count: 0, critical_findings_count: 0, checklist_items_count: 0 }
    return DEMO_AUDITS_LIST
  }

  return null
}

export function createDemoAdapter(originalAdapter: (config: AxiosRequestConfig) => Promise<AxiosResponse>) {
  return function demoAdapter(config: AxiosRequestConfig): Promise<AxiosResponse> {
    const url = config.url ?? ''
    const method = (config.method ?? 'get').toLowerCase()
    const params = (config.params ?? {}) as Record<string, unknown>
    let body: unknown = null
    try {
      body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data
    } catch { /* ignore */ }

    const demoData = matchDemoData(url, method, params, body)
    if (demoData !== null) {
      return Promise.resolve(mockResponse(demoData, config))
    }
    return originalAdapter(config)
  }
}
