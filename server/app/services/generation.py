

from pathlib import Path
from tempfile import TemporaryDirectory
from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import (
    GenerationNotFoundError,
    ProviderError,
    InvalidRequestError
)

from app.core.storage.local_storage import StorageBackend
from app.models.generations import Generation 
from app.schema.generation import GenerationRequest
from app.services.voices_services import VoiceService
from app.providers.base import TTSProvider
from app.schema.visibility import VisibilityStatus

from typing import Any
from app.core.storage import create_s3_client
import asyncio
from app.core.config import settings
from botocore.exceptions import BotoCoreError, ClientError
from app.exceptions.handlers import ServiceUnavailableException

class GenerationService:
    def __init__(
            self,
            db: AsyncSession,
            voice_db: AsyncSession,
            tts_provider: TTSProvider,
            storage: StorageBackend,
            voice_service: VoiceService,
            s3_client: Any | None = None
    ):
        self.db = db 
        self.voice_db = voice_db
        self.tts_provider = tts_provider 
        self.storage = storage
        self.voice_service = voice_service
        self.s3_client = s3_client or create_s3_client()

    async def create_generation(
        self,
        request: GenerationRequest,
        user_id: str,
    ):
        self._validate(request)

        if not user_id:
            raise InvalidRequestError("An authenticated user is required.")

        voice, reference_audio = await self.voice_service.get_voice_reference_audio(
            self.voice_db,
            request.voice_id,
            user_id,
        )
        # Voice lookup is complete. Release its read connection while the
        # model runs, which can take several minutes.
        if self.voice_db is not None:
            await self.voice_db.commit()

        if not self.tts_provider.capabilities().supports_voice_cloning:
            raise InvalidRequestError(
                "The configured speech provider does not support stored voice references."
            )
        
        record = Generation(
            user_id=user_id,
            voice_id=request.voice_id,
            text=request.text,
            voice_name=voice.name,
            # Older local SQLite databases may still enforce NOT NULL here
            # until they are rebuilt/migrated. The final key is written below.
            s3_object_key="",
            temperature=request.metadata.get("temperature", 0.8),
            top_p=request.metadata.get("top_p", 0.95),
            top_k=request.metadata.get("top_k", 1000),
            repetition_penalty=request.metadata.get("repetition_penalty", 1.2),
            status=VisibilityStatus.PRIVATE,
            # provider=self.tts_provider.__class__.__name__
        )

        self.db.add(record)
        await self.db.commit()
        await self.db.refresh(record)
        generation_id = record.id
        # Do not hold a database connection during slow model inference.
        # The session can check out a fresh connection when saving the key.
        await self.db.commit()

        try:
            with TemporaryDirectory(prefix="voice-reference-") as temp_dir:
                reference_path = Path(temp_dir) / "reference.wav"
                reference_path.write_bytes(reference_audio)
                result = await self.tts_provider.generate(
                    text=request.text,
                    voice_reference=str(reference_path),
                    language=request.language,
                    metadata=request.metadata
                )
    
            storage_key = f"generations/{user_id}/{generation_id}.{result.format}"
            # self.storage.save_bytes(storage_key, result.data, content_type=f"audio/{result.format}")

            await asyncio.to_thread(
                self.s3_client.put_object,
                Bucket=settings.BUCKET_NAME,
                Key=storage_key,
                Body=result.data,
                ContentType=result.format
            )



            # `status` is the public/private visibility enum, not generation
            # progress. A stored object key indicates that audio is available.
            record.s3_object_key = storage_key
            await self.db.commit()

        except ProviderError as exc:
            await self.db.rollback()
            raise
        except (BotoCoreError, ClientError) as error:
            await self.db.rollback()
            raise ServiceUnavailableException("Voice storage is temporarily unavailable ") from error
        except Exception:
            await self.db.rollback()
            raise

        return self._serialize_audio(record)


    async def get_generation(self, generation_id: str) -> Generation:
        record = await self.db.get(Generation, generation_id)

        if record is None:
            raise GenerationRequest(f"No generation with id {generation_id}")

        return record

    async def get_audio_bytes(self, generation_id: str) -> bytes:
        record = await self.get_generation(generation_id)

        if not record.s3_object_key:
            raise GenerationNotFoundError(f"Generation '{generation_id}' has no audio available")
        return self.storage.load_bytes(record.s3_object_key)

    
    @staticmethod
    def _validate(request: GenerationRequest) -> None:
        if not request.text.strip():
            raise InvalidRequestError("text must not be empty")

        if len(request.text) > 2000:
            raise InvalidRequestError(
                f"text exceeds max length of 2000 characters"
            )

    def _serialize_audio(self, voice):
        return {
            "audio_url": self.s3_client.generate_presigned_url(
                "get_object",
                Params={"Bucket": settings.BUCKET_NAME, "Key": voice.s3_object_key},
                ExpiresIn=60*60,
            ),
        }
