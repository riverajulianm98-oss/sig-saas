def test_register_login_and_me(client):
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
    token = body["token"]["access_token"]
    tenant_id = body["tenant"]["id"]

    login_response = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@acme.com", "password": "SecurePass1!"},
    )
    assert login_response.status_code == 200
    assert login_response.json()["tenant_id"] == tenant_id

    me_response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me_response.status_code == 200
    assert me_response.json()["email"] == "admin@acme.com"
    assert me_response.json()["role"] == "admin_empresa"
