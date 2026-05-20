def _register_admin(client, email: str) -> dict:
    response = client.post(
        "/api/v1/auth/register",
        json={
            "tenant": {"company_name": f"Empresa {email}"},
            "admin": {
                "email": email,
                "password": "SecurePass1!",
                "full_name": "Admin",
            },
        },
    )
    assert response.status_code == 201
    return response.json()


def test_admin_crud_users(client):
    data = _register_admin(client, "admin@crud.com")
    headers = {"Authorization": f"Bearer {data['token']['access_token']}"}

    create_response = client.post(
        "/api/v1/users",
        headers=headers,
        json={
            "email": "user@crud.com",
            "password": "SecurePass1!",
            "full_name": "Usuario SIG",
            "role": "usuario",
        },
    )
    assert create_response.status_code == 201
    user_id = create_response.json()["id"]

    list_response = client.get("/api/v1/users", headers=headers)
    assert list_response.status_code == 200
    assert list_response.json()["total"] >= 2

    patch_response = client.patch(
        f"/api/v1/users/{user_id}",
        headers=headers,
        json={"full_name": "Usuario Actualizado"},
    )
    assert patch_response.status_code == 200
    assert patch_response.json()["full_name"] == "Usuario Actualizado"

    delete_response = client.delete(f"/api/v1/users/{user_id}", headers=headers)
    assert delete_response.status_code == 200


def test_usuario_cannot_list_users(client):
    data = _register_admin(client, "admin@rbac.com")
    admin_headers = {"Authorization": f"Bearer {data['token']['access_token']}"}

    client.post(
        "/api/v1/users",
        headers=admin_headers,
        json={
            "email": "basic@rbac.com",
            "password": "SecurePass1!",
            "full_name": "Basico",
            "role": "usuario",
        },
    )

    login = client.post(
        "/api/v1/auth/login",
        json={"email": "basic@rbac.com", "password": "SecurePass1!"},
    )
    user_headers = {"Authorization": f"Bearer {login.json()['access_token']}"}

    forbidden = client.get("/api/v1/users", headers=user_headers)
    assert forbidden.status_code == 403
