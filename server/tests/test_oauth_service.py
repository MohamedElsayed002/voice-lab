from unittest.mock import AsyncMock, Mock

import pytest

from app.auth.providers.base import ExternalIdentity
from app.auth.services.oauth_service import OAuthService
from app.models.user import User


class _NestedTransaction:
    async def __aenter__(self) -> "_NestedTransaction":
        return self

    async def __aexit__(self, *_: object) -> None:
        return None


@pytest.mark.asyncio
async def test_authenticate_creates_new_oauth_user_without_password() -> None:
    db = Mock()
    db.begin_nested = Mock(return_value=_NestedTransaction())
    db.add = Mock()
    db.flush = AsyncMock()
    service = OAuthService(db)
    service._get_account = AsyncMock(return_value=None)
    service._get_user_by_email = AsyncMock(return_value=None)

    user = await service.authenticate(
        ExternalIdentity(
            provider="google",
            provider_user_id="google-subject",
            email="user@example.com",
            email_verified=True,
        )
    )

    assert isinstance(user, User)
    assert user.email == "user@example.com"
    assert user.hashed_password is None
    assert db.add.call_count == 2
    assert db.flush.await_count == 2
