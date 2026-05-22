#!/usr/bin/env python3
"""
bootstrap_demo.py -- Seeds a full demo dataset via the SIGCYA API.

Usage:
    python scripts/bootstrap_demo.py                     # uses localhost:8000
    python scripts/bootstrap_demo.py --url http://localhost:8000

Creates:
  - Demo company (SIGCYA Consulting S.A.S.) + admin user
  - 3 additional team members
  - 5 controlled documents
  - 3 audits (ISO 9001 / 14001 / 45001)
  - 8 findings with varied severity
  - 6 action plans

Run once after: docker compose up -d && alembic upgrade head && uvicorn app.main:app --reload
"""

import argparse
import sys
from datetime import date, timedelta

try:
    import requests
except ImportError:
    print("Install requests: pip install requests")
    sys.exit(1)

# ---- Config ------------------------------------------------------------------
DEFAULT_URL = "http://localhost:8000"
API_V1 = "/api/v1"

COMPANY_NAME = "SIGCYA Consulting S.A.S."
ADMIN_EMAIL = "admin@sigcya.com"
ADMIN_PASSWORD = "SigAdmin2025!"
ADMIN_NAME = "Alejandro Gomez"

today = date.today()
next_week = today + timedelta(days=7)
next_month = today + timedelta(days=30)
last_month = today - timedelta(days=30)


# ---- Helpers -----------------------------------------------------------------
def url(base: str, path: str) -> str:
    return f"{base}{API_V1}{path}"


def check(r: requests.Response, label: str) -> dict:
    if r.status_code not in (200, 201):
        print(f"  [X] {label} - HTTP {r.status_code}: {r.text[:200]}")
        return {}
    data = r.json()
    print(f"  [OK] {label}")
    return data


def headers(token: str) -> dict:
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


def tenant_headers(token: str, tenant_id: str) -> dict:
    return {**headers(token), "X-Tenant-ID": tenant_id}


# ---- Steps -------------------------------------------------------------------
def step_register(base: str) -> tuple[str, str, str]:
    """Register company + admin. Returns (access_token, refresh_token, tenant_id)."""
    print("\n[1/7] Registrando empresa demo...")
    r = requests.post(url(base, "/auth/register"), json={
        "tenant": {"company_name": COMPANY_NAME, "plan": "trial"},
        "admin": {"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD, "full_name": ADMIN_NAME},
    })
    if r.status_code == 409:
        print("  -> Empresa ya existe, iniciando sesion...")
        return step_login(base)
    data = check(r, f"Empresa '{COMPANY_NAME}' creada")
    if not data:
        sys.exit(1)
    token = data["token"]
    return token["access_token"], token["refresh_token"], str(token["tenant_id"])


def step_login(base: str) -> tuple[str, str, str]:
    r = requests.post(url(base, "/auth/login"), json={
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD,
    })
    data = check(r, f"Login como {ADMIN_EMAIL}")
    if not data:
        sys.exit(1)
    return data["access_token"], data["refresh_token"], str(data["tenant_id"])


def step_users(base: str, token: str, tenant_id: str) -> None:
    print("\n[2/7] Creando equipo SIG...")
    team = [
        {"email": "c.martinez@sigcya.com", "full_name": "Carlos Martinez",  "role": "auditor",          "password": "Demo2025!"},
        {"email": "d.lopez@sigcya.com",    "full_name": "Diana Lopez",       "role": "lider_proceso",    "password": "Demo2025!"},
        {"email": "m.rodriguez@sigcya.com","full_name": "Maria Rodriguez",   "role": "coordinador_sig",  "password": "Demo2025!"},
    ]
    hdrs = tenant_headers(token, tenant_id)
    for u in team:
        r = requests.post(url(base, "/users"), headers=hdrs, json=u)
        name = u["full_name"]
        if r.status_code == 409:
            print(f"  -> {name} ya existe")
        else:
            check(r, f"Usuario {name} ({u['role']})")


def step_documents(base: str, token: str, tenant_id: str) -> list[str]:
    print("\n[3/7] Creando documentos controlados...")
    hdrs = tenant_headers(token, tenant_id)
    docs = [
        {"code": "PRO-CAL-001", "title": "Procedimiento control de documentos",   "document_type": "procedimiento", "process_area": "Calidad",       "expires_at": str(next_month + timedelta(days=180))},
        {"code": "INS-PRO-204", "title": "Instructivo calibracion equipos P-204", "document_type": "instructivo",   "process_area": "Produccion",    "expires_at": str(today + timedelta(days=5))},
        {"code": "POL-AMB-001", "title": "Politica de gestion ambiental",         "document_type": "politica",      "process_area": "Medio Ambiente","expires_at": str(next_month + timedelta(days=90))},
        {"code": "MAN-HSE-001", "title": "Manual HSEQ corporativo",               "document_type": "manual",        "process_area": "HSEQ",          "expires_at": str(last_month + timedelta(days=365))},
        {"code": "FOR-CAL-001", "title": "Formato registro de hallazgos",         "document_type": "formato",       "process_area": "Calidad",       "expires_at": str(next_month + timedelta(days=60))},
    ]
    ids = []
    for d in docs:
        r = requests.post(url(base, "/documents"), headers=hdrs, json=d)
        data = check(r, f"Doc: {d['title'][:40]}")
        if data:
            ids.append(data.get("id", ""))
    return ids


def step_audits(base: str, token: str, tenant_id: str) -> list[str]:
    print("\n[4/7] Creando auditorias...")
    hdrs = tenant_headers(token, tenant_id)
    audits_data = [
        {
            "code": "AUD-9001-2025-01",
            "title": "Auditoria ISO 9001 - Certificacion Q2 2025",
            "audit_type": "externa",
            "iso_standards": ["iso_9001"],
            "process_area": "Calidad",
            "planned_start_date": str(today),
            "planned_end_date": str(next_week),
        },
        {
            "code": "AUD-14001-2025-01",
            "title": "Auditoria ISO 14001 - Seguimiento Ambiental",
            "audit_type": "interna",
            "iso_standards": ["iso_14001"],
            "process_area": "Medio Ambiente",
            "planned_start_date": str(today + timedelta(days=14)),
            "planned_end_date": str(today + timedelta(days=21)),
        },
        {
            "code": "AUD-45001-2025-01",
            "title": "Auditoria ISO 45001 - SST Produccion",
            "audit_type": "interna",
            "iso_standards": ["iso_45001"],
            "process_area": "HSEQ",
            "planned_start_date": str(last_month),
            "planned_end_date": str(last_month + timedelta(days=5)),
        },
    ]
    ids = []
    for a in audits_data:
        r = requests.post(url(base, "/audits"), headers=hdrs, json=a)
        data = check(r, f"Auditoria: {a['title'][:50]}")
        if data:
            ids.append(data.get("id", ""))
    return ids


def step_findings(base: str, token: str, tenant_id: str, audit_ids: list[str]) -> list[str]:
    print("\n[5/7] Creando hallazgos...")
    hdrs = tenant_headers(token, tenant_id)
    findings_data = [
        {"title": "Checklist de calibracion desactualizado P-204",  "classification": "no_conformidad",   "severity": "critica", "process_area": "Produccion",    "requirement_reference": "8.5.1"},
        {"title": "Ausencia de registros revision por direccion",     "classification": "no_conformidad",   "severity": "alta",    "process_area": "Direccion",      "requirement_reference": "9.3"},
        {"title": "EPP no disponible para trabajadores sector B",     "classification": "no_conformidad",   "severity": "critica", "process_area": "HSEQ",           "requirement_reference": "8.8"},
        {"title": "Plan ambiental sin metas cuantificables de CO2",  "classification": "no_conformidad",   "severity": "alta",    "process_area": "Medio Ambiente", "requirement_reference": "6.2.1"},
        {"title": "Procedimiento de compras no incluye evaluacion",  "classification": "observacion",      "severity": "media",   "process_area": "Compras",        "requirement_reference": "8.4"},
        {"title": "Falta de competencia documentada en 3 roles",     "classification": "oportunidad_mejora","severity": "baja",   "process_area": "RRHH",           "requirement_reference": "7.2"},
        {"title": "Indicadores sin frecuencia de analisis definida", "classification": "observacion",      "severity": "media",   "process_area": "Calidad",        "requirement_reference": "9.1"},
        {"title": "Gestion inadecuada de residuos peligrosos",       "classification": "no_conformidad",   "severity": "critica", "process_area": "Operaciones",    "requirement_reference": "8.1"},
    ]

    ids = []
    audit_id = audit_ids[0] if audit_ids else None
    if not audit_id:
        print("  -> Sin auditorias, omitiendo hallazgos")
        return ids

    for f in findings_data:
        f["description"] = f"Hallazgo detectado durante la auditoria: {f['title']}"
        r = requests.post(url(base, f"/audits/{audit_id}/findings"), headers=hdrs, json=f)
        data = check(r, f"Hallazgo: {f['title'][:45]}")
        if data:
            ids.append(data.get("id", ""))
    return ids


def step_action_plans(base: str, token: str, tenant_id: str, audit_id: str, finding_ids: list[str]) -> None:
    print("\n[6/7] Creando acciones CAPA...")
    hdrs = tenant_headers(token, tenant_id)
    if not audit_id or not finding_ids:
        print("  -> Sin auditoria o hallazgos, omitiendo acciones")
        return

    actions = [
        {"title": "Actualizar checklist calibracion P-204",      "due_date": str(next_week)},
        {"title": "Implementar formato revision por direccion",   "due_date": str(last_month + timedelta(days=7))},
        {"title": "Dotar de EPP a los trabajadores del sector B", "due_date": str(today + timedelta(days=3))},
        {"title": "Definir metas CO2 en plan ambiental",         "due_date": str(next_month)},
        {"title": "Actualizar procedimiento de compras",          "due_date": str(next_month)},
        {"title": "Documentar competencias de los 3 roles",      "due_date": str(last_month + timedelta(days=10))},
    ]

    for i, action in enumerate(actions):
        fid = finding_ids[i % len(finding_ids)]
        action["description"] = "Accion correctiva para cierre del hallazgo correspondiente."
        r = requests.post(url(base, f"/audits/{audit_id}/findings/{fid}/action-plans"), headers=hdrs, json=action)
        check(r, f"CAPA: {action['title'][:45]}")


def step_validate(base: str, token: str, tenant_id: str) -> None:
    print("\n[7/7] Validando flujo completo...")
    hdrs = tenant_headers(token, tenant_id)

    checks = [
        ("/health",           "Health check"),
        ("/auth/me",          "Auth: me"),
        ("/documents",        "Listado documentos"),
        ("/audits",           "Listado auditorias"),
        ("/audits/dashboard", "Dashboard auditorias"),
        ("/analytics/executive", "Analytics: executive summary"),
    ]

    all_ok = True
    for path, label in checks:
        try:
            r = requests.get(url(base, path), headers=hdrs, timeout=5)
            ok = r.status_code == 200
            status_icon = "[OK]" if ok else "[X]"
            print(f"  {status_icon} {label} - HTTP {r.status_code}")
            if not ok:
                all_ok = False
        except Exception as e:
            print(f"  [X] {label} - ERROR: {e}")
            all_ok = False

    print()
    if all_ok:
        print("[OK] Demo bootstrap completo. Flujo validado.\n")
        print("   Proximos pasos:")
        print("   1. npm run dev  (en frontend/)")
        print("   2. Abrir http://localhost:3000/landing")
        print(f"   3. Login: {ADMIN_EMAIL} / {ADMIN_PASSWORD}")
    else:
        print("[WARN] Algunos checks fallaron. Revisa el backend.")


# ---- Main --------------------------------------------------------------------
def main() -> None:
    parser = argparse.ArgumentParser(description="Bootstrap demo data for SIGCYA")
    parser.add_argument("--url", default=DEFAULT_URL, help="Backend base URL")
    args = parser.parse_args()

    base = args.url.rstrip("/")
    print(f"\n=== SIGCYA Demo Bootstrap ===")
    print(f"   Backend: {base}")
    print(f"   Empresa: {COMPANY_NAME}")
    print(f"   Admin:   {ADMIN_EMAIL}")

    try:
        r = requests.get(f"{base}/api/v1/health", timeout=5)
        health = r.json()
        db_status = health.get("database", "?")
        print(f"\n   Backend: {health.get('status', '?')} | DB: {db_status}")
        if db_status == "down":
            print("   [!] Base de datos no disponible. Ejecuta: docker compose up -d")
            sys.exit(1)
    except Exception as e:
        print(f"\n   [X] No se puede conectar al backend: {e}")
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
