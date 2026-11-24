from collections.abc import AsyncIterator

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import session_factory

from functools import lru_cache
from fastapi import Depends 

from app.core.config import settings
from app.core.storage.local_storage import StorageBackend
from app.core.storage.local_storage import LocalStorage
from app.services.generation import GenerationService
# from app.services.p
from app.services.voices_services import VoiceService, voice_service
# from app.providers.base import LLM
from app.providers.base import TTSProvider
from app.providers.mock.provider import MockTTSProvider


async def get_db() -> AsyncIterator[AsyncSession]:
    async with session_factory() as session:
        yield session


@lru_cache
def get_tts_provider() -> TTSProvider:
    if settings.tts_provider == "mock":
        return MockTTSProvider()
    if settings.tts_provider == "chatterbox":
        from app.providers.chatterbox.provider import ChatterboxTTSProvider

        return ChatterboxTTSProvider()

    if settings.tts_provider == "openai":
        from openai import AsyncOpenAI
        from app.providers.openai.provider import OpenAITTSProvider

        client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        return OpenAITTSProvider(
            client=client,
            model=settings.openai_tts_model,
            voice=settings.openai_tts_voice,
        )


    raise ValueError(f"Unknown TTS_PROVIDER: {settings.tts_provider}")



@lru_cache
def get_storage() -> StorageBackend:
    return LocalStorage(root=settings.storage_dir)


def get_voice_service() -> VoiceService:
    return voice_service


def get_generation_service(
        db: AsyncSession = Depends(get_db),
        voice_db: AsyncSession = Depends(get_db),
        tts_provider: TTSProvider = Depends(get_tts_provider),
        storage: StorageBackend = Depends(get_storage),
        voice_service: VoiceService = Depends(get_voice_service)
) -> GenerationService:
    return GenerationService(
        db=db,
        voice_db=voice_db,
        tts_provider=tts_provider,
        storage=storage,
        voice_service=voice_service,
    )
