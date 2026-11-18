
from abc import ABC, abstractmethod 
from dataclasses import dataclass 

@dataclass(frozen=True)
class AudioResult:
    """
        What a provider hands back. Carrying sample_rate explicitly (not
        just raw bytes) matters for podcast assembly, which needs to know
        whether two segments can be concatenated directly or need resampling
    """

    data: bytes
    sample_rate: int 
    format: str = "wav"


@dataclass(frozen=True)
class TTSCapabilities:
    supports_voice_cloning: bool 
    supports_predefined_voices: bool 
    supported_languages: tuple[str, ...]


class TTSProvider(ABC):
    @abstractmethod 
    async def generate(
        self, 
        text: str, 
        voice_reference: str | None = None,
        language: str | None = None
    ) -> AudioResult:
        """ 
            Synthesize `text` into audio.

            voice_references: path to a reference audio clip, for providers
            that do voice cloning. May be ignored by providers that only
            support predefined voices

            language: BCP-47-ish language code. A provider that doesn't 
            support the requested language should raise
            UnsupportedLanguageError rather than silently falling back

            Implementations that wrap blocking/GPU-bound inference must not block
            the event loop -- use asyncio.to_thread(...) or async HTTP client
            to a remote inference service (e.g. Modal)


        """

    @abstractmethod
    def capabilities(self) -> TTSCapabilities:
        ...

    async def aclose(self) -> None:
        """Release provider resources when the application shuts down."""