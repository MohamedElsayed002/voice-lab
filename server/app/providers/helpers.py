
from pathlib import Path
from tempfile import TemporaryDirectory

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.providers.base import AudioResult, TTSProvider
from app.schema.dialogue import DialogueRequest, DialogueSegment
from app.services.voices_services import VoiceService
from app.core.storage.local_storage import StorageBackend

import io
import wave

from openai import AsyncOpenAI

# Synthesize the dialogue
# Instead of Promise.all. I can add bounded concurrency later, but
# append results in their original dialogue order. Do not launch 
# an unbounded number of requests: provider quotas, GPU memory,
# and API limits be exceeded. Also consider rate limits and retries
# for transient provider errors

async def synthesize_dialogue(
    request: DialogueRequest,
    provider: TTSProvider,
    voice_service: VoiceService,
    db: AsyncSession,
    user_id: str,
) -> list[AudioResult]:

    results: list[AudioResult] = []

    for segment in request.segments:
        voice_id = request.voice_ids[segment.speaker]
        _, reference_audio = await voice_service.get_voice_reference_audio(
            db,
            voice_id,
            user_id,
        )
        with TemporaryDirectory(prefix="voice-reference-") as temp_dir:
            reference_path = Path(temp_dir) / "reference.wav"
            reference_path.write_bytes(reference_audio)
            result = await provider.generate(
                text=segment.text,
                voice_reference=str(reference_path),
                language=request.language,
            )

        if not result.data:
            raise RuntimeError("TTS Provider returned empty audio")

        results.append(result)

    return results


# Combine audio

"""
For WAV, python's `wave` module can join frame data if every segment has the
same PCM parameters. This small example rejects mismatch input
"""

def combine_compatible_wav(results: list[AudioResult]) -> bytes:
    if not results:
        raise ValueError("No audio segments to combine")    

    if any(result.format.lower() != "wav" for result in results):
        raise ValueError("This example only combines WAV segments")

    expected = None 
    frames: list[bytes] = []

    for result in results:
        with wave.open(io.BytesIO(result.data),"rb") as wav:
            params = wav.getparams()

            if expected is None:
                expected = params 

            elif (
                params.nchannels != expected.nchannels
                or params.sampwidth != expected.sampwidth
                or params.framerate != expected.framerate
                or params.comptype != expected.comptype
            ):
                raise ValueError(
                    "Wav segments have incompatible audio paramters"
                )
            frames.append(wav.readframes(wav.getnframes()))


        output = io.BytesIO()

        with wave.open(output,"wb") as wav:
            wav.setparams(expected)
            for segment_frames in frames:
                wav.writeframes(segment_frames)
        return output.getvalue()



# No need for temporary files

# Store and return the final audio

# final_bytes = combine_compatible_wav(audio_results)
# storage_key = f"generations/{generation_id}.wav"
# storage.save_bytes(storage_key, final_bytes, content_type="audio/wav")


# {
#   "id": "generation-id",
#   "status": "completed",
#   "audio_url": "/generations/generation-id/audio"
# }


async def synthesize_and_save(
        *,
        text: str,
        voice_id: str,
        language: str,
        generation_id: str,
        provider: TTSProvider,
        voices: VoiceService,
        storage: StorageBackend,
        db: AsyncSession,
        user_id: str,
) -> tuple[str, str]:

    _, reference_audio = await voices.get_voice_reference_audio(
        db,
        voice_id,
        user_id,
    )
    with TemporaryDirectory(prefix="voice-reference-") as temp_dir:
        reference_path = Path(temp_dir) / "reference.wav"
        reference_path.write_bytes(reference_audio)
        result = await provider.generate(
            text,
            voice_reference=str(reference_path),
            language=language,
        )

    if not result.data:
        raise RuntimeError("TTS Provider returned empty audio")

    extension = result.format.lower()

    media_type = {
        "wav": "audio/wav",
        "mp3": "audio/mpeg",
        "ogg": "audio/ogg"
    }.get(extension)

    if media_type is None:
        raise ValueError(f"Unsupported audio format: {extension}")

    key = f"generations/{generation_id}.{extension}"

    storage.save_bytes(key, result.data,content_type=media_type)

    return key, media_type



# Provider choice: same contract different requirements

# Use one adapter per provider. The API/service should call the 
# same internal interface regardless of vendor

# TTSProvider.generate(text, voice_reference, language) -> AudioResult

# OpenAI Hosted speech

# OpenAI's Speech API takes a model, input text, and a supported
# voice. current documentation also shows optional `instructions` and `response_format`.
# This example shows the provider-specific call; place it inside an
# `OpenAITTSProvider` that implements your TTSProvider interface

client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

async def openai_speech(text: str) -> bytes:
    response = await client.audio.speech.create(
        model="tts-1",
        voice="coral",
        input=text,
        response_format="wav",
        instructions="Speak clearly and naturally."
    )

    return response.content