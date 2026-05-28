#!/usr/bin/env python3
"""
Bootstrap real demo data into PostgreSQL.

Usage:
    cd backend
    python scripts/bootstrap_real_demo.py

Creates:
    - 1 demo company (tenant)
    - 3 demo users (admin, coordinador, auditor)
    - 5 audits with checklists and findings
    - 10 documents
    - Action plans (CAPA) linked to findings
"""

import sys
import os
from datetime import date, datetime, timedelta, UTC
import uuid

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import get_settings
from app.core.security import hash_password
from app.infrastructure.models.audit import Audit
from app.infrastructure.models.audit_action_plan import AuditActionPlan
from app.infrastructure.models.audit_finding import AuditFinding
from app.infrastructure.models.audit_plan import AuditPlan
from app.infrastructure.models.document import Document
from app.infrastructure.models.tenant import Tenant
from app.infrastructure.models.user import User
from app.db.base import Base  # noqa: F401 — ensures all models are loaded


# ── Configuration ─────────────────────────────────────────────────────────────

DEMO_EMAIL_ADMIN = "admin@demo.sigcya.com"
DEMO_EMAIL_COORD = "coordinador@demo.sigcya.com"
DEMO_EMAIL_AUDITOR = "auditor@demo.sigcya.com"
DEMO_PASSWORD = "Demo1234!"  # Change in production

TENANT_NAME = "Industrias Demo S.A.S"
TENANT_SLUG = "industrias-demo"
TENANT_PLAN = "professional"


def run():
    settings = get_settings()
    engine = create_engine(settings.database_url)
    Session = sessionmaker(bind=engine)
    db = Session()

    print("🌱 Iniciando bootstrap de datos demo...")

    try:
        # ── Tenant ────────────────────────────────────────────────────────────
        existing = db.query(Tenant).filter(Tenant.slug == TENANT_SLUG).first()
        if existing:
            print(f"⚠️  Tenant '{TENANT_SLUG}' ya existe. Eliminando datos anteriores...")
            # Remove existing data for this tenant
            tenant = existing
            for model in [AuditActionPlan, AuditFinding, Audit, AuditPlan, Document]:
                db.query(model).filter_by(tenant_id=tenant.id).delete()
            db.query(User).filter_by(tenant_id=tenant.id).delete()
            db.flush()
        else:
            tenant = Tenant(
                name=TENANT_NAME,
                slug=TENANT_SLUG,
                legal_name="Industrias Demo S.A.S",
                tax_id="900.123.456-7",
                is_active=True,
                plan=TENANT_PLAN,
            )
            db.add(tenant)
            db.flush()
            print(f"✅ Tenant creado: {tenant.name} (id={tenant.id})")

        tid = tenant.id

        # ── Users ─────────────────────────────────────────────────────────────
        admin_user = User(
            tenant_id=tid,
            email=DEMO_EMAIL_ADMIN,
            hashed_password=hash_password(DEMO_PASSWORD),
            full_name="Carlos Rodríguez",
            role="admin_empresa",
            is_active=True,
        )
        coord_user = User(
            tenant_id=tid,
            email=DEMO_EMAIL_COORD,
            hashed_password=hash_password(DEMO_PASSWORD),
            full_name="María García",
            role="coordinador_sig",
            is_active=True,
        )
        auditor_user = User(
            tenant_id=tid,
            email=DEMO_EMAIL_AUDITOR,
            hashed_password=hash_password(DEMO_PASSWORD),
            full_name="Alejandro Gómez",
            role="auditor",
            is_active=True,
        )
        db.add_all([admin_user, coord_user, auditor_user])
        db.flush()
        print(f"✅ Usuarios creados: {DEMO_EMAIL_ADMIN}, {DEMO_EMAIL_COORD}, {DEMO_EMAIL_AUDITOR}")

        # ── Audit plan ────────────────────────────────────────────────────────
        plan = AuditPlan(
            tenant_id=tid,
            code="PAA-2026",
            title="Programa Anual de Auditorías 2026",
            year=2026,
            description="Programa de auditorías internas ISO 9001, 14001 y 45001",
            status="activo",
            iso_standards=["iso_9001", "iso_14001", "iso_45001"],
        )
        db.add(plan)
        db.flush()

        # ── Audits ────────────────────────────────────────────────────────────
        audits_data = [
            {
                "code": "AUD-2026-001",
                "title": "Auditoría Gestión de Calidad - Q1",
                "audit_type": "interna",
                "status": "finalizada",
                "process_area": "Producción",
                "iso_standards": ["iso_9001"],
                "compliance_score": 87,
                "planned_start_date": date(2026, 2, 1),
                "planned_end_date": date(2026, 2, 5),
                "actual_start_date": date(2026, 2, 1),
                "actual_end_date": date(2026, 2, 5),
            },
            {
                "code": "AUD-2026-002",
                "title": "Auditoría Seguridad y Salud en el Trabajo",
                "audit_type": "interna",
                "status": "finalizada",
                "process_area": "Operaciones",
                "iso_standards": ["iso_45001"],
                "compliance_score": 74,
                "planned_start_date": date(2026, 3, 10),
                "planned_end_date": date(2026, 3, 12),
                "actual_start_date": date(2026, 3, 10),
                "actual_end_date": date(2026, 3, 12),
            },
            {
                "code": "AUD-2026-003",
                "title": "Auditoría Gestión Ambiental",
                "audit_type": "interna",
                "status": "en_proceso",
                "process_area": "Medio Ambiente",
                "iso_standards": ["iso_14001"],
                "planned_start_date": date(2026, 5, 20),
                "planned_end_date": date(2026, 5, 23),
                "actual_start_date": date(2026, 5, 20),
            },
            {
                "code": "AUD-2026-004",
                "title": "Auditoría Integrada SIG",
                "audit_type": "interna",
                "status": "planeada",
                "process_area": "Calidad",
                "iso_standards": ["iso_9001", "iso_14001", "iso_45001"],
                "planned_start_date": date(2026, 7, 14),
                "planned_end_date": date(2026, 7, 18),
            },
            {
                "code": "AUD-2026-005",
                "title": "Auditoría de Seguimiento - Acción Correctiva",
                "audit_type": "seguimiento",
                "status": "planeada",
                "process_area": "Producción",
                "iso_standards": ["iso_9001"],
                "planned_start_date": date(2026, 8, 5),
                "planned_end_date": date(2026, 8, 6),
            },
        ]

        created_audits = []
        for ad in audits_data:
            audit = Audit(
                tenant_id=tid,
                audit_plan_id=plan.id,
                lead_auditor_id=auditor_user.id,
                **{k: v for k, v in ad.items()},
            )
            db.add(audit)
            db.flush()
            created_audits.append(audit)
        print(f"✅ {len(created_audits)} auditorías creadas")

        # ── Findings ──────────────────────────────────────────────────────────
        findings_data = [
            # AUD-2026-001 findings
            {
                "audit": created_audits[0],
                "code": "HAL-001",
                "title": "Falta de calibración en equipos de medición",
                "description": "Se identificaron 3 equipos de medición sin calibración vigente en el área de producción.",
                "classification": "no_conformidad",
                "severity": "alta",
                "status": "cerrado",
                "requirement_reference": "7.1.5",
                "process_area": "Producción",
                "responsible_user_id": coord_user.id,
                "due_date": date(2026, 3, 31),
            },
            {
                "audit": created_audits[0],
                "code": "HAL-002",
                "title": "Procedimiento de inspección desactualizado",
                "description": "El procedimiento PR-INS-003 no ha sido revisado en más de 2 años.",
                "classification": "observacion",
                "severity": "media",
                "status": "en_seguimiento",
                "requirement_reference": "8.5.1",
                "process_area": "Calidad",
                "responsible_user_id": admin_user.id,
                "due_date": date(2026, 4, 30),
            },
            # AUD-2026-002 findings
            {
                "audit": created_audits[1],
                "code": "HAL-003",
                "title": "EPPs incompletos en área de soldadura",
                "description": "Trabajadores del área de soldadura no cuentan con pantallas faciales reglamentarias.",
                "classification": "no_conformidad",
                "severity": "critica",
                "status": "en_seguimiento",
                "requirement_reference": "8.1.2",
                "process_area": "Operaciones",
                "responsible_user_id": admin_user.id,
                "due_date": date(2026, 4, 15),
            },
            {
                "audit": created_audits[1],
                "code": "HAL-004",
                "title": "Falta de señalización de emergencia",
                "description": "2 rutas de evacuación no tienen señalización adecuada.",
                "classification": "no_conformidad",
                "severity": "alta",
                "status": "abierto",
                "requirement_reference": "8.2.1",
                "process_area": "Seguridad",
                "responsible_user_id": coord_user.id,
                "due_date": date(2026, 5, 31),
            },
            # AUD-2026-003 findings
            {
                "audit": created_audits[2],
                "code": "HAL-005",
                "title": "Gestión inadecuada de residuos peligrosos",
                "description": "Se encontraron residuos peligrosos sin etiquetado y sin segregación adecuada.",
                "classification": "no_conformidad",
                "severity": "alta",
                "status": "abierto",
                "requirement_reference": "8.1",
                "process_area": "Medio Ambiente",
                "responsible_user_id": coord_user.id,
                "due_date": date(2026, 6, 15),
            },
        ]

        created_findings = []
        for fd in findings_data:
            audit = fd.pop("audit")
            finding = AuditFinding(
                tenant_id=tid,
                audit_id=audit.id,
                source="manual",
                **fd,
            )
            db.add(finding)
            db.flush()
            created_findings.append(finding)
        print(f"✅ {len(created_findings)} hallazgos creados")

        # ── CAPA Actions ──────────────────────────────────────────────────────
        capa_data = [
            {
                "finding": created_findings[0],
                "title": "Calibrar todos los equipos de medición",
                "description": "Contratar empresa certificada para calibración de 3 equipos identificados.",
                "status": "completada",
                "responsible_user_id": coord_user.id,
                "due_date": date(2026, 3, 15),
                "completed_at": datetime(2026, 3, 12, tzinfo=UTC),
            },
            {
                "finding": created_findings[1],
                "title": "Actualizar procedimiento PR-INS-003",
                "description": "Revisión y aprobación del procedimiento de inspección.",
                "status": "en_progreso",
                "responsible_user_id": admin_user.id,
                "due_date": date(2026, 4, 20),
            },
            {
                "finding": created_findings[2],
                "title": "Adquirir pantallas faciales certificadas",
                "description": "Compra inmediata de 10 pantallas faciales ANSI Z87.1 para área de soldadura.",
                "status": "en_progreso",
                "responsible_user_id": admin_user.id,
                "due_date": date(2026, 4, 10),
            },
            {
                "finding": created_findings[2],
                "title": "Capacitar personal sobre uso correcto de EPPs",
                "description": "Taller de 4 horas sobre uso y mantenimiento de EPPs para toda el área.",
                "status": "pendiente",
                "responsible_user_id": coord_user.id,
                "due_date": date(2026, 4, 30),
            },
            {
                "finding": created_findings[3],
                "title": "Instalar señalización de emergencia",
                "description": "Adquirir e instalar señales de evacuación en rutas identificadas.",
                "status": "pendiente",
                "responsible_user_id": coord_user.id,
                "due_date": date(2026, 5, 20),
            },
        ]

        for cd in capa_data:
            finding = cd.pop("finding")
            action = AuditActionPlan(
                tenant_id=tid,
                finding_id=finding.id,
                **cd,
            )
            db.add(action)
        db.flush()
        print(f"✅ {len(capa_data)} acciones CAPA creadas")

        # ── Documents ─────────────────────────────────────────────────────────
        docs_data = [
            {"code": "MAN-SIG-001", "title": "Manual del Sistema Integrado de Gestión", "document_type": "manual", "status": "aprobado", "process_area": "Calidad"},
            {"code": "PR-CAL-001", "title": "Procedimiento de Control de Calidad", "document_type": "procedimiento", "status": "aprobado", "process_area": "Producción"},
            {"code": "PR-SST-001", "title": "Procedimiento de Inspección de Seguridad", "document_type": "procedimiento", "status": "aprobado", "process_area": "Seguridad"},
            {"code": "PR-MA-001", "title": "Procedimiento Gestión de Residuos", "document_type": "procedimiento", "status": "revision", "process_area": "Medio Ambiente"},
            {"code": "INS-CAL-001", "title": "Instructivo Calibración de Equipos", "document_type": "instructivo", "status": "aprobado", "process_area": "Producción"},
            {"code": "FOR-NC-001", "title": "Formato de No Conformidad", "document_type": "formato", "status": "aprobado", "process_area": "Calidad"},
            {"code": "FOR-CAPA-001", "title": "Formato de Acciones Correctivas", "document_type": "formato", "status": "aprobado", "process_area": "Calidad"},
            {"code": "PO-SST-001", "title": "Política de Seguridad y Salud en el Trabajo", "document_type": "politica", "status": "aprobado", "process_area": "Seguridad"},
            {"code": "PO-MA-001", "title": "Política Ambiental", "document_type": "politica", "status": "aprobado", "process_area": "Medio Ambiente"},
            {"code": "PR-INS-003", "title": "Procedimiento de Inspección de Producto", "document_type": "procedimiento", "status": "obsoleto", "process_area": "Producción"},
        ]

        for dd in docs_data:
            doc = Document(
                tenant_id=tid,
                owner_id=admin_user.id,
                tags=[],
                **dd,
            )
            db.add(doc)
        db.flush()
        print(f"✅ {len(docs_data)} documentos creados")

        db.commit()
        print("\n🎉 Bootstrap completado exitosamente!")
        print(f"\n📋 Credenciales de acceso:")
        print(f"   Admin:        {DEMO_EMAIL_ADMIN}  /  {DEMO_PASSWORD}")
        print(f"   Coordinador:  {DEMO_EMAIL_COORD}  /  {DEMO_PASSWORD}")
        print(f"   Auditor:      {DEMO_EMAIL_AUDITOR}  /  {DEMO_PASSWORD}")
        print(f"\n🌐 Tenant ID: {tid}")
        print(f"   Accede en: http://localhost:3000/login")

    except Exception as e:
        db.rollback()
        print(f"\n❌ Error durante el bootstrap: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    run()
