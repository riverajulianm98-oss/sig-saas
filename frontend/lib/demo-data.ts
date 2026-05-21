import type { AuditDashboardResponse as DashAuditResponse } from '@/types/dashboard'

const T = () => new Date().toISOString()
const D = (daysAgo: number) => new Date(Date.now() - daysAgo * 86400_000).toISOString()
const DATE = (daysAgo: number) => new Date(Date.now() - daysAgo * 86400_000).toISOString().split('T')[0]

// ─── Users ───────────────────────────────────────────────────────────────────
export const DEMO_TENANT = {
  id: 'demo-tenant-001',
  name: 'SIGCYA Consulting',
  slug: 'sigcya',
  legal_name: 'SIGCYA Consulting S.A.S.',
  tax_id: '900.123.456-7',
  is_active: true,
  plan: 'enterprise',
}

export const DEMO_USER = {
  id: 'demo-user-001',
  tenant_id: 'demo-tenant-001',
  email: 'admin@sigcya.com',
  full_name: 'Alejandro Gómez',
  role: 'coordinador_sig' as const,
  is_active: true,
  last_login_at: D(0),
}

// ─── Documents ───────────────────────────────────────────────────────────────
export const DEMO_DOCUMENTS = [
  { id: 'doc-001', tenant_id: 'demo-tenant-001', code: 'PRO-001', title: 'Procedimiento de Auditorías Internas ISO', document_type: 'procedimiento', status: 'aprobado', process_area: 'Calidad', owner_id: 'demo-user-001', current_version_id: 'v-001', expires_at: DATE(-180), tags: ['iso9001', 'auditorias', 'calidad'], created_at: D(180), updated_at: D(5) },
  { id: 'doc-002', tenant_id: 'demo-tenant-001', code: 'PRO-002', title: 'Procedimiento de Control de Documentos y Registros', document_type: 'procedimiento', status: 'aprobado', process_area: 'Calidad', owner_id: 'demo-user-001', current_version_id: 'v-002', expires_at: DATE(-60), tags: ['iso9001', 'control-documental'], created_at: D(150), updated_at: D(3) },
  { id: 'doc-003', tenant_id: 'demo-tenant-001', code: 'PRO-003', title: 'Procedimiento de No Conformidades y Acciones Correctivas', document_type: 'procedimiento', status: 'aprobado', process_area: 'Calidad', owner_id: 'demo-user-001', current_version_id: 'v-003', expires_at: DATE(90), tags: ['iso9001', 'no-conformidades'], created_at: D(120), updated_at: D(10) },
  { id: 'doc-004', tenant_id: 'demo-tenant-001', code: 'PRO-004', title: 'Procedimiento de Gestión de Riesgos y Oportunidades', document_type: 'procedimiento', status: 'revision', process_area: 'Dirección', owner_id: 'demo-user-001', current_version_id: null, expires_at: DATE(120), tags: ['riesgos', 'iso9001'], created_at: D(30), updated_at: D(1) },
  { id: 'doc-005', tenant_id: 'demo-tenant-001', code: 'PRO-005', title: 'Procedimiento de Evaluación de Proveedores Críticos', document_type: 'procedimiento', status: 'aprobado', process_area: 'Compras', owner_id: 'demo-user-001', current_version_id: 'v-005', expires_at: DATE(45), tags: ['proveedores', 'compras'], created_at: D(90), updated_at: D(7) },
  { id: 'doc-006', tenant_id: 'demo-tenant-001', code: 'FOR-001', title: 'Formato de Informe de Auditoría Interna', document_type: 'formato', status: 'aprobado', process_area: 'Calidad', owner_id: 'demo-user-001', current_version_id: 'v-006', expires_at: null, tags: ['formato', 'auditoria'], created_at: D(160), updated_at: D(20) },
  { id: 'doc-007', tenant_id: 'demo-tenant-001', code: 'FOR-002', title: 'Formato de Registro de Hallazgos', document_type: 'formato', status: 'aprobado', process_area: 'Calidad', owner_id: 'demo-user-001', current_version_id: 'v-007', expires_at: null, tags: ['formato', 'hallazgos'], created_at: D(155), updated_at: D(15) },
  { id: 'doc-008', tenant_id: 'demo-tenant-001', code: 'FOR-003', title: 'Formato de Plan de Acción Correctiva', document_type: 'formato', status: 'aprobado', process_area: 'Calidad', owner_id: 'demo-user-001', current_version_id: 'v-008', expires_at: null, tags: ['formato', 'acciones'], created_at: D(150), updated_at: D(12) },
  { id: 'doc-009', tenant_id: 'demo-tenant-001', code: 'FOR-004', title: 'Formato de Control de Cambios en Procesos', document_type: 'formato', status: 'borrador', process_area: 'Operaciones', owner_id: 'demo-user-001', current_version_id: null, expires_at: null, tags: ['formato', 'cambios'], created_at: D(5), updated_at: D(1) },
  { id: 'doc-010', tenant_id: 'demo-tenant-001', code: 'INS-001', title: 'Instructivo de Uso del Sistema SIG Digital', document_type: 'instructivo', status: 'aprobado', process_area: 'TI', owner_id: 'demo-user-001', current_version_id: 'v-010', expires_at: null, tags: ['instructivo', 'sistema'], created_at: D(100), updated_at: D(8) },
  { id: 'doc-011', tenant_id: 'demo-tenant-001', code: 'POL-001', title: 'Política Integrada del Sistema de Gestión', document_type: 'politica', status: 'aprobado', process_area: 'Dirección', owner_id: 'demo-user-001', current_version_id: 'v-011', expires_at: DATE(180), tags: ['politica', 'sig', 'iso9001', 'iso14001', 'iso45001'], created_at: D(200), updated_at: D(30) },
  { id: 'doc-012', tenant_id: 'demo-tenant-001', code: 'POL-002', title: 'Política de Seguridad, Salud y Medio Ambiente', document_type: 'politica', status: 'aprobado', process_area: 'HSEQ', owner_id: 'demo-user-001', current_version_id: 'v-012', expires_at: DATE(15), tags: ['politica', 'sst', 'hseq'], created_at: D(180), updated_at: D(25) },
  { id: 'doc-013', tenant_id: 'demo-tenant-001', code: 'MAN-001', title: 'Manual del Sistema de Gestión de Calidad ISO 9001:2015', document_type: 'manual', status: 'aprobado', process_area: 'Calidad', owner_id: 'demo-user-001', current_version_id: 'v-013', expires_at: DATE(365), tags: ['manual', 'calidad', 'iso9001'], created_at: D(300), updated_at: D(60) },
  { id: 'doc-014', tenant_id: 'demo-tenant-001', code: 'MAN-002', title: 'Manual de Seguridad Industrial y Gestión del Riesgo', document_type: 'manual', status: 'revision', process_area: 'HSEQ', owner_id: 'demo-user-001', current_version_id: 'v-014', expires_at: DATE(200), tags: ['manual', 'seguridad', 'riesgo'], created_at: D(50), updated_at: D(2) },
  { id: 'doc-015', tenant_id: 'demo-tenant-001', code: 'EVI-001', title: 'Certificado de Calibración de Equipos Q1 2025', document_type: 'evidencia', status: 'aprobado', process_area: 'Producción', owner_id: 'demo-user-001', current_version_id: 'v-015', expires_at: DATE(-10), tags: ['evidencia', 'calibracion', 'equipos'], created_at: D(90), updated_at: D(10) },
]

export const DEMO_DOCUMENTS_LIST = {
  items: DEMO_DOCUMENTS,
  total: 15,
  skip: 0,
  limit: 20,
}

// ─── Audits ──────────────────────────────────────────────────────────────────
export const DEMO_AUDITS = [
  { id: 'aud-001', tenant_id: 'demo-tenant-001', audit_plan_id: null, code: 'AUD-2025-001', title: 'Auditoría Interna ISO 9001 – Q1 2025', description: 'Auditoría interna de sistema de gestión de calidad, primer trimestre 2025. Alcance: todos los procesos del sistema.', audit_type: 'interna', status: 'finalizada', iso_standards: ['iso_9001'], process_area: 'Calidad', scope: 'Todos los procesos del SGC', objectives: 'Verificar el cumplimiento de los requisitos de la norma ISO 9001:2015', location: 'Planta Principal – Bogotá', planned_start_date: DATE(40), planned_end_date: DATE(35), actual_start_date: DATE(40), actual_end_date: DATE(34), lead_auditor_id: 'demo-user-001', compliance_score: 87, findings_count: 5, open_findings_count: 2, critical_findings_count: 1, checklist_items_count: 45, created_at: D(50), updated_at: D(34) },
  { id: 'aud-002', tenant_id: 'demo-tenant-001', audit_plan_id: null, code: 'AUD-2025-002', title: 'Auditoría Externa ISO 14001 – Certificación 2025', description: 'Auditoría de certificación ISO 14001:2015 por organismo externo acreditado.', audit_type: 'certificacion', status: 'en_proceso', iso_standards: ['iso_14001'], process_area: 'Medio Ambiente', scope: 'Sistema de Gestión Ambiental', objectives: 'Obtener o renovar certificación ISO 14001:2015', location: 'Todas las instalaciones', planned_start_date: DATE(5), planned_end_date: DATE(-3), actual_start_date: DATE(5), actual_end_date: null, lead_auditor_id: 'demo-user-001', compliance_score: 73, findings_count: 8, open_findings_count: 6, critical_findings_count: 2, checklist_items_count: 38, created_at: D(30), updated_at: D(2) },
  { id: 'aud-003', tenant_id: 'demo-tenant-001', audit_plan_id: null, code: 'AUD-2025-003', title: 'Auditoría de Seguimiento SST – Semestre 1', description: 'Seguimiento al sistema de gestión de seguridad y salud en el trabajo.', audit_type: 'seguimiento', status: 'en_proceso', iso_standards: ['iso_45001'], process_area: 'HSEQ', scope: 'Procesos críticos HSEQ', objectives: 'Verificar implementación de planes de acción anteriores', location: 'Planta de Producción', planned_start_date: DATE(3), planned_end_date: DATE(-4), actual_start_date: DATE(3), actual_end_date: null, lead_auditor_id: 'demo-user-001', compliance_score: 65, findings_count: 12, open_findings_count: 9, critical_findings_count: 3, checklist_items_count: 32, created_at: D(20), updated_at: D(1) },
  { id: 'aud-004', tenant_id: 'demo-tenant-001', audit_plan_id: null, code: 'AUD-2025-004', title: 'Auditoría Extraordinaria – Proceso de Producción', description: 'Auditoría no planificada por evento de no conformidad mayor en línea de producción.', audit_type: 'extraordinaria', status: 'planeada', iso_standards: ['iso_9001'], process_area: 'Producción', scope: 'Línea de producción A y B', objectives: 'Investigar causa raíz de no conformidades recurrentes', location: 'Planta Producción – Zona A', planned_start_date: DATE(-7), planned_end_date: DATE(-5), actual_start_date: null, actual_end_date: null, lead_auditor_id: 'demo-user-001', compliance_score: null, findings_count: 0, open_findings_count: 0, critical_findings_count: 0, checklist_items_count: 0, created_at: D(10), updated_at: D(10) },
  { id: 'aud-005', tenant_id: 'demo-tenant-001', audit_plan_id: null, code: 'AUD-2025-005', title: 'Auditoría Interna ISO 9001 – Q2 2025', description: 'Segunda auditoría interna del año, enfocada en procesos comerciales y post-venta.', audit_type: 'interna', status: 'planeada', iso_standards: ['iso_9001'], process_area: 'Comercial', scope: 'Procesos de ventas y servicio al cliente', objectives: 'Evaluar efectividad de procesos comerciales', location: 'Sede Comercial', planned_start_date: DATE(-30), planned_end_date: DATE(-25), actual_start_date: null, actual_end_date: null, lead_auditor_id: 'demo-user-001', compliance_score: null, findings_count: 0, open_findings_count: 0, critical_findings_count: 0, checklist_items_count: 0, created_at: D(5), updated_at: D(5) },
  { id: 'aud-006', tenant_id: 'demo-tenant-001', audit_plan_id: null, code: 'AUD-2024-006', title: 'Auditoría Certificación ISO 45001 – 2024', description: 'Auditoría de certificación ISO 45001:2018 completada exitosamente en 2024.', audit_type: 'certificacion', status: 'cerrada', iso_standards: ['iso_45001'], process_area: 'HSEQ', scope: 'Sistema de Gestión SST completo', objectives: 'Obtener certificación ISO 45001:2018', location: 'Todas las instalaciones', planned_start_date: DATE(180), planned_end_date: DATE(175), actual_start_date: DATE(180), actual_end_date: DATE(174), lead_auditor_id: 'demo-user-001', compliance_score: 91, findings_count: 3, open_findings_count: 0, critical_findings_count: 0, checklist_items_count: 42, created_at: D(200), updated_at: D(170) },
  { id: 'aud-007', tenant_id: 'demo-tenant-001', audit_plan_id: null, code: 'AUD-2024-007', title: 'Auditoría de Seguimiento Calidad – Q4 2024', description: 'Seguimiento a hallazgos de auditoría del Q2 2024. Verificación de cierres.', audit_type: 'seguimiento', status: 'finalizada', iso_standards: ['iso_9001'], process_area: 'Calidad', scope: 'Seguimiento a hallazgos Q2 2024', objectives: 'Verificar cierre efectivo de hallazgos anteriores', location: 'Planta Principal', planned_start_date: DATE(90), planned_end_date: DATE(87), actual_start_date: DATE(90), actual_end_date: DATE(86), lead_auditor_id: 'demo-user-001', compliance_score: 78, findings_count: 4, open_findings_count: 1, critical_findings_count: 0, checklist_items_count: 28, created_at: D(100), updated_at: D(85) },
  { id: 'aud-008', tenant_id: 'demo-tenant-001', audit_plan_id: null, code: 'AUD-2025-008', title: 'Auditoría Externa – Proveedor Crítico Alpha S.A.', description: 'Cancelada por negativa del proveedor a recibir auditoría.', audit_type: 'externa', status: 'cancelada', iso_standards: ['iso_9001'], process_area: 'Compras', scope: 'Proveedor Alpha S.A. – proceso productivo', objectives: 'Evaluar capacidad del proveedor crítico', location: 'Instalaciones Alpha S.A. – Medellín', planned_start_date: DATE(15), planned_end_date: DATE(13), actual_start_date: null, actual_end_date: null, lead_auditor_id: 'demo-user-001', compliance_score: null, findings_count: 0, open_findings_count: 0, critical_findings_count: 0, checklist_items_count: 0, created_at: D(25), updated_at: D(12) },
]

export const DEMO_AUDITS_LIST = {
  items: DEMO_AUDITS,
  total: 8,
  skip: 0,
  limit: 20,
}

// ─── Findings ────────────────────────────────────────────────────────────────
export const DEMO_FINDINGS = [
  { id: 'fin-001', audit_id: 'aud-001', tenant_id: 'demo-tenant-001', code: 'HLL-001', title: 'Ausencia de registros de revisión por la dirección en 2 sedes', description: 'Se evidencia que las sedes de Cali y Barranquilla no cuentan con registros de revisión por la dirección del último semestre, incumpliendo el numeral 9.3 de ISO 9001:2015.', classification: 'no_conformidad', severity: 'alta', status: 'en_seguimiento', requirement_reference: 'ISO 9001:2015 §9.3', process_area: 'Dirección', responsible_user_id: 'demo-user-001', due_date: DATE(-15), created_at: D(34) },
  { id: 'fin-002', audit_id: 'aud-001', tenant_id: 'demo-tenant-001', code: 'HLL-002', title: 'Checklist de calibración desactualizado para equipo P-204', description: 'El equipo de presión P-204 del laboratorio presenta fecha de calibración vencida desde hace 45 días. No se han tomado acciones correctivas.', classification: 'no_conformidad', severity: 'critica', status: 'abierto', requirement_reference: 'ISO 9001:2015 §7.1.5', process_area: 'Producción', responsible_user_id: null, due_date: DATE(-5), created_at: D(34) },
  { id: 'fin-003', audit_id: 'aud-001', tenant_id: 'demo-tenant-001', code: 'HLL-003', title: 'Oportunidad de mejora en sistema de monitoreo de indicadores KPI', description: 'El sistema actual de monitoreo de indicadores no permite visualización en tiempo real. Se recomienda implementar dashboard digital para seguimiento continuo.', classification: 'oportunidad_mejora', severity: 'media', status: 'abierto', requirement_reference: 'ISO 9001:2015 §9.1', process_area: 'Calidad', responsible_user_id: null, due_date: DATE(-30), created_at: D(34) },
  { id: 'fin-004', audit_id: 'aud-001', tenant_id: 'demo-tenant-001', code: 'HLL-004', title: 'Excelente gestión del proceso de control de cambios en TI', description: 'El área de TI demostró un robusto proceso de control de cambios con trazabilidad completa, documentación actualizada y registros de aprobación sin faltantes.', classification: 'fortaleza', severity: 'baja', status: 'cerrado', requirement_reference: 'ISO 9001:2015 §8.5', process_area: 'TI', responsible_user_id: null, due_date: null, created_at: D(34) },
  { id: 'fin-005', audit_id: 'aud-001', tenant_id: 'demo-tenant-001', code: 'HLL-005', title: 'Observación: Criterios de competencia no actualizados para 3 perfiles', description: 'Los perfiles de cargo de: Analista de Calidad, Técnico de Producción y Coordinador HSEQ no tienen actualizados los criterios de competencia del año 2024.', classification: 'observacion', severity: 'media', status: 'cerrado', requirement_reference: 'ISO 9001:2015 §7.2', process_area: 'Recursos Humanos', responsible_user_id: null, due_date: null, created_at: D(34) },
  { id: 'fin-006', audit_id: 'aud-002', tenant_id: 'demo-tenant-001', code: 'HLL-006', title: 'Plan de gestión ambiental no incluye metas para reducción de CO2', description: 'El plan de gestión ambiental 2025 no establece metas cuantificables para la reducción de emisiones de CO2, requeridas por ISO 14001:2015 numeral 6.2.', classification: 'no_conformidad', severity: 'alta', status: 'abierto', requirement_reference: 'ISO 14001:2015 §6.2', process_area: 'Medio Ambiente', responsible_user_id: null, due_date: DATE(-10), created_at: D(2) },
  { id: 'fin-007', audit_id: 'aud-002', tenant_id: 'demo-tenant-001', code: 'HLL-007', title: 'Gestión inadecuada de residuos peligrosos en zona de almacenamiento', description: 'La zona de almacenamiento temporal de residuos peligrosos no cumple con la señalización requerida y los contenedores no están correctamente etiquetados.', classification: 'no_conformidad', severity: 'critica', status: 'abierto', requirement_reference: 'ISO 14001:2015 §8.1', process_area: 'Operaciones', responsible_user_id: null, due_date: DATE(-3), created_at: D(2) },
  { id: 'fin-008', audit_id: 'aud-002', tenant_id: 'demo-tenant-001', code: 'HLL-008', title: 'Inventario de aspectos ambientales desactualizado', description: 'El inventario de aspectos e impactos ambientales no ha sido actualizado en los últimos 18 meses, no reflejando los cambios en el proceso productivo.', classification: 'no_conformidad', severity: 'alta', status: 'en_seguimiento', requirement_reference: 'ISO 14001:2015 §6.1.2', process_area: 'Medio Ambiente', responsible_user_id: 'demo-user-001', due_date: DATE(-7), created_at: D(2) },
  { id: 'fin-009', audit_id: 'aud-003', tenant_id: 'demo-tenant-001', code: 'HLL-009', title: 'EPP no disponible para 4 trabajadores en línea de pintura', description: 'Se verificó que 4 trabajadores de la línea de pintura no contaban con el equipo de protección personal completo (careta de soldar, guantes térmicos).', classification: 'no_conformidad', severity: 'critica', status: 'abierto', requirement_reference: 'ISO 45001:2018 §8.1.2', process_area: 'Producción', responsible_user_id: null, due_date: DATE(-1), created_at: D(1) },
  { id: 'fin-010', audit_id: 'aud-003', tenant_id: 'demo-tenant-001', code: 'HLL-010', title: 'Programa de inspecciones de seguridad con cumplimiento del 40%', description: 'El programa mensual de inspecciones de seguridad tiene un cumplimiento del 40% en el período evaluado, muy por debajo del 90% establecido como meta.', classification: 'no_conformidad', severity: 'alta', status: 'abierto', requirement_reference: 'ISO 45001:2018 §9.1.2', process_area: 'HSEQ', responsible_user_id: null, due_date: DATE(-5), created_at: D(1) },
  { id: 'fin-011', audit_id: 'aud-007', tenant_id: 'demo-tenant-001', code: 'HLL-011', title: 'Proceso de gestión de cambios implementado efectivamente', description: 'El proceso de gestión de cambios ha sido implementado y los registros muestran evidencia de análisis de riesgos previo a cada cambio.', classification: 'fortaleza', severity: 'baja', status: 'cerrado', requirement_reference: null, process_area: 'Calidad', responsible_user_id: null, due_date: null, created_at: D(86) },
  { id: 'fin-012', audit_id: 'aud-007', tenant_id: 'demo-tenant-001', code: 'HLL-012', title: 'Indicador de satisfacción al cliente por debajo de la meta', description: 'El indicador de satisfacción del cliente presenta un resultado del 78%, por debajo de la meta del 85% establecida en el programa de gestión.', classification: 'observacion', severity: 'media', status: 'en_seguimiento', requirement_reference: 'ISO 9001:2015 §9.1.2', process_area: 'Comercial', responsible_user_id: 'demo-user-001', due_date: DATE(-20), created_at: D(86) },
]

// ─── Checklist items ──────────────────────────────────────────────────────────
export const DEMO_CHECKLIST = [
  { id: 'chk-001', audit_id: 'aud-001', iso_standard: 'iso_9001', clause_code: '4.1', requirement_text: 'La organización debe determinar las cuestiones externas e internas que son pertinentes para su propósito.', question_text: '¿Ha determinado la organización las cuestiones externas e internas relevantes para el sistema de gestión?', sort_order: 1, weight: 2, section_title: 'Contexto de la organización', chapter_code: '4', process_area: 'Dirección', criticality: 'alta', response_type: 'cumple', evidence_required: true, compliance_criteria: 'Debe existir análisis DOFA o similar documentado y actualizado', compliance_status: 'cumple', score: 100, text_value: null, numeric_value: null, observations: 'Se verificó análisis DOFA actualizado a enero 2025.' },
  { id: 'chk-002', audit_id: 'aud-001', iso_standard: 'iso_9001', clause_code: '4.2', requirement_text: 'La organización debe determinar las partes interesadas y sus requisitos.', question_text: '¿Están identificadas las partes interesadas y sus necesidades documentadas?', sort_order: 2, weight: 2, section_title: 'Contexto de la organización', chapter_code: '4', process_area: 'Dirección', criticality: 'alta', response_type: 'cumple', evidence_required: true, compliance_criteria: 'Debe existir matriz de partes interesadas actualizada', compliance_status: 'cumple', score: 100, text_value: null, numeric_value: null, observations: 'Matriz de partes interesadas completa y revisada.' },
  { id: 'chk-003', audit_id: 'aud-001', iso_standard: 'iso_9001', clause_code: '5.1', requirement_text: 'La alta dirección debe demostrar liderazgo y compromiso con el sistema de gestión.', question_text: '¿Demuestra la alta dirección liderazgo activo en el SGC mediante evidencias documentales?', sort_order: 3, weight: 3, section_title: 'Liderazgo', chapter_code: '5', process_area: 'Dirección', criticality: 'critica', response_type: 'cumple', evidence_required: true, compliance_criteria: 'Actas de revisión, comunicaciones de dirección, participación en auditorías', compliance_status: 'parcial', score: 60, text_value: null, numeric_value: null, observations: 'Hay evidencia en sede principal pero no en sedes regionales.' },
  { id: 'chk-004', audit_id: 'aud-001', iso_standard: 'iso_9001', clause_code: '6.1', requirement_text: 'La organización debe considerar los riesgos y oportunidades que pueden afectar el SGC.', question_text: '¿Existe un proceso documentado para identificar y gestionar riesgos y oportunidades?', sort_order: 4, weight: 3, section_title: 'Planificación', chapter_code: '6', process_area: 'Calidad', criticality: 'critica', response_type: 'cumple', evidence_required: true, compliance_criteria: 'Matriz de riesgos documentada, con valoración y controles definidos', compliance_status: 'cumple', score: 90, text_value: null, numeric_value: null, observations: 'Proceso bien documentado, con controles implementados.' },
  { id: 'chk-005', audit_id: 'aud-001', iso_standard: 'iso_9001', clause_code: '7.1.5', requirement_text: 'La organización debe determinar y proporcionar los recursos para la medición.', question_text: '¿Los equipos de medición están calibrados y con registros actualizados?', sort_order: 5, weight: 3, section_title: 'Recursos', chapter_code: '7', process_area: 'Producción', criticality: 'critica', response_type: 'cumple', evidence_required: true, compliance_criteria: 'Programa de calibración implementado, registros al día', compliance_status: 'no_cumple', score: 0, text_value: null, numeric_value: null, observations: 'Equipo P-204 con calibración vencida hace 45 días. Hallazgo HLL-002 generado.' },
]

// ─── AI Suggestions ──────────────────────────────────────────────────────────
export const DEMO_SUGGESTIONS = [
  { id: 'sug-001', audit_id: 'aud-002', checklist_item_id: 'chk-001', status: 'sugerido', classification: 'no_conformidad', severity: 'alta', title: 'Indicadores ambientales sin línea base establecida', description: 'El sistema de medición ambiental carece de línea base para 3 de los 7 indicadores establecidos, imposibilitando la evaluación objetiva del desempeño ambiental.', requirement_reference: 'ISO 14001:2015 §6.2.1', process_area: 'Medio Ambiente', potential_impact: 'Incumplimiento en auditoría de certificación. Riesgo de no obtener/mantener certificación.', initial_recommendation: 'Establecer línea base para todos los indicadores ambientales dentro de los próximos 30 días. Designar responsable de seguimiento.', confidence_score: 0.89, evidence_ids: null, generation_context: null, ai_metadata: null, converted_finding_id: null, reviewed_by_id: null, reviewed_at: null, discard_reason: null, created_at: D(2), updated_at: D(2) },
  { id: 'sug-002', audit_id: 'aud-002', checklist_item_id: 'chk-002', status: 'pendiente_validacion', classification: 'observacion', severity: 'media', title: 'Plan de emergencias ambientales sin simulacro documentado en 2024', description: 'El plan de respuesta a emergencias ambientales existe pero no hay registros de simulacros realizados durante el año 2024, lo cual es un requisito de ISO 14001.', requirement_reference: 'ISO 14001:2015 §8.2', process_area: 'HSEQ', potential_impact: 'Personal no preparado ante derrame o emergencia ambiental real.', initial_recommendation: 'Programar y ejecutar al menos un simulacro de emergencia ambiental antes del cierre de la auditoría.', confidence_score: 0.76, evidence_ids: null, generation_context: null, ai_metadata: null, converted_finding_id: null, reviewed_by_id: null, reviewed_at: null, discard_reason: null, created_at: D(1), updated_at: D(1) },
  { id: 'sug-003', audit_id: 'aud-003', checklist_item_id: 'chk-003', status: 'aprobado', classification: 'no_conformidad', severity: 'critica', title: 'Investigación de accidentes sin análisis de causa raíz documentado', description: 'Los 3 accidentes registrados en Q1 2025 presentan informes de investigación sin análisis de causa raíz formal (método 5 Por qués o similar), incumpliendo ISO 45001.', requirement_reference: 'ISO 45001:2018 §10.2', process_area: 'HSEQ', potential_impact: 'Recurrencia de accidentes por no identificación de causas raíz. Pasivos legales.', initial_recommendation: 'Realizar análisis de causa raíz retrospectivo para los 3 accidentes. Capacitar al equipo HSEQ en metodología de investigación.', confidence_score: 0.94, evidence_ids: null, generation_context: null, ai_metadata: null, converted_finding_id: null, reviewed_by_id: null, reviewed_at: D(1), discard_reason: null, created_at: D(2), updated_at: D(1) },
]

// ─── Evidence ────────────────────────────────────────────────────────────────
export const DEMO_EVIDENCES = [
  { id: 'ev-001', audit_id: 'aud-001', finding_id: 'fin-002', checklist_id: null, evidence_type: 'file_upload', description: 'Fotografía equipo P-204 con etiqueta de calibración vencida', document_id: null, document_version_id: null, external_url: null, file_name: 'foto_equipo_P204_calibracion.jpg', file_hash_sha256: 'abc123', created_at: D(34) },
  { id: 'ev-002', audit_id: 'aud-001', finding_id: null, checklist_id: 'chk-001', evidence_type: 'document_reference', description: 'DOFA organizacional 2025', document_id: 'doc-013', document_version_id: null, external_url: null, file_name: null, file_hash_sha256: null, created_at: D(34) },
  { id: 'ev-003', audit_id: 'aud-002', finding_id: 'fin-007', checklist_id: null, evidence_type: 'external_url', description: 'Normativa ambiental vigente para residuos peligrosos', document_id: null, document_version_id: null, external_url: 'https://www.minambiente.gov.co', file_name: null, file_hash_sha256: null, created_at: D(2) },
]

// ─── Timeline ────────────────────────────────────────────────────────────────
export const DEMO_TIMELINE = (auditId: string) => ({
  items: [
    { id: `tl-${auditId}-001`, action: 'created', user_id: 'demo-user-001', entity_type: 'audit', entity_id: auditId, ip_address: '192.168.1.100', changes: null, message: 'Auditoría creada', created_at: D(50) },
    { id: `tl-${auditId}-002`, action: 'status_changed', user_id: 'demo-user-001', entity_type: 'audit', entity_id: auditId, ip_address: '192.168.1.100', changes: { status: { old: 'planeada', new: 'en_proceso' } }, message: 'Auditoría iniciada — se comenzó la ejecución', created_at: D(40) },
    { id: `tl-${auditId}-003`, action: 'finding_added', user_id: 'demo-user-001', entity_type: 'finding', entity_id: 'fin-001', ip_address: '192.168.1.100', changes: null, message: 'Hallazgo HLL-001 registrado: No conformidad alta', created_at: D(38) },
    { id: `tl-${auditId}-004`, action: 'evidence_added', user_id: 'demo-user-001', entity_type: 'evidence', entity_id: 'ev-001', ip_address: '192.168.1.100', changes: null, message: 'Evidencia adjunta: foto_equipo_P204_calibracion.jpg', created_at: D(37) },
    { id: `tl-${auditId}-005`, action: 'response_recorded', user_id: 'demo-user-001', entity_type: 'checklist', entity_id: 'chk-005', ip_address: '192.168.1.100', changes: null, message: 'Respuesta registrada §7.1.5 → No cumple', created_at: D(36) },
    { id: `tl-${auditId}-006`, action: 'status_changed', user_id: 'demo-user-001', entity_type: 'audit', entity_id: auditId, ip_address: '192.168.1.100', changes: { status: { old: 'en_proceso', new: 'finalizada' }, compliance_score: { old: null, new: 87 } }, message: 'Auditoría finalizada — Score de compliance: 87%', created_at: D(34) },
  ],
  total: 6,
  skip: 0,
  limit: 50,
})

// ─── Compliance breakdown ─────────────────────────────────────────────────────
export const DEMO_COMPLIANCE = (auditId: string) => ({
  audit_id: auditId,
  overall_score: 87,
  total_items: 45,
  responded_items: 42,
  clauses: [
    { clause_code: '4', clause_title: 'Contexto de la organización', total: 4, cumple: 4, no_cumple: 0, parcial: 0, no_aplica: 0, pendiente: 0, score: 100 },
    { clause_code: '5', clause_title: 'Liderazgo', total: 6, cumple: 4, no_cumple: 1, parcial: 1, no_aplica: 0, pendiente: 0, score: 75 },
    { clause_code: '6', clause_title: 'Planificación', total: 5, cumple: 4, no_cumple: 0, parcial: 1, no_aplica: 0, pendiente: 0, score: 90 },
    { clause_code: '7', clause_title: 'Soporte', total: 8, cumple: 6, no_cumple: 1, parcial: 0, no_aplica: 0, pendiente: 1, score: 85 },
    { clause_code: '8', clause_title: 'Operación', total: 10, cumple: 7, no_cumple: 1, parcial: 2, no_aplica: 0, pendiente: 0, score: 80 },
    { clause_code: '9', clause_title: 'Evaluación del desempeño', total: 7, cumple: 6, no_cumple: 0, parcial: 0, no_aplica: 0, pendiente: 1, score: 95 },
    { clause_code: '10', clause_title: 'Mejora', total: 5, cumple: 4, no_cumple: 0, parcial: 1, no_aplica: 0, pendiente: 0, score: 90 },
  ],
})

// ─── Templates ───────────────────────────────────────────────────────────────
export const DEMO_TEMPLATES = {
  items: [
    { id: 'tpl-001', code: 'TPL-ISO9001-V2', name: 'ISO 9001:2015 — Auditoría completa', iso_standard: 'iso_9001', description: 'Checklist completo para auditorías internas y externas ISO 9001:2015. Incluye todos los numerales de la norma.', is_active: true, question_count: 45, created_at: D(300) },
    { id: 'tpl-002', code: 'TPL-ISO14001-V1', name: 'ISO 14001:2015 — Sistema Ambiental', iso_standard: 'iso_14001', description: 'Checklist para auditorías del sistema de gestión ambiental ISO 14001:2015.', is_active: true, question_count: 38, created_at: D(250) },
    { id: 'tpl-003', code: 'TPL-ISO45001-V1', name: 'ISO 45001:2018 — SST completo', iso_standard: 'iso_45001', description: 'Checklist completo de seguridad y salud en el trabajo ISO 45001:2018.', is_active: true, question_count: 42, created_at: D(200) },
    { id: 'tpl-004', code: 'TPL-ISO9001-SEG', name: 'ISO 9001:2015 — Seguimiento rápido', iso_standard: 'iso_9001', description: 'Checklist reducido para auditorías de seguimiento. Enfocado en hallazgos anteriores.', is_active: true, question_count: 18, created_at: D(150) },
  ],
  total: 4,
}

// ─── Dashboard (audit module) ─────────────────────────────────────────────────
export const DEMO_AUDIT_DASHBOARD = {
  open_audits: 3,
  critical_findings: 4,
  open_findings: 12,
  compliance_score_avg: 78.5,
  findings_by_process: { 'Calidad': 5, 'HSEQ': 6, 'Producción': 4, 'Medio Ambiente': 3, 'Comercial': 2 },
  findings_by_classification: { no_conformidad: 8, observacion: 4, oportunidad_mejora: 3, fortaleza: 5 },
  action_plans_by_status: { pendiente: 5, en_progreso: 4, completada: 8, vencida: 3 },
  audits_by_status: { planeada: 2, en_proceso: 2, finalizada: 2, cerrada: 1, cancelada: 1 },
}

// ─── Dashboard (main) ─────────────────────────────────────────────────────────
export const DEMO_MAIN_DASHBOARD: DashAuditResponse = {
  total_audits: 8,
  open_audits: 3,
  in_progress: 2,
  completed: 2,
  closed: 1,
  critical_findings: 4,
  open_findings: 12,
  avg_compliance_score: 78.5,
  audits_by_type: { interna: 3, externa: 1, seguimiento: 2, certificacion: 1, extraordinaria: 1 },
  findings_by_severity: { critica: 4, alta: 6, media: 5, baja: 5 },
}

// ─── Auth ────────────────────────────────────────────────────────────────────
export const DEMO_TOKEN = 'demo-access-token-sigcya-2025'
export const DEMO_REFRESH = 'demo-refresh-token-sigcya-2025'

export const DEMO_ME_RESPONSE = DEMO_USER

export const DEMO_LOGIN_RESPONSE = {
  access_token: DEMO_TOKEN,
  refresh_token: DEMO_REFRESH,
  token_type: 'bearer',
  expires_in: 3600,
  refresh_expires_in: 86400,
  tenant_id: 'demo-tenant-001',
}
