"""
MockTTSProvider: a stand-in for a real pretrained model (e.g. Chatterbox)

This is NOT a placeholder that returns empty bytes -- it generates a real valid
WAV file (a short tone whose duration scales with text length), so
the rest of the system (storage, audio assembly, API responses) can be
built and tested end-to-end before and real model is wired in

To swap in Chatterbox later:
  1. Implement app/providers/tts/chatterbox/provider.py (stub already
     there) as a TTSProvider.
  2. Set TTS_PROVIDER=chatterbox in .env.
  3. Change nothing else -- core/dependencies.py reads that setting and
     wires the right class in.

Why a sine tone and not silence: silence would also pass "is this valid
WAV bytes" tests, but a tone makes it obvious during manual testing
(you can actually hear that different text produced different audio)
that the pipeline ran end to end.

"""

import asyncio
import io 
import math 
import struct 
import wave 

from app.core.exceptions import UnsupportedLanguageError
from app.providers.base import AudioResult, TTSCapabilities, TTSProvider


SAMPLE_RATE = 22050
_SUPPORTED_LANGUAGES = (
    "en",
    "ar",
    "fr",
    "es",
    "de"
)

class MockTTSProvider(TTSProvider):

    """
        Deterministic, dependency-free fake inference

        Simulates the two real constraints a GPU-backed provider has:
        generation takes time proportional to input (approximated here with a short sleep)
        and with it must not block the event loop (we run the actual 
        synthesis in a worker thread via asyncio.to_thread, exactly as a 
        real blocking inference call would need to) 
    """

    def capabilities(self) -> TTSCapabilities:
        return TTSCapabilities(
            supports_voice_cloning=True,
            supports_predefined_voices=True,
            supported_languages=_SUPPORTED_LANGUAGES
        )

    async def generate(
            self,
            text: str, 
            voice_reference: str | None = None,
            language: str | None = None
    ) -> AudioResult:
        if language is not None and language not in _SUPPORTED_LANGUAGES:
            raise UnsupportedLanguageError(f"Mock provider does not support  language {language}")

        # Different reference "voices" get a different pitch, so two 
        # speakers in a podcast are audibly distinguishable in the demo

        pitch = 220.0
        if voice_reference:
            pitch = 180.0 + (hash(voice_reference) % 200)

        wav_bytes = await asyncio.to_thread(self._synthesize, text,pitch)
        return AudioResult(data=wav_bytes, sample_rate=SAMPLE_RATE, format="wav")

    @staticmethod
    def _synthesize(text: str, pitch_hz: float) -> bytes:
        # Blocking CPU work, deliberately run off the event loop.
        duration_s = max(0.4, min(len(text) * 0.05, 20.0))
        n_samples = int(SAMPLE_RATE * duration_s)

        buf = io.BytesIO()
        with wave.open(buf, "wb") as wav_file:
            wav_file.setnchannels(1)
            wav_file.setsampwidth(2)  # 16-bit PCM
            wav_file.setframerate(SAMPLE_RATE)
            frames = bytearray()
            for i in range(n_samples):
                t = i / SAMPLE_RATE
                # Gentle fade in/out so segments don't click when concatenated.
                fade = min(1.0, i / 400, (n_samples - i) / 400)
                sample = 0.2 * fade * math.sin(2 * math.pi * pitch_hz * t)
                frames += struct.pack("<h", int(sample * 32767))
            wav_file.writeframes(bytes(frames))
        return buf.getvalue()
