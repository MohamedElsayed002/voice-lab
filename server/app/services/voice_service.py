

from pathlib import Path 

from app.schema.voice import Voice
from app.core.config import settings
from app.core.exceptions import VoiceNotFoundError


from openai import AsyncOpenAI

_PREDEFINED_VOICES: list[Voice] = [
    Voice(
        id="default",
        name="Default Narrator",
        provider="mock",
        reference_audio_path=None,
        language="en",
        is_default=True
    ),
    Voice(
        id="voice-1",
        name="Host (Alex)",
        provider="mock",
        reference_audio_path=str(settings.voices_dir / "voice-1.wav"),
        language="en",
    ),
    Voice(
        id="voice-2",
        name="Guest (Sam)",
        provider="mock",
        reference_audio_path=str(settings.voices_dir / "voice-2.wav"),
        language="en",
    ),
    Voice(
        id="voice-3",
        name="Guest (Andy)",
        provider="chatterbox",
        reference_audio_path=str(settings.voices_dir / "andy.wav"),
        language="en",
    ),
    Voice(
        id="voice-4",
        name="Guest (Mohamed Elsayed)",
        provider="chatterbox",
        reference_audio_path=str(settings.voices_dir / "MohamedElsayed.wav"),
        language="en",
    ),
    Voice(
        id="coral",
        name="Coral",
        provider="openai",
        reference_audio_path=None,
        language="en",
    ),
    Voice(
        id="ash",
        name="Ash",
        provider="openai",
        reference_audio_path=None,
        language="en"
    ),
    Voice(
        id="ballad",
        name="Ballad",
        provider="openai",
        reference_audio_path=None,
        language="en"
    ),
    Voice(
        id="cedar",
        name="Cedar",
        provider="openai",
        reference_audio_path=None,
        language="en"
    ),
    Voice(
        id="coral",
        name="Coral",
        provider="openai",
        reference_audio_path=None,
        language="en"
    ),
    Voice(
        id="echo",
        name="Echo",
        provider="openai",
        reference_audio_path=None,
        language="en"
    ),
    Voice(
        id="marin",
        name="Marin",
        provider="openai",
        reference_audio_path=None,
        language="en"
    ),
    Voice(
        id="sage",
        name="Sage",
        provider="openai",
        reference_audio_path=None,
        language="en"
    ),
    Voice(
        id="shimmer",
        name="Shimmer",
        provider="openai",
        reference_audio_path=None,
        language="en"
    ),
    Voice(
        id="verse",
        name="Verse",
        provider="openai",
        reference_audio_path=None,
        language="en"
    )
]



class VoiceService:
    def __init__(self, voices: list[Voice] | None = None):
        self._voices = {v.id: v for v in (voices if voices is not None else _PREDEFINED_VOICES)}


    def list_voices(self) -> list[Voice]:
        return list(self._voices.values())

    def get_voice(self, voice_id: str) -> Voice:
        voice = self._voices.get(voice_id)

        if voice is None:
            raise VoiceNotFoundError(f"No voice with id {voice_id}")

        return voice

    def resolve_reference_audio(self, voice_id: str) -> str | None:
        """
            Returns a filesystem path for the voice's reference clip, or
        None if the voice doesn't use cloning (e.g. the default voice).
        """

        voice = self.get_voice(voice_id)
        path = voice.reference_audio_path

        if path and not Path(path).exists():
            raise VoiceNotFoundError(
                f"Voice '{voice_id}' is registered but its reference audio file is missing: {path}"
            )


        if settings.tts_provider == "openai":
            return voice.id
        
        return path