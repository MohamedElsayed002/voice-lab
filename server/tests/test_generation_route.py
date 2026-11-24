import pytest

from app.main import create_generation
from app.schema.generation import GenerationRequest


class FakeGenerationService:
    def __init__(self) -> None:
        self.user_id: str | None = None

    async def create_generation(
        self,
        request: GenerationRequest,
        user_id: str,
    ):
        self.user_id = user_id
        return type("GenerationRecord", (), {"id": "generation-1", "status": "completed"})()


@pytest.mark.asyncio
async def test_generation_route_passes_authenticated_user_id() -> None:
    service = FakeGenerationService()

    response = await create_generation(
        GenerationRequest(text="Hello", voice_id="voice-1"),
        service,  # type: ignore[arg-type]
        {"id": "user-1"},
    )

    assert service.user_id == "user-1"
    assert response.id == "generation-1"
