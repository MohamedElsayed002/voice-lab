from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest
from fastapi import HTTPException

from app.auth.schemas.auth import LoginRequest
from app.auth.services.auth_service import AuthService
import app.auth.services.auth_service as auth_service_module


@pytest.mark.asyncio
async def test_failed_login_audit_status_is_a_string(monkeypatch: pytest.MonkeyPatch) -> None:
    service = AuthService()
    audit_service = SimpleNamespace(create_audit_log=AsyncMock())
    monkeypatch.setattr(service, "audit_service", audit_service)
    monkeypatch.setattr(service, "_find_user_by_email", AsyncMock(return_value=None))

    with pytest.raises(HTTPException):
        await service.login(AsyncMock(), LoginRequest(email="user@example.com", password="password"))

    audit_service.create_audit_log.assert_awaited_once()
    assert audit_service.create_audit_log.call_args.kwargs["status"] == "401"


@pytest.mark.asyncio
async def test_login_delegates_session_creation(monkeypatch: pytest.MonkeyPatch) -> None:
    session_service = SimpleNamespace(create_session=AsyncMock(return_value={"access_token": "access", "refresh_token": "refresh", "token_type": "bearer"}))
    service = AuthService(session_service=session_service)
    user = SimpleNamespace(
        id="user-id",
        hashed_password="hashed",
        is_active=True,
    )
    monkeypatch.setattr(service, "_find_user_by_email", AsyncMock(return_value=user))
    monkeypatch.setattr(
        auth_service_module,
        "verify_and_update_password",
        lambda _password, _hash: (True, None),
    )

    result = await service.login(
        AsyncMock(),
        LoginRequest(email="user@example.com", password="password"),
    )

    assert result["access_token"] == "access"
    session_service.create_session.assert_awaited_once()
