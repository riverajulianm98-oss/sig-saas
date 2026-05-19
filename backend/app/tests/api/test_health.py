def test_health_endpoint(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    payload = response.json()
    assert payload["app_name"] == "SIG SaaS API"
    assert payload["status"] in ("healthy", "degraded", "unhealthy")
    assert payload["database"] in ("up", "down")
