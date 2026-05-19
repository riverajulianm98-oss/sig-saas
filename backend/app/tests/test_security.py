import uuid

from app.core.security import (
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)


def test_password_hash_roundtrip():
    hashed = hash_password("Secret123!")
    assert verify_password("Secret123!", hashed)
    assert not verify_password("wrong", hashed)


def test_jwt_create_and_decode():
    user_id = uuid.uuid4()
    tenant_id = uuid.uuid4()
    token = create_access_token(
        subject=user_id,
        tenant_id=tenant_id,
        role="admin_empresa",
    )
    payload = decode_access_token(token)
    assert payload is not None
    assert payload["sub"] == str(user_id)
    assert payload["tenant_id"] == str(tenant_id)
