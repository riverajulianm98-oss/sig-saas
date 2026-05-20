def test_register_login_refresh_and_me(client):
    register_payload = {
        "tenant": {
            "company_name": "Acme Colombia",
            "legal_name": "Acme SAS",
            "tax_id": "900123456",
        },
        "admin": {
            "email": "admin@acme.com",
            "password": "SecurePass1!",
            "full_name": "Admin Acme",
        },
    }
    register_response = client.post("/api/v1/auth/register", json=register_payload)
    assert register_response.status_code == 201
    body = register_response.json()
    refresh_token = body["token"]["refresh_token"]
    tenant_id = body["tenant"]["id"]
    assert refresh_token

    login_response = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@acme.com", "password": "SecurePass1!"},
    )
    assert login_response.status_code == 200
    assert login_response.json()["tenant_id"] == tenant_id

    refresh_response = client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": refresh_token},
    )
    assert refresh_response.status_code == 200
    refreshed = refresh_response.json()
    assert refreshed["refresh_token"] != refresh_token

    me_response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {refreshed['access_token']}"},
    )
    assert me_response.status_code == 200
    assert me_response.json()["email"] == "admin@acme.com"

    logout_response = client.post(
        "/api/v1/auth/logout",
        json={"refresh_token": refreshed["refresh_token"]},
    )
    assert logout_response.status_code == 200
