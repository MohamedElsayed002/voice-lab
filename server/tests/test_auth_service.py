from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest
from fastapi import HTTPException

from app.auth.schemas.auth import LoginRequest
from app.auth.services.auth_service import AuthService


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
