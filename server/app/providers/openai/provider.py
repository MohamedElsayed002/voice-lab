from openai import APIError, AsyncOpenAI, RateLimitError

from app.core.exceptions import (
    TTSProviderError,
    TTSProviderQuotaExceededError,
    TTSProviderRateLimitError,
)
from app.providers.base import AudioResult, TTSCapabilities, TTSProvider

from typing import Literal


openai_voices = [
    "alloy", "ash", "ballad", "cedar", "coral", "echo", "marin", "sage", "shimmer", "verse"
]


_SUPPORTED_LANGUAGES = (
    "af", "ar", "hy", "az", "be", "bs", "bg", "ca", "zh", "hr", "cs", "da",
    "nl", "en", "et", "fi", "fr", "gl", "de", "el", "he", "hi", "hu", "is",
    "id", "it", "ja", "kn", "kk", "ko", "lv", "lt", "mk", "ms", "mr", "mi",
    "ne", "no", "fa", "pl", "pt", "ro", "ru", "sr", "sk", "sl", "es", "sw",
    "sv", "tl", "ta", "th", "tr", "uk", "ur", "vi", "cy",
)


class OpenAITTSProvider(TTSProvider):
    def __init__(
        self,
        *,
        client: AsyncOpenAI,
        model: str,
        voice: str,
    ) -> None:
        self.client = client
        self.model = model
        self.voice = voice

    def capabilities(self) -> TTSCapabilities:
        return TTSCapabilities(
            supports_voice_cloning=False,
            supports_predefined_voices=True,
            supported_languages=_SUPPORTED_LANGUAGES,
        )

    async def generate(
        self,
        text: str,
        voice_reference: str | None = None,
        language: str | None = None,
    ) -> AudioResult:
        if voice_reference not in openai_voices:
            raise TTSProviderError(
                "OpenAI TTS uses a configured preset voice and does not accept "
                "a reference audio file."
            )
        # alloy, ash, ballad, cedar, coral, echo, marin, sage, shimmer, verse

        try:
            response = await self.client.audio.speech.create(
                model=self.model,
                voice=voice_reference,
                input=text,
                response_format="wav",
                instructions=(
                    f"Speak in the language identified by this code: {language}."
                    if language
                    else None
                ),
            )
        except RateLimitError as exc:
            error_code = self._extract_error_code(exc)
            if error_code in {
                "credit_balance_exhausted",
                "insufficient_quota",
                "billing_hard_limit_reached",
            }:
                raise TTSProviderQuotaExceededError() from exc
            raise TTSProviderRateLimitError() from exc
        except APIError as exc:
            raise TTSProviderError("OpenAI speech generation failed.") from exc

        audio_bytes = response.content
        if not audio_bytes:
            raise TTSProviderError("OpenAI returned an empty audio response.")

        return AudioResult(data=audio_bytes, sample_rate=24_000, format="wav")

    async def aclose(self) -> None:
        await self.client.close()

    @staticmethod
    def _extract_error_code(error: RateLimitError) -> str | None:
        body = error.body
        if not isinstance(body, dict):
            return None

        error_details = body.get("error")
        if not isinstance(error_details, dict):
            error_details = body

        code = error_details.get("code") or error_details.get("type")
        return code if isinstance(code, str) else None
