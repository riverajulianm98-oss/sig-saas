def _auth_headers(client, email: str = "admin@docs.com") -> dict:
    response = client.post(
        "/api/v1/auth/register",
        json={
            "tenant": {"company_name": "Docs Corp"},
            "admin": {
                "email": email,
                "password": "SecurePass1!",
                "full_name": "Admin Docs",
            },
        },
    )
    assert response.status_code == 201
    token = response.json()["token"]["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_document_lifecycle(client):
    headers = _auth_headers(client)

    create = client.post(
        "/api/v1/documents",
        headers=headers,
        json={
            "code": "proc-001",
            "title": "Procedimiento de calidad",
            "document_type": "procedimiento",
            "description": "Control documental ISO 9001",
            "tags": ["calidad", "iso"],
        },
    )
    assert create.status_code == 201
    doc = create.json()
    assert doc["status"] == "borrador"
    assert doc["current_version"]["version_number"] == 1
    doc_id = doc["id"]

    to_review = client.post(
        f"/api/v1/documents/{doc_id}/status",
        headers=headers,
        json={"status": "revision"},
    )
    assert to_review.status_code == 200
    assert to_review.json()["status"] == "revision"

    approved = client.post(
        f"/api/v1/documents/{doc_id}/status",
        headers=headers,
        json={"status": "aprobado"},
    )
    assert approved.status_code == 200
    assert approved.json()["status"] == "aprobado"

    new_version = client.post(
        f"/api/v1/documents/{doc_id}/versions",
        headers=headers,
        json={"change_summary": "Actualización anual del procedimiento"},
    )
    assert new_version.status_code == 201
    assert new_version.json()["status"] == "borrador"
    assert new_version.json()["current_version"]["version_number"] == 2

    listing = client.get(
        "/api/v1/documents",
        headers=headers,
        params={"status": "borrador", "search": "calidad"},
    )
    assert listing.status_code == 200
    assert listing.json()["total"] >= 1

    obsolete = client.post(
        f"/api/v1/documents/{doc_id}/status",
        headers=headers,
        json={"status": "revision"},
    )
    assert obsolete.status_code == 200

    approved_again = client.post(
        f"/api/v1/documents/{doc_id}/status",
        headers=headers,
        json={"status": "aprobado"},
    )
    assert approved_again.status_code == 200

    mark_obsolete = client.post(
        f"/api/v1/documents/{doc_id}/status",
        headers=headers,
        json={"status": "obsoleto"},
    )
    assert mark_obsolete.status_code == 200
    assert mark_obsolete.json()["status"] == "obsoleto"


def test_invalid_status_transition(client):
    headers = _auth_headers(client, "admin@invalid.com")

    create = client.post(
        "/api/v1/documents",
        headers=headers,
        json={
            "code": "pol-001",
            "title": "Política SST",
            "document_type": "politica",
        },
    )
    doc_id = create.json()["id"]

    invalid = client.post(
        f"/api/v1/documents/{doc_id}/status",
        headers=headers,
        json={"status": "aprobado"},
    )
    assert invalid.status_code == 400
