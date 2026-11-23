from datetime import datetime, timedelta, timezone
from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest
from fastapi import HTTPException

import app.auth.routes.oauth as oauth_routes
from app.auth.routes.oauth import exchange_oauth_code
from app.auth.schemas.auth import TokenResponse
from app.auth.schemas.oauth import OAuthExchangeRequest


@pytest.mark.parametrize(
    ("locale", "expected_path"),
    [
        ("en", "/auth/callback"),
        ("de", "/de/auth/callback"),
    ],
)
def test_frontend_callback_url_uses_locale_prefix_only_when_needed(
    monkeypatch: pytest.MonkeyPatch,
    locale: str,
    expected_path: str,
) -> None:
    monkeypatch.setattr(oauth_routes.settings, "FRONTEND_URL", "http://localhost:3000")

    url = oauth_routes._frontend_callback_url(locale=locale, error="oauth_failed")

    assert url == f"http://localhost:3000{expected_path}?error=oauth_failed"


@pytest.mark.asyncio
async def test_oauth_exchange_consumes_valid_code(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    exchange_code = SimpleNamespace(
        user_id="user-id",
        used_at=None,
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=1),
    )
    user = SimpleNamespace(id="user-id", is_active=True)
    db = SimpleNamespace(
        execute=AsyncMock(
            return_value=SimpleNamespace(
                scalar_one_or_none=lambda: exchange_code,
            )
        ),
        get=AsyncMock(return_value=user),
    )
    expected_tokens = TokenResponse(
        access_token="access-token",
        refresh_token="refresh-token",
    )
    create_session = AsyncMock(return_value=expected_tokens)
    monkeypatch.setattr(
        oauth_routes.session_service,
        "create_session",
        create_session,
    )

    result = await exchange_oauth_code(
        OAuthExchangeRequest(code="x" * 32),
        db,
    )

    assert result == expected_tokens
    assert exchange_code.used_at is not None
    create_session.assert_awaited_once_with(db, user)


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "exchange_code",
    [
        None,
        SimpleNamespace(
            user_id="user-id",
            used_at=datetime.now(timezone.utc),
            expires_at=datetime.now(timezone.utc) + timedelta(minutes=1),
        ),
        SimpleNamespace(
            user_id="user-id",
            used_at=None,
            expires_at=datetime.now(timezone.utc) - timedelta(minutes=1),
        ),
    ],
)
async def test_oauth_exchange_rejects_missing_used_or_expired_code(
    exchange_code: object,
) -> None:
    db = SimpleNamespace(
        execute=AsyncMock(
            return_value=SimpleNamespace(
                scalar_one_or_none=lambda: exchange_code,
            )
        )
    )

    with pytest.raises(HTTPException) as error:
        await exchange_oauth_code(
            OAuthExchangeRequest(code="x" * 32),
            db,
        )

    assert error.value.status_code == 400
