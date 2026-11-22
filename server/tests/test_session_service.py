from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest

from app.auth.services.session_service import SessionService


@pytest.mark.asyncio
@pytest.mark.parametrize(
    ("session_id_result", "expected"),
    [("session-id", True), (None, False)],
)
async def test_validate_session_returns_whether_an_active_session_exists(
    session_id_result: str | None,
    expected: bool,
) -> None:
    db = AsyncMock()
    db.execute.return_value = SimpleNamespace(
        scalar_one_or_none=lambda: session_id_result,
    )

    is_valid = await SessionService().validate_session(
        db,
        "session-id",
        "user-id",
    )

    assert is_valid is expected
    db.execute.assert_awaited_once()
