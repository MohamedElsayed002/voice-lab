

from pathlib import Path
from tempfile import TemporaryDirectory
from datetime import datetime, timezone

from sqlalchemy.orm import Session 
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import (
    GenerationNotFoundError,
    ProviderError,
    InvalidRequestError
)

from app.core.storage.local_storage import StorageBackend
from app.models.generation import Generation 
from app.schema.generation import GenerationRequest
from app.services.voices_services import VoiceService
from app.providers.base import TTSProvider


class GenerationService:
    def __init__(
            self,
            db: Session,
            voice_db: AsyncSession,
            tts_provider: TTSProvider,
            storage: StorageBackend,
            voice_service: VoiceService,
    ):
        self.db = db 
        self.voice_db = voice_db
        self.tts_provider = tts_provider 
        self.storage = storage
        self.voice_service = voice_service

    async def create_generation(
        self,
        request: GenerationRequest,
        user_id: str,
    ) -> Generation:
        self._validate(request)

        if not user_id:
            raise InvalidRequestError("An authenticated user is required.")

        voice, reference_audio = await self.voice_service.get_voice_reference_audio(
            self.voice_db,
            request.voice_id,
            user_id,
        )
        if not self.tts_provider.capabilities().supports_voice_cloning:
            raise InvalidRequestError(
                "The configured speech provider does not support stored voice references."
            )

        record = Generation(
            type="tts",
            status="processing",
            provider=self.tts_provider.__class__.__name__,
            input_metadata={
                **request.model_dump(),
                "user_id": user_id,
                "voice_name": voice.name,
            },
        )

        self.db.add(record)
        self.db.commit()
        self.db.refresh(record)

        try:
            with TemporaryDirectory(prefix="voice-reference-") as temp_dir:
                reference_path = Path(temp_dir) / "reference.wav"
                reference_path.write_bytes(reference_audio)
                result = await self.tts_provider.generate(
                    text=request.text,
                    voice_reference=str(reference_path),
                    language=request.language,
                )

            storage_key = f"generations/{record.id}.{result.format}"
            self.storage.save_bytes(storage_key, result.data, content_type=f"audio/{result.format}")

            record.status = "completed"
            record.storage_key = storage_key
            record.completed_at = datetime.now(timezone.utc)

        except ProviderError as exc:
            record.status = "failed"
            record.error_message = str(exc)
            raise
        finally:
            self.db.commit()
            self.db.refresh(record)

        return record

    def get_generation(self, generation_id: str) -> Generation:
        record = self.db.get(Generation, generation_id)

        if record is None:
            raise GenerationRequest(f"No generation with id {generation_id}")

        return record

    def get_audio_bytes(self, generation_id: str) -> bytes:
        record = self.get_generation(generation_id)

        if record.status != "completed" or not record.storage_key:
            raise GenerationNotFoundError(f"Generation '{generation_id}' has no audio available")
        return self.storage.load_bytes(record.storage_key)

    
    @staticmethod
    def _validate(request: GenerationRequest) -> None:
        if not request.text.strip():
            raise InvalidRequestError("text must not be empty")

        if len(request.text) > 2000:
            raise InvalidRequestError(
                f"text exceeds max length of 2000 characters"
            )