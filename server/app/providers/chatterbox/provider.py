
import asyncio
import io
import wave
from typing import Any

import numpy as np
import torch
from chatterbox.mtl_tts import ChatterboxMultilingualTTS
# from chatterbox.mtl_tts import 
# from chatterbox.tts_turbo import ChatterboxTurboTTS

# ChatterboxTurboTTS.from_local(device="device")

from app.core.exceptions import TTSProviderError, UnsupportedLanguageError
from app.providers.base import AudioResult, TTSCapabilities, TTSProvider


# V3
# v3_model = ChatterboxMultilingualTTS.from_pretrained(device="cpu",t3_model="v3")

class ChatterboxTTSProvider(TTSProvider):
    def __init__(self) -> None:
        device = "cuda" if torch.cuda.is_available() else "cpu"
        try:
            # chatterbox-tts 0.1.7 loads its configured multilingual model
            # through the device argument; it does not accept a t3_model kwarg.
            self.model = ChatterboxMultilingualTTS.from_pretrained(device=device)
        except OSError as exc:
            if exc.errno == 1455 or "paging file is too small" in str(exc).lower():
                raise TTSProviderError(
                    "Chatterbox could not load its model because Windows virtual "
                    "memory is too low. Increase the paging file, then restart the API."
                ) from exc
            raise

    def capabilities(self) -> TTSCapabilities:
        return TTSCapabilities(
            supports_voice_cloning=True,
            supports_predefined_voices=False,
            supported_languages=tuple(
                ChatterboxMultilingualTTS.get_supported_languages()
            ),
        )

    def _generate_sync(
        self,
        text: str,
        voice_reference: str | None,
        language: str,
        metadata: dict[str, Any] | None = None
    ) -> AudioResult:
        kwargs: dict[str, Any] = dict(metadata or {})
        kwargs["language_id"] = language

        if voice_reference is not None:
            kwargs["audio_prompt_path"] = voice_reference

        waveform = self.model.generate(text,**kwargs,)
        sample_rate = self.model.sr
        samples = waveform.detach().to(device="cpu", dtype=torch.float32).squeeze()
        if samples.ndim != 1:
            raise TTSProviderError("Chatterbox returned an unsupported audio shape.")

        pcm_frames = (
            np.clip(samples.numpy(), -1.0, 1.0) * 32767
        ).astype("<i2").tobytes()
        output = io.BytesIO()
        with wave.open(output, "wb") as wav_file:
            wav_file.setnchannels(1)
            wav_file.setsampwidth(2)
            wav_file.setframerate(sample_rate)
            wav_file.writeframes(pcm_frames)

        return AudioResult(
            data=output.getvalue(),
            sample_rate=sample_rate,
            format="wav"
        )

    async def generate(
        self,
        text: str,
        voice_reference: str | None = None,
        language: str | None = None,
        metadata: dict[str, Any] | None = None
    ) -> AudioResult:
        supported_languages = self.capabilities().supported_languages
        language = language.lower() if language is not None else "en"
        if language not in supported_languages:
            raise UnsupportedLanguageError(
                f"Chatterbox does not support language {language}."
            )

        return await asyncio.to_thread(
            self._generate_sync,
            text,
            voice_reference,
            language,
            metadata
        )