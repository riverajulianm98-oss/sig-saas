"""Finding intelligence API tests."""


def _headers(client, email: str = "fi@sig.com") -> dict:
    response = client.post(
        "/api/v1/auth/register",
        json={
            "tenant": {"company_name": f"FI Co {email}"},
            "admin": {
                "email": email,
                "password": "SecurePass1!",
                "full_name": "FI Admin",
            },
        },
    )
    assert response.status_code == 201
    return {"Authorization": f"Bearer {response.json()['token']['access_token']}"}


def test_intelligent_findings_lifecycle(client, seed_iso_templates):
    headers = _headers(client)

    settings = client.get("/api/v1/audits/settings/finding-generation", headers=headers)
    assert settings.status_code == 200
    assert settings.json()["sensitivity"] == "media"

    tpl = client.get("/api/v1/audit-templates?iso=iso_9001", headers=headers).json()
    system = next(i for i in tpl["items"] if i["code"] == "SYS-ISO9001")

    audit = client.post(
        "/api/v1/audit-templates/audits/from-template",
        headers=headers,
        json={
            "template_id": system["id"],
            "code": "AUD-FI-001",
            "title": "Auditoría hallazgos inteligentes",
            "audit_type": "interna",
            "process_area": "Calidad",
        },
    )
    assert audit.status_code == 201
    audit_id = audit.json()["id"]

    checklists = client.get(f"/api/v1/audits/{audit_id}/checklists", headers=headers).json()
    assert len(checklists) > 0
    target = checklists[0]

    client.put(
        f"/api/v1/audits/{audit_id}/checklists/{target['id']}/response",
        headers=headers,
        json={"compliance_status": "no_cumple", "score": 0},
    )

    for item in checklists[1:3]:
        client.put(
            f"/api/v1/audits/{audit_id}/checklists/{item['id']}/response",
            headers=headers,
            json={"compliance_status": "cumple", "score": 100},
        )

    generated = client.post(
        f"/api/v1/audits/{audit_id}/finding-suggestions/generate",
        headers=headers,
        json={"auto_submit_validation": True},
    )
    assert generated.status_code == 201
    assert generated.json()["created"] >= 1
    suggestion_id = generated.json()["items"][0]["id"]
    assert generated.json()["items"][0]["confidence_score"] > 0
    assert generated.json()["items"][0]["ai_metadata"]["nlp_ready"] is True

    listed = client.get(
        f"/api/v1/audits/{audit_id}/finding-suggestions", headers=headers
    )
    assert listed.status_code == 200
    assert len(listed.json()) >= 1

    approved = client.post(
        f"/api/v1/audits/{audit_id}/finding-suggestions/{suggestion_id}/approve",
        headers=headers,
        json={},
    )
    assert approved.status_code == 200
    assert approved.json()["status"] == "aprobado"
    assert approved.json()["converted_finding_id"] is not None

    findings = client.get(f"/api/v1/audits/{audit_id}/findings", headers=headers)
    assert findings.status_code == 200
    assert any(f["title"] == approved.json()["title"] for f in findings.json())

    converted = client.post(
        f"/api/v1/audits/{audit_id}/finding-suggestions/{suggestion_id}/convert-action",
        headers=headers,
        json={
            "title": "Acción correctiva documentación",
            "description": "Actualizar procedimiento y capacitar personal.",
        },
    )
    assert converted.status_code == 200
    assert converted.json()["status"] == "convertido_accion"

    history = client.get(
        f"/api/v1/audits/{audit_id}/finding-suggestions/{suggestion_id}/history",
        headers=headers,
    )
    assert history.status_code == 200
    assert len(history.json()) >= 2

    dash = client.get("/api/v1/audits/finding-suggestions/dashboard", headers=headers)
    assert dash.status_code == 200
    assert dash.json()["total_suggestions"] >= 1

    compliance = client.get(
        f"/api/v1/audit-templates/audits/{audit_id}/compliance", headers=headers
    )
    assert compliance.status_code == 200
    assert len(compliance.json()["auto_finding_suggestions"]) >= 1


def test_discard_suggestion(client, seed_iso_templates):
    headers = _headers(client, email="discard@sig.com")

    tpl = client.get("/api/v1/audit-templates?iso=iso_45001", headers=headers).json()
    system = next(i for i in tpl["items"] if i["code"] == "SYS-ISO45001")

    audit = client.post(
        "/api/v1/audit-templates/audits/from-template",
        headers=headers,
        json={
            "template_id": system["id"],
            "code": "AUD-DISC",
            "title": "Auditoría descarte",
            "audit_type": "interna",
        },
    )
    audit_id = audit.json()["id"]
    checklist = client.get(f"/api/v1/audits/{audit_id}/checklists", headers=headers).json()[0]
    client.put(
        f"/api/v1/audits/{audit_id}/checklists/{checklist['id']}/response",
        headers=headers,
        json={"compliance_status": "parcial", "score": 40},
    )

    gen = client.post(
        f"/api/v1/audits/{audit_id}/finding-suggestions/generate",
        headers=headers,
        json={},
    )
    sid = gen.json()["items"][0]["id"]

    discarded = client.post(
        f"/api/v1/audits/{audit_id}/finding-suggestions/{sid}/discard",
        headers=headers,
        json={"reason": "Falso positivo verificado en sitio."},
    )
    assert discarded.status_code == 200
    assert discarded.json()["status"] == "descartado"
    assert discarded.json()["discard_reason"] is not None
