"""ISO checklist template API tests."""

from datetime import date, timedelta


def _headers(client, email: str = "tpl@sig.com") -> dict:
    response = client.post(
        "/api/v1/auth/register",
        json={
            "tenant": {"company_name": f"Template Co {email}"},
            "admin": {
                "email": email,
                "password": "SecurePass1!",
                "full_name": "Template Admin",
            },
        },
    )
    assert response.status_code == 201
    return {"Authorization": f"Bearer {response.json()['token']['access_token']}"}


def test_system_templates_and_audit_from_template(client, seed_iso_templates):
    headers = _headers(client)

    listed = client.get("/api/v1/audit-templates?iso=iso_9001", headers=headers)
    assert listed.status_code == 200
    items = listed.json()["items"]
    assert listed.json()["total"] >= 1
    system = next(i for i in items if i["code"] == "SYS-ISO9001")
    assert system["is_system"] is True

    detail = client.get(f"/api/v1/audit-templates/{system['id']}", headers=headers)
    assert detail.status_code == 200
    assert detail.json()["current_version"] is not None
    assert len(detail.json()["current_version"]["sections"]) >= 1

    audit = client.post(
        "/api/v1/audit-templates/audits/from-template",
        headers=headers,
        json={
            "template_id": system["id"],
            "code": "AUD-TPL-001",
            "title": "Auditoría desde plantilla ISO 9001",
            "audit_type": "interna",
            "process_area": "Calidad",
        },
    )
    assert audit.status_code == 201
    audit_id = audit.json()["id"]
    assert audit.json()["checklist_items_count"] > 0

    checklists = client.get(f"/api/v1/audits/{audit_id}/checklists", headers=headers)
    assert checklists.status_code == 200
    first = checklists.json()[0]
    assert first["template_id"] == system["id"]
    assert first["section_title"] is not None

    checklist_id = first["id"]
    response = client.put(
        f"/api/v1/audits/{audit_id}/checklists/{checklist_id}/response",
        headers=headers,
        json={"compliance_status": "no_cumple", "score": 0},
    )
    assert response.status_code == 200

    compliance = client.get(
        f"/api/v1/audit-templates/audits/{audit_id}/compliance", headers=headers
    )
    assert compliance.status_code == 200
    body = compliance.json()
    assert body["global_score"] is not None
    assert len(body["by_clause"]) >= 1
    assert isinstance(body["auto_finding_suggestions"], list)

    status_change = client.post(
        f"/api/v1/audits/{audit_id}/status",
        headers=headers,
        json={"status": "en_proceso"},
    )
    assert status_change.status_code == 200

    finalized = client.post(
        f"/api/v1/audits/{audit_id}/status",
        headers=headers,
        json={"status": "finalizada"},
    )
    assert finalized.status_code == 200
    assert finalized.json()["compliance_score"] is not None


def test_clone_template_and_custom_question(client, seed_iso_templates):
    headers = _headers(client, email="clone@sig.com")

    system = client.get("/api/v1/audit-templates?iso=iso_14001", headers=headers).json()
    source = next(i for i in system["items"] if i["code"] == "SYS-ISO14001")

    cloned = client.post(
        f"/api/v1/audit-templates/{source['id']}/clone",
        headers=headers,
        json={"code": "EMP-ISO14001", "title": "Plantilla ambiental personalizada"},
    )
    assert cloned.status_code == 201
    clone_id = cloned.json()["id"]
    assert cloned.json()["tenant_id"] is not None
    assert cloned.json()["source_template_id"] == source["id"]

    version_id = cloned.json()["current_version"]["id"]
    new_version = client.post(
        f"/api/v1/audit-templates/{clone_id}/versions",
        headers=headers,
        json={"change_summary": "Ajustes empresa"},
    )
    assert new_version.status_code == 201
    draft_version_id = new_version.json()["id"]

    section = client.post(
        f"/api/v1/audit-templates/{clone_id}/versions/{draft_version_id}/sections",
        headers=headers,
        json={
            "chapter_code": "7",
            "clause_code": "7.2",
            "title": "Competencia",
            "process_area": "RRHH",
            "sort_order": 99,
        },
    )
    assert section.status_code == 201
    section_id = section.json()["id"]

    question = client.post(
        f"/api/v1/audit-templates/{clone_id}/versions/{draft_version_id}/sections/{section_id}/questions",
        headers=headers,
        json={
            "clause_code": "7.2",
            "question_text": "¿El personal es competente?",
            "compliance_criteria": "Determinar competencia necesaria.",
            "criticality": "alta",
            "evidence_required": True,
        },
    )
    assert question.status_code == 201

    activated = client.post(
        f"/api/v1/audit-templates/{clone_id}/versions/activate",
        headers=headers,
        json={"version_id": draft_version_id},
    )
    assert activated.status_code == 200
    assert activated.json()["status"] == "active"


def test_apply_template_to_existing_audit(client, seed_iso_templates):
    headers = _headers(client, email="apply@sig.com")

    audit = client.post(
        "/api/v1/audits",
        headers=headers,
        json={
            "code": "AUD-PLAIN",
            "title": "Auditoría vacía",
            "audit_type": "interna",
            "planned_start_date": date.today().isoformat(),
            "planned_end_date": (date.today() + timedelta(days=3)).isoformat(),
        },
    )
    assert audit.status_code == 201
    audit_id = audit.json()["id"]

    template = client.get("/api/v1/audit-templates?iso=iso_45001", headers=headers).json()
    tpl = next(i for i in template["items"] if i["code"] == "SYS-ISO45001")

    applied = client.post(
        f"/api/v1/audit-templates/audits/{audit_id}/apply-template",
        headers=headers,
        json={"template_id": tpl["id"]},
    )
    assert applied.status_code == 200
    assert "Applied" in applied.json()["message"]

    checklists = client.get(f"/api/v1/audits/{audit_id}/checklists", headers=headers)
    assert len(checklists.json()) > 0
