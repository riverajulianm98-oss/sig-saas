import io
from datetime import date, timedelta

def _auditor_headers(client, email: str = "auditor@sig.com") -> dict:
    response = client.post(
        "/api/v1/auth/register",
        json={
            "tenant": {"company_name": f"Audit Co {email}"},
            "admin": {
                "email": email,
                "password": "SecurePass1!",
                "full_name": "Lead Auditor",
            },
        },
    )
    assert response.status_code == 201
    return {"Authorization": f"Bearer {response.json()['token']['access_token']}"}


def test_audit_full_lifecycle(client):
    headers = _auditor_headers(client)

    plan = client.post(
        "/api/v1/audits/plans",
        headers=headers,
        json={
            "code": "PLAN-2026",
            "title": "Plan auditorías 2026",
            "year": 2026,
            "iso_standards": ["iso_9001", "iso_45001"],
        },
    )
    assert plan.status_code == 201
    plan_id = plan.json()["id"]

    audit = client.post(
        "/api/v1/audits",
        headers=headers,
        json={
            "code": "AUD-001",
            "title": "Auditoría interna SIG",
            "audit_type": "interna",
            "audit_plan_id": plan_id,
            "iso_standards": ["iso_9001"],
            "process_area": "Producción",
            "planned_start_date": date.today().isoformat(),
            "planned_end_date": (date.today() + timedelta(days=7)).isoformat(),
        },
    )
    assert audit.status_code == 201
    audit_id = audit.json()["id"]

    checklist = client.post(
        f"/api/v1/audits/{audit_id}/checklists",
        headers=headers,
        json={
            "iso_standard": "iso_9001",
            "clause_code": "8.5.1",
            "requirement_text": "Control de producción",
            "question_text": "¿Se controla la producción?",
            "sort_order": 1,
        },
    )
    assert checklist.status_code == 201
    checklist_id = checklist.json()["id"]

    response = client.put(
        f"/api/v1/audits/{audit_id}/checklists/{checklist_id}/response",
        headers=headers,
        json={"compliance_status": "cumple", "score": 95},
    )
    assert response.status_code == 200

    finding = client.post(
        f"/api/v1/audits/{audit_id}/findings",
        headers=headers,
        json={
            "title": "Hallazgo menor documentación",
            "description": "Falta registro en formato X",
            "classification": "observacion",
            "severity": "media",
            "process_area": "Producción",
        },
    )
    assert finding.status_code == 201
    finding_id = finding.json()["id"]

    action = client.post(
        f"/api/v1/audits/{audit_id}/findings/{finding_id}/action-plans",
        headers=headers,
        json={
            "title": "Actualizar formato X",
            "due_date": (date.today() + timedelta(days=14)).isoformat(),
        },
    )
    assert action.status_code == 201

    doc = client.post(
        "/api/v1/documents",
        headers=headers,
        json={
            "code": "PROC-LINK",
            "title": "Procedimiento vinculado",
            "document_type": "procedimiento",
        },
    )
    assert doc.status_code == 201
    document_id = doc.json()["id"]

    evidence = client.post(
        f"/api/v1/audits/{audit_id}/evidences/document",
        headers=headers,
        json={"document_id": document_id, "description": "Procedimiento de referencia"},
    )
    assert evidence.status_code == 201

    pdf = client.post(
        f"/api/v1/audits/{audit_id}/evidences/upload",
        headers=headers,
        files={"file": ("evidencia.pdf", io.BytesIO(b"%PDF-audit"), "application/pdf")},
    )
    assert pdf.status_code == 201

    status_flow = client.post(
        f"/api/v1/audits/{audit_id}/status",
        headers=headers,
        json={"status": "en_proceso"},
    )
    assert status_flow.status_code == 200

    finalized = client.post(
        f"/api/v1/audits/{audit_id}/status",
        headers=headers,
        json={"status": "finalizada"},
    )
    assert finalized.status_code == 200
    assert finalized.json()["compliance_score"] is not None

    timeline = client.get(f"/api/v1/audits/{audit_id}/timeline", headers=headers)
    assert timeline.status_code == 200
    assert timeline.json()["total"] >= 5

    dashboard = client.get("/api/v1/audits/dashboard", headers=headers)
    assert dashboard.status_code == 200
    assert dashboard.json()["open_audits"] >= 1
