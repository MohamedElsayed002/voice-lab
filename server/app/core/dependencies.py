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


_created_tts_providers: list[TTSProvider] = []


@lru_cache(maxsize=None)
def get_tts_provider(provider_name: str | None = None) -> TTSProvider:
    provider_name = (provider_name or settings.tts_provider).strip().lower()
    if provider_name == "mock":
        return MockTTSProvider()
    if provider_name == "chatterbox":
        from app.providers.chatterbox.provider import ChatterboxTTSProvider

        provider = ChatterboxTTSProvider()
        _created_tts_providers.append(provider)
        return provider
    if provider_name == "chatterbox-turbo":
        from app.providers.chatterbox.provider_2 import ChatterboxTurboTTSProvider

        provider = ChatterboxTurboTTSProvider()
        _created_tts_providers.append(provider)
        return provider
    if provider_name == "openai":
        from openai import AsyncOpenAI
        from app.providers.openai.provider import OpenAITTSProvider

        client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        provider = OpenAITTSProvider(
            client=client,
            model=settings.openai_tts_model,
            voice=settings.openai_tts_voice,
        )
        _created_tts_providers.append(provider)
        return provider


    from app.core.exceptions import InvalidRequestError

    raise InvalidRequestError(f"Unsupported TTS provider: {provider_name}")


async def close_tts_providers() -> None:
    providers = list({id(provider): provider for provider in _created_tts_providers}.values())
    _created_tts_providers.clear()
    for provider in providers:
        await provider.aclose()
    get_tts_provider.cache_clear()



@lru_cache
def get_storage() -> StorageBackend:
    return LocalStorage(root=settings.storage_dir)


def get_voice_service() -> VoiceService:
    return voice_service


def get_generation_service(
        db: AsyncSession = Depends(get_db),
        voice_db: AsyncSession = Depends(get_db),
        storage: StorageBackend = Depends(get_storage),
        voice_service: VoiceService = Depends(get_voice_service)
) -> GenerationService:
    return GenerationService(
        db=db,
        voice_db=voice_db,
        provider_factory=get_tts_provider,
        storage=storage,
        voice_service=voice_service,
    )
