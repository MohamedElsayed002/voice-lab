"""Upload bundled system voices to S3 and upsert their database records."""

import asyncio
import logging
import secrets
from dataclasses import dataclass
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import engine, session_factory
from app.core.storage import create_s3_client
from app.core.secuirty import hash_password
from app.models import User, Voice
from app.models.user import UserRole
from app.schema.visibility import VisibilityStatus
from app.schema.voices import VoiceCategory, VoiceVariant

logger = logging.getLogger("voice_seed")
SYSTEM_VOICES_DIR = Path(__file__).resolve().parent.parent / "voices" / "system-voices"
SYSTEM_USER_ID = "96edb310-f03e-4368-92dd-e303457f0c94"
SYSTEM_USER_EMAIL = "system-voices@voice-lab.invalid"
SYSTEM_USER_USERNAME = "system-voices"


@dataclass(frozen=True)
class VoiceMetadata:
    description: str
    category: VoiceCategory
    language: str


VOICE_METADATA: dict[str, VoiceMetadata] = {
    "Aaron": VoiceMetadata("Soothing and calm, like a self-help audiobook narrator", VoiceCategory.AUDIOBOOK, "en-US"),
    "Abigail": VoiceMetadata("Friendly and conversational with a warm, approachable tone", VoiceCategory.CONVERSATIONAL, "en-GB"),
    "Anaya": VoiceMetadata("Polite and professional, suited for customer service", VoiceCategory.CUSTOMER_SUPPORT, "en-IN"),
    "Andy": VoiceMetadata("Versatile and clear, a reliable all-purpose narrator", VoiceCategory.GENERAL, "en-US"),
    "Archer": VoiceMetadata("Laid-back and reflective with a steady, storytelling pace", VoiceCategory.NARRATIVE, "en-US"),
    "Brian": VoiceMetadata("Professional and helpful with a clear customer support tone", VoiceCategory.CUSTOMER_SUPPORT, "en-US"),
    "Chloe": VoiceMetadata("Bright and bubbly with a cheerful, outgoing personality", VoiceCategory.CORPORATE, "en-AU"),
    "Dylan": VoiceMetadata("Thoughtful and intimate, like a quiet late-night conversation", VoiceCategory.GENERAL, "en-US"),
    "Emmanuel": VoiceMetadata("Nasally and distinctive with a quirky, cartoon-like quality", VoiceCategory.CHARACTERS, "en-US"),
    "Ethan": VoiceMetadata("Polished and warm with crisp, studio-quality delivery", VoiceCategory.VOICEOVER, "en-US"),
    "Evelyn": VoiceMetadata("Warm Southern charm with a heartfelt, down-to-earth feel", VoiceCategory.CONVERSATIONAL, "en-US"),
    "Gavin": VoiceMetadata("Calm and reassuring with a smooth, natural flow", VoiceCategory.MEDITATION, "en-US"),
    "Gordon": VoiceMetadata("Warm and encouraging with an uplifting, motivational tone", VoiceCategory.MOTIVATIONAL, "en-US"),
    "Ivan": VoiceMetadata("Deep and cinematic with a dramatic, movie-character presence", VoiceCategory.CHARACTERS, "ru-RU"),
    "Laura": VoiceMetadata("Authentic and warm with a conversational Midwestern tone", VoiceCategory.CONVERSATIONAL, "en-US"),
    "Lucy": VoiceMetadata("Direct and composed with a professional phone manner", VoiceCategory.CUSTOMER_SUPPORT, "en-US"),
    "Madison": VoiceMetadata("Energetic and unfiltered with a casual, chatty vibe", VoiceCategory.PODCAST, "en-US"),
    "Marisol": VoiceMetadata("Confident and polished with a persuasive, ad-ready delivery", VoiceCategory.ADVERTISING, "en-US"),
    "Meera": VoiceMetadata("Friendly and helpful with a clear, service-oriented tone", VoiceCategory.CUSTOMER_SUPPORT, "en-IN"),
    "MohamedElsayed": VoiceMetadata("Friendly and helpful with a clear, service-oriented tone", VoiceCategory.CHARACTERS, "en-EG"),
    "Walter": VoiceMetadata("Old and raspy with deep gravitas, like a wise grandfather", VoiceCategory.NARRATIVE, "en-US"),
}


def list_system_voice_files() -> list[Path]:
    files = sorted(SYSTEM_VOICES_DIR.glob("*.wav"), key=lambda path: path.stem.casefold())
    if not files:
        raise FileNotFoundError(f"No WAV files found in {SYSTEM_VOICES_DIR}")

    unknown_names = [path.stem for path in files if path.stem not in VOICE_METADATA]
    if unknown_names:
        raise ValueError(f"Add metadata for system voice(s): {', '.join(unknown_names)}")
    return files


async def get_or_create_system_user(db: AsyncSession) -> User:
    result = await db.execute(select(User).where(User.id == SYSTEM_USER_ID))
    user = result.scalar_one_or_none()
    if user:
        return user

    email_result = await db.execute(select(User).where(User.email == SYSTEM_USER_EMAIL))
    if email_result.scalar_one_or_none():
        raise ValueError(
            f"{SYSTEM_USER_EMAIL} exists with a different ID; expected {SYSTEM_USER_ID}"
        )

    user = User(
        id=SYSTEM_USER_ID,
        email=SYSTEM_USER_EMAIL,
        username=SYSTEM_USER_USERNAME,
        hashed_password=hash_password(secrets.token_urlsafe(48)),
        role=UserRole.USER,
    )
    db.add(user)
    await db.flush()
    return user


async def find_system_voice(db: AsyncSession, name: str) -> Voice | None:
    result = await db.execute(
        select(Voice).where(Voice.variant == VoiceVariant.SYSTEM, Voice.name == name)
    )
    return result.scalar_one_or_none()


def upload_voice_file(s3_client, audio_path: Path, object_key: str) -> None:
    s3_client.upload_file(
        str(audio_path),
        settings.BUCKET_NAME,
        object_key,
        ExtraArgs={"ContentType": "audio/wav"},
    )


async def seed_system_voice(
    db: AsyncSession,
    s3_client,
    system_user_id: str,
    audio_path: Path,
) -> None:
    name = audio_path.stem
    metadata = VOICE_METADATA[name]
    voice = await find_system_voice(db, name)
    if voice is None:
        voice = Voice(
            user_id=system_user_id,
            name=name,
            description=metadata.description,
            category=metadata.category,
            language=metadata.language,
            variant=VoiceVariant.SYSTEM,
            status=VisibilityStatus.PUBLIC,
            s3_object_key="pending",
        )
        db.add(voice)
        await db.flush()

    object_key = f"system/{voice.id}/{audio_path.name}"
    upload_voice_file(s3_client, audio_path, object_key)

    voice.user_id = system_user_id
    voice.description = metadata.description
    voice.category = metadata.category
    voice.language = metadata.language
    voice.variant = VoiceVariant.SYSTEM
    voice.status = VisibilityStatus.PUBLIC
    voice.s3_object_key = object_key


async def seed_system_voices() -> None:
    voice_files = list_system_voice_files()
    s3_client = create_s3_client()
    logger.info("Seeding %d system voices into bucket %s", len(voice_files), settings.BUCKET_NAME)

    try:
        async with session_factory() as db:
            try:
                system_user = await get_or_create_system_user(db)
                for audio_path in voice_files:
                    logger.info("Uploading %s", audio_path.name)
                    await seed_system_voice(db, s3_client, system_user.id, audio_path)
                await db.commit()
            except Exception:
                await db.rollback()
                raise
    finally:
        await engine.dispose()

    logger.info("System voice seed completed.")


def main() -> None:
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
    asyncio.run(seed_system_voices())


if __name__ == "__main__":
    main()
