from types import SimpleNamespace
from typing import Any

import pytest

from app.models.generations import Generation
from app.providers.base import AudioResult, TTSCapabilities
from app.schema.generation import GenerationRequest
from app.services.generation import GenerationService


class FakeDatabase:
    def __init__(self) -> None:
        self.record: Generation | None = None

    def add(self, record: Generation) -> None:
        record.id = "generation-1"
        self.record = record

    def commit(self) -> None:
        pass

    def refresh(self, record) -> None:
        pass


class FakeVoiceService:
    async def get_voice_reference_audio(
        self,
        db: Any,
        voice_id: str,
        user_id: str,
    ) -> tuple[Any, bytes]:
        return SimpleNamespace(name="Test voice"), b"reference audio"


class FakeTTSProvider:
    def __init__(self) -> None:
        self.metadata = None

    def capabilities(self) -> TTSCapabilities:
        return TTSCapabilities(
            supports_voice_cloning=True,
            supports_predefined_voices=False,
            supported_languages=("en",),
        )

    async def generate(
        self,
        text: str,
        voice_reference: str | None = None,
        language: str | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> AudioResult:
        self.metadata = metadata
        return AudioResult(data=b"generated audio", sample_rate=24_000)


class FakeS3Client:
    def __init__(self) -> None:
        self.put_object_args = None

    def put_object(self, **kwargs) -> None:
        self.put_object_args = kwargs

    def generate_presigned_url(
        self,
        operation: str,
        *,
        Params: dict[str, str],
        ExpiresIn: int,
    ) -> str:
        return f"https://storage.test/{Params['Key']}"


@pytest.mark.asyncio
async def test_create_generation_accepts_metadata_dictionary(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    provider = FakeTTSProvider()
    s3_client = FakeS3Client()
    db = FakeDatabase()
    service = GenerationService(
        db=db,
        voice_db=None,
        tts_provider=provider,
        storage=None,
        voice_service=FakeVoiceService(),
        s3_client=s3_client,
    )
    monkeypatch.setattr("app.services.generation.settings.BUCKET_NAME", "test-bucket")
    metadata = {
        "temperature": 0.8,
        "top_p": 1.0,
        "repetition_penalty": 1.2,
        "exaggeration": 0.5,
    }

    result = await service.create_generation(
        GenerationRequest(text="Hello", voice_id="voice-1", metadata=metadata),
        "user-1",
    )

    assert provider.metadata == metadata
    assert db.record is not None
    assert db.record.temperature == 0.8
    assert db.record.top_p == 1.0
    assert db.record.top_k == 1000
    assert db.record.repetition_penalty == 1.2
    assert s3_client.put_object_args is not None
    assert s3_client.put_object_args["Bucket"] == "test-bucket"
    assert s3_client.put_object_args["Key"] == "generations/user-1/generation-1.wav"
    assert result["audio_url"] == (
        "https://storage.test/generations/user-1/generation-1.wav"
    )
