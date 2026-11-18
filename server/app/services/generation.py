

from datetime import datetime, timezone

from sqlalchemy.orm import Session 

from app.core.exceptions import (
    GenerationNotFoundError,
    ProviderError,
    InvalidRequestError
)

from app.core.config import settings 
from app.core.storage.local_storage import StorageBackend
from app.models.generation import Generation 
from app.schema.generation import GenerationRequest
from app.services.generation import GenerationRequest 
from app.services.voice_service import VoiceService
from app.providers.base import TTSProvider


class GenerationService:
    def __init__(
            self,
            db: Session,
            tts_provider: TTSProvider,
            storage: StorageBackend,
            voice_service: VoiceService
    ):
        self.db = db 
        self.tts_provider = tts_provider 
        self.storage = storage
        self.voice_service = voice_service

    async def create_generation(self, request: GenerationRequest) -> Generation:
        self._validate(request)

        # Resolving the voice happens before we touch the provider or 
        # Storage, so a bad voice_id fails fast with a 404 instead of 
        # burning a (potentially expensive) inference call first.

        reference_audio = self.voice_service.resolve_reference_audio(request.voice_id)

        record = Generation(
            type="tts",
            status="processing",
            provider=self.tts_provider.__class__.__name__,
            input_metadata=request.model_dump()
        )

        self.db.add(record)
        self.db.commit()
        self.db.refresh(record)

        try:
            result = await self.tts_provider.generate(
                text=request.text,
                voice_reference=reference_audio,
                language=request.language
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