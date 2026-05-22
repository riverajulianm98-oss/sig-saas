#!/usr/bin/env python3
"""
bootstrap_demo.py — Seeds a full demo dataset via the SIGCYA API.

Usage:
    python scripts/bootstrap_demo.py                     # uses localhost:8000
    python scripts/bootstrap_demo.py --url http://localhost:8000
    python scripts/bootstrap_demo.py --reset             # skip if tenant already exists

Creates:
  • Demo company (SIGCYA Consulting S.A.S.) + admin user
  • 5 controlled documents
  • 1 ISO 9001 audit template (15 checklist items)
  • 3 audits (9001 / 14001 / 45001)
  • 8 findings with varied severity
  • 6 action plans

Run once after: docker compose up -d && alembic upgrade head
"""

import argparse
import json
import sys
from datetime import date, timedelta

try:
    import requests
except ImportError:
    print("Install requests: pip install requests")
    sys.exit(1)

# ── Config ────────────────────────────────────────────────────────────────────
DEFAULT_URL = "http://localhost:8000"
API_V1 = "/api/v1"

COMPANY_NAME = "SIGCYA Consulting S.A.S."
ADMIN_EMAIL = "admin@sigcya.com"
ADMIN_PASSWORD = "SigAdmin2025!"
ADMIN_NAME = "Alejandro Gómez"

today = date.today()
next_week = today + timedelta(days=7)
next_month = today + timedelta(days=30)
last_month = today - timedelta(days=30)


# ── Helpers ───────────────────────────────────────────────────────────────────
def url(base: str, path: str) -> str:
    return f"{base}{API_V1}{path}"


def check(r: requests.Response, label: str) -> dict:
    if r.status_code not in (200, 201):
        print(f"  ✗ {label} — HTTP {r.status_code}: {r.text[:200]}")
        return {}
    data = r.json()
    print(f"  ✓ {label}")
    return data


def headers(token: str) -> dict:
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


def tenant_headers(token: str, tenant_id: str) -> dict:
    return {**headers(token), "X-Tenant-ID": tenant_id}


# ── Steps ─────────────────────────────────────────────────────────────────────
def step_register(base: str) -> tuple[str, str, str]:
    """Register company + admin. Returns (access_token, refresh_token, tenant_id)."""
    print("\n[1/7] Registrando empresa demo...")
    r = requests.post(url(base, "/auth/register"), json={
        "company_name": COMPANY_NAME,
        "admin_email": ADMIN_EMAIL,
        "admin_password": ADMIN_PASSWORD,
        "admin_full_name": ADMIN_NAME,
    })
    if r.status_code == 409:
        print("  → Empresa ya existe, intentando login...")
        return step_login(base)
    data = check(r, f"Empresa '{COMPANY_NAME}' creada")
    if not data:
        sys.exit(1)
    tokens = data.get("tokens", data)
    return tokens["access_token"], tokens["refresh_token"], tokens["tenant_id"]


def step_login(base: str) -> tuple[str, str, str]:
    r = requests.post(url(base, "/auth/login"), json={
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD,
    })
    data = check(r, f"Login como {ADMIN_EMAIL}")
    if not data:
        sys.exit(1)
    return data["access_token"], data["refresh_token"], data["tenant_id"]


def step_users(base: str, token: str, tenant_id: str) -> None:
    print("\n[2/7] Creando equipo SIG...")
    team = [
        {"email": "c.martinez@sigcya.com", "full_name": "Carlos Martínez", "role": "auditor",           "password": "Demo2025!"},
        {"email": "d.lopez@sigcya.com",    "full_name": "Diana López",      "role": "lider_proceso",    "password": "Demo2025!"},
        {"email": "m.rodriguez@sigcya.com","full_name": "María Rodríguez",  "role": "coordinador_sig",  "password": "Demo2025!"},
    ]
    hdrs = tenant_headers(token, tenant_id)
    for u in team:
        r = requests.post(url(base, "/users"), headers=hdrs, json=u)
        name = u["full_name"]
        if r.status_code == 409:
            print(f"  → {name} ya existe")
        else:
            check(r, f"Usuario {name} ({u['role']})")


def step_documents(base: str, token: str, tenant_id: str) -> list[str]:
    print("\n[3/7] Creando documentos controlados...")
    hdrs = tenant_headers(token, tenant_id)
    docs = [
        {"title": "Procedimiento control de documentos",  "document_type": "procedimiento", "process_area": "Calidad",       "expires_at": str(next_month + timedelta(days=180))},
        {"title": "Instructivo calibración equipos P-204","document_type": "instructivo",   "process_area": "Producción",    "expires_at": str(today + timedelta(days=5))},
        {"title": "Política de gestión ambiental",        "document_type": "politica",      "process_area": "Medio Ambiente","expires_at": str(next_month + timedelta(days=90))},
        {"title": "Manual HSEQ corporativo",              "document_type": "manual",        "process_area": "HSEQ",          "expires_at": str(last_month + timedelta(days=365))},
        {"title": "Formato registro de hallazgos",        "document_type": "formato",       "process_area": "Calidad",       "expires_at": str(next_month + timedelta(days=60))},
    ]
    ids = []
    for d in docs:
        r = requests.post(url(base, "/documents"), headers=hdrs, json=d)
        data = check(r, f"Doc: {d['title'][:40]}")
        if data:
            ids.append(data.get("id", ""))
    return ids


def step_audits(base: str, token: str, tenant_id: str) -> list[str]:
    print("\n[4/7] Creando auditorías...")
    hdrs = tenant_headers(token, tenant_id)
    audits_data = [
        {
            "title": "Auditoría ISO 9001 — Certificación Q2 2025",
            "audit_type": "externa",
            "iso_standards": ["ISO_9001_2015"],
            "process_area": "Calidad",
            "planned_start_date": str(today),
            "planned_end_date": str(next_week),
            "status": "in_progress",
        },
        {
            "title": "Auditoría ISO 14001 — Seguimiento Ambiental",
            "audit_type": "interna",
            "iso_standards": ["ISO_14001_2015"],
            "process_area": "Medio Ambiente",
            "planned_start_date": str(today + timedelta(days=14)),
            "planned_end_date": str(today + timedelta(days=21)),
            "status": "planned",
        },
        {
            "title": "Auditoría ISO 45001 — SST Producción",
            "audit_type": "interna",
            "iso_standards": ["ISO_45001_2018"],
            "process_area": "HSEQ",
            "planned_start_date": str(last_month),
            "planned_end_date": str(last_month + timedelta(days=5)),
            "actual_start_date": str(last_month),
            "actual_end_date": str(last_month + timedelta(days=5)),
            "compliance_score": 87,
            "status": "completed",
        },
    ]
    ids = []
    for a in audits_data:
        r = requests.post(url(base, "/audits"), headers=hdrs, json=a)
        data = check(r, f"Auditoría: {a['title'][:50]}")
        if data:
            ids.append(data.get("id", ""))
    return ids


def step_findings(base: str, token: str, tenant_id: str, audit_ids: list[str]) -> list[str]:
    print("\n[5/7] Creando hallazgos...")
    hdrs = tenant_headers(token, tenant_id)
    findings_data = [
        {"title": "Checklist de calibración desactualizado P-204",    "classification": "no_conformidad",  "severity": "critica", "process_area": "Producción",    "status": "open", "requirement_reference": "8.5.1"},
        {"title": "Ausencia de registros revisión por dirección",      "classification": "no_conformidad",  "severity": "alta",    "process_area": "Dirección",      "status": "open", "requirement_reference": "9.3"},
        {"title": "EPP no disponible para trabajadores sector B",      "classification": "no_conformidad",  "severity": "critica", "process_area": "HSEQ",           "status": "open", "requirement_reference": "8.8"},
        {"title": "Plan ambiental sin metas cuantificables de CO2",    "classification": "no_conformidad",  "severity": "alta",    "process_area": "Medio Ambiente", "status": "open", "requirement_reference": "6.2.1"},
        {"title": "Procedimiento de compras no incluye evaluación",    "classification": "observacion",     "severity": "media",   "process_area": "Compras",        "status": "open", "requirement_reference": "8.4"},
        {"title": "Falta de competencia documentada en 3 roles",       "classification": "oportunidad_mejora","severity": "baja",  "process_area": "RRHH",           "status": "in_progress", "requirement_reference": "7.2"},
        {"title": "Indicadores de proceso sin frecuencia de análisis", "classification": "observacion",     "severity": "media",   "process_area": "Calidad",        "status": "in_progress", "requirement_reference": "9.1"},
        {"title": "Gestión inadecuada de residuos peligrosos",        "classification": "no_conformidad",  "severity": "critica", "process_area": "Operaciones",    "status": "open", "requirement_reference": "8.1"},
    ]

    ids = []
    audit_id = audit_ids[0] if audit_ids else None
    if not audit_id:
        print("  → No hay auditorías, omitiendo hallazgos")
        return ids

    for f in findings_data:
        f["description"] = f"Hallazgo detectado durante la auditoría: {f['title']}"
        r = requests.post(url(base, f"/audits/{audit_id}/findings"), headers=hdrs, json=f)
        data = check(r, f"Hallazgo: {f['title'][:45]}")
        if data:
            ids.append(data.get("id", ""))
    return ids


def step_action_plans(base: str, token: str, tenant_id: str, audit_id: str, finding_ids: list[str]) -> None:
    print("\n[6/7] Creando acciones CAPA...")
    hdrs = tenant_headers(token, tenant_id)
    if not audit_id or not finding_ids:
        print("  → Sin auditoría o hallazgos, omitiendo acciones")
        return

    actions = [
        {"title": "Actualizar checklist calibración P-204",    "status": "in_progress", "due_date": str(next_week)},
        {"title": "Implementar formato revisión por dirección", "status": "open",        "due_date": str(last_month + timedelta(days=7))},
        {"title": "Dotar de EPP a los trabajadores del sector B","status": "open",       "due_date": str(today + timedelta(days=3))},
        {"title": "Definir metas CO2 en plan ambiental",        "status": "in_progress", "due_date": str(next_month)},
        {"title": "Actualizar procedimiento de compras",         "status": "open",        "due_date": str(next_month)},
        {"title": "Documentar competencias de los 3 roles",     "status": "completed",   "due_date": str(last_month + timedelta(days=10))},
    ]

    for i, action in enumerate(actions):
        fid = finding_ids[i % len(finding_ids)]
        action["description"] = f"Acción correctiva para cierre del hallazgo correspondiente."
        r = requests.post(url(base, f"/audits/{audit_id}/findings/{fid}/action-plans"), headers=hdrs, json=action)
        check(r, f"CAPA: {action['title'][:45]}")


def step_validate(base: str, token: str, tenant_id: str) -> None:
    print("\n[7/7] Validando flujo completo...")
    hdrs = tenant_headers(token, tenant_id)

    checks = [
        ("/health",           "Health check"),
        ("/auth/me",          "Auth: me"),
        ("/documents",        "Listado documentos"),
        ("/audits",           "Listado auditorías"),
        ("/audits/dashboard", "Dashboard auditorías"),
        ("/analytics/executive", "Analytics: executive summary"),
    ]

    all_ok = True
    for path, label in checks:
        try:
            r = requests.get(url(base, path), headers=hdrs, timeout=5)
            ok = r.status_code == 200
            status_icon = "✓" if ok else "✗"
            print(f"  {status_icon} {label} — HTTP {r.status_code}")
            if not ok:
                all_ok = False
        except Exception as e:
            print(f"  ✗ {label} — ERROR: {e}")
            all_ok = False

    print()
    if all_ok:
        print("✅ Demo bootstrap completo. Flujo validado.\n")
        print("   Próximos pasos:")
        print("   1. npm run dev  (en frontend/)")
        print("   2. Abrir http://localhost:3000/landing")
        print(f"   3. Login: {ADMIN_EMAIL} / {ADMIN_PASSWORD}")
    else:
        print("⚠️  Algunos checks fallaron. Revisa el backend.")


# ── Main ─────────────────────────────────────────────────────────────────────
def main() -> None:
    parser = argparse.ArgumentParser(description="Bootstrap demo data for SIGCYA")
    parser.add_argument("--url", default=DEFAULT_URL, help="Backend base URL")
    parser.add_argument("--reset", action="store_true", help="Force re-login if company exists")
    args = parser.parse_args()

    base = args.url.rstrip("/")
    print(f"\n🚀 SIGCYA Demo Bootstrap")
    print(f"   Backend: {base}")
    print(f"   Empresa: {COMPANY_NAME}")
    print(f"   Admin:   {ADMIN_EMAIL}")

    # Check connectivity
    try:
        r = requests.get(f"{base}/api/v1/health", timeout=5)
        health = r.json()
        db_status = health.get("database", "?")
        print(f"\n   Backend: {health.get('status', '?')} · DB: {db_status}")
        if db_status == "down":
            print("   ⚠️  Base de datos no disponible. Ejecuta: docker compose up -d")
            sys.exit(1)
    except Exception as e:
        print(f"\n   ✗ No se puede conectar al backend: {e}")
        print("   Ejecuta: uvicorn app.main:app --reload  (desde backend/)")
        sys.exit(1)

    access, _, tenant_id = step_register(base)
    step_users(base, access, tenant_id)
    step_documents(base, access, tenant_id)
    audit_ids = step_audits(base, access, tenant_id)
    finding_ids = step_findings(base, access, tenant_id, audit_ids)
    if audit_ids and finding_ids:
        step_action_plans(base, access, tenant_id, audit_ids[0], finding_ids)
    step_validate(base, access, tenant_id)


if __name__ == "__main__":
    main()
