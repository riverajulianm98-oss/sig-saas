import io
from datetime import UTC, datetime, timedelta

from app.tests.api.test_documents import _auth_headers


def test_upload_search_timeline_and_alerts(client):
    headers = _auth_headers(client, "admin@enterprise.com")

    expires = (datetime.now(UTC) + timedelta(days=5)).isoformat()
    create = client.post(
        "/api/v1/documents",
        headers=headers,
        json={
            "code": "proc-ent-01",
            "title": "Procedimiento enterprise",
            "document_type": "procedimiento",
            "process_area": "Calidad",
            "tags": ["iso", "calidad"],
            "expires_at": expires,
        },
    )
    assert create.status_code == 201
    doc = create.json()
    doc_id = doc["id"]
    version_id = doc["current_version"]["id"]

    pdf_bytes = b"%PDF-1.4 enterprise test content"
    upload = client.post(
        f"/api/v1/documents/{doc_id}/versions/{version_id}/upload",
        headers=headers,
        files={"file": ("manual.pdf", io.BytesIO(pdf_bytes), "application/pdf")},
    )
    assert upload.status_code == 200
    assert upload.json()["version"]["file_hash_sha256"]
    assert upload.json()["version"]["ai_metadata"]["index_status"] == "pending"

    search = client.get(
        "/api/v1/documents/search",
        headers=headers,
        params={"code": "PROC-ENT", "type": "procedimiento", "has_file": True},
    )
    assert search.status_code == 200
    assert search.json()["total"] >= 1

    timeline = client.get(f"/api/v1/documents/{doc_id}/timeline", headers=headers)
    assert timeline.status_code == 200
    actions = {e["action"] for e in timeline.json()["items"]}
    assert "created" in actions
    assert "file_uploaded" in actions

    alerts = client.get("/api/v1/documents/alerts", headers=headers)
    assert alerts.status_code == 200
    assert "expiring_critical" in alerts.json()

    download_meta = client.get(
        f"/api/v1/documents/{doc_id}/versions/{version_id}/download-url",
        headers=headers,
    )
    assert download_meta.status_code == 200
    assert str(doc_id) in download_meta.json()["url"]

    download = client.get(
        f"/api/v1/documents/{doc_id}/versions/{version_id}/download",
        headers=headers,
    )
    assert download.status_code == 200
    assert download.content.startswith(b"%PDF")

    settings = client.put(
        "/api/v1/documents/settings",
        headers=headers,
        json={"expiration_warning_days": 45, "expiration_critical_days": 10},
    )
    assert settings.status_code == 200
    assert settings.json()["expiration_warning_days"] == 45


def test_upload_rejects_invalid_mime(client):
    headers = _auth_headers(client, "admin@mime.com")
    create = client.post(
        "/api/v1/documents",
        headers=headers,
        json={
            "code": "proc-mime",
            "title": "Test mime",
            "document_type": "procedimiento",
        },
    )
    doc_id = create.json()["id"]
    version_id = create.json()["current_version"]["id"]

    bad = client.post(
        f"/api/v1/documents/{doc_id}/versions/{version_id}/upload",
        headers=headers,
        files={"file": ("evil.exe", io.BytesIO(b"MZ"), "application/x-msdownload")},
    )
    assert bad.status_code == 415
