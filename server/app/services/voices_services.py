import asyncio
import logging
from typing import Any
from uuid import uuid4

from botocore.exceptions import BotoCoreError, ClientError
from fastapi import UploadFile
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.storage import create_s3_client
from app.exceptions.handlers import ConflictException, ForbiddenException, NotFoundException, ServiceUnavailableException, UnprocessableFileException
from app.models.user import User
from app.models.voice import Voice
from app.schema.voice import VoiceCreateRequest
from app.schema.visibility import VisibilityStatus
from app.schema.voices import VoiceCategory, VoiceVariant

logger = logging.getLogger(__name__)
MAX_AUDIO_SIZE_BYTES = 25 * 1024 * 1024
MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024
ALLOWED_AUDIO_TYPES = {"audio/wav", "audio/x-wav", "audio/wave", "application/octet-stream"}
AVATAR_TYPES = {
    "image/png": (".png", lambda content: content.startswith(b"\x89PNG\r\n\x1a\n")),
    "image/jpeg": (".jpg", lambda content: content.startswith(b"\xff\xd8\xff")),
    "image/webp": (
        ".webp",
        lambda content: content.startswith(b"RIFF") and content[8:12] == b"WEBP",
    ),
}
PRESIGNED_URL_TTL_SECONDS = 60 * 60


class VoiceService:
    def __init__(self, s3_client: Any | None = None) -> None:
        self.s3_client = s3_client or create_s3_client()

    async def get_all_voices(self, db: AsyncSession) -> list[dict[str, Any]]:
        query = (
            select(Voice)
            .where(or_(Voice.status == VisibilityStatus.PUBLIC))
            .order_by(Voice.name)
        )
        result = await db.execute(query)
        return [self._serialize_voice(voice) for voice in result.scalars().all()]

    async def get_voice(
        self,
        db: AsyncSession,
        voice_id: str,
        user_id: str,
    ) -> dict[str, Any]:
        query = select(Voice).where(
            Voice.id == voice_id,
            or_(Voice.status == VisibilityStatus.PUBLIC, Voice.user_id == user_id),
        )
        result = await db.execute(query)
        voice = result.scalar_one_or_none()
        if voice is None:
            raise NotFoundException("Voice", voice_id)
        return self._serialize_voice(voice)

    async def get_public_voice_audio(self, db: AsyncSession, voice_id: str) -> dict[str, Any]:
        result = await db.execute(
            select(Voice).where(
                Voice.id == voice_id,
                Voice.status == VisibilityStatus.PUBLIC,
            )
        )
        voice = result.scalar_one_or_none()
        if voice is None:
            raise NotFoundException("Voice", voice_id)

        return await self._get_voice_audio_object(voice)

    async def get_custom_voice_audio(
        self,
        db: AsyncSession,
        user_id: str,
        voice_id: str,
    ) -> dict[str, Any]:
        result = await db.execute(
            select(Voice).where(
                Voice.id == voice_id,
                Voice.user_id == user_id,
                Voice.variant == VoiceVariant.CUSTOM,
            )
        )
        voice = result.scalar_one_or_none()
        if voice is None:
            raise NotFoundException("Voice", voice_id)

        return await self._get_voice_audio_object(voice)

    async def _get_voice_audio_object(self, voice: Voice) -> dict[str, Any]:
        try:
            audio_object = await asyncio.to_thread(
                self.s3_client.get_object,
                Bucket=settings.BUCKET_NAME,
                Key=voice.audio_s3_object_key,
            )
        except (BotoCoreError, ClientError) as error:
            logger.exception("Failed to retrieve audio for voice %s", voice_id)
            raise ServiceUnavailableException("Voice audio is temporarily unavailable") from error

        return audio_object

    async def get_user_custom_voices(
        self,
        db: AsyncSession,
        user_id: str,
    ) -> list[dict[str, Any]]:
        result = await db.execute(
            select(Voice)
            .where(
                Voice.user_id == user_id,
                Voice.variant == VoiceVariant.CUSTOM,
            )
            .order_by(Voice.name)
        )
        return [self._serialize_voice(voice) for voice in result.scalars().all()]

    async def get_single_voice_user(
        self,
        db: AsyncSession,
        user_id: str,
        voice_id: str,
    ) -> dict[str, Any]:
        result = await db.execute(
            select(Voice).where(
                Voice.user_id == user_id,
                Voice.id == voice_id,
                Voice.variant == VoiceVariant.CUSTOM,
            )
        )

        voice = result.scalar_one_or_none()
        if voice is None:
            raise NotFoundException("Voice", voice_id)

        return self._serialize_voice(voice)

    async def create_voice(
        self,
        db: AsyncSession,
        user_id: str,
        user_email: str | None,
        request: VoiceCreateRequest,
    ) -> dict[str, Any]:
        audio_bytes = await self._read_wav_file(request.audio)
        avatar_data = (
            await self._read_avatar_file(request.avatar)
            if request.avatar is not None
            else None
        )
        voice_id = str(uuid4())
        audio_key = f"custom/{user_id}/{voice_id}/audio.wav"
        avatar_key = (
            f"custom/{user_id}/{voice_id}/avatar{avatar_data[1]}"
            if avatar_data is not None
            else None
        )
        fields = request.fields

        voice = Voice(
            id=voice_id,
            user_id=user_id,
            name=fields.name.strip(),
            description=fields.description.strip(),
            category=fields.category,
            language=fields.language.strip(),
            variant=VoiceVariant.CUSTOM,
            status=fields.status,
            audio_s3_object_key=audio_key,
            avatar_s3_object_key=avatar_key,
            reference_text=fields.reference_text.strip(),
        )

        uploaded_keys: list[str] = []
        try:
            await self._ensure_user(db, user_id, user_email)
            await asyncio.to_thread(
                self.s3_client.put_object,
                Bucket=settings.BUCKET_NAME,
                Key=audio_key,
                Body=audio_bytes,
                ContentType="audio/wav",
            )
            uploaded_keys.append(audio_key)

            if (
                request.avatar is not None
                and avatar_data is not None
                and avatar_key is not None
            ):
                await asyncio.to_thread(
                    self.s3_client.put_object,
                    Bucket=settings.BUCKET_NAME,
                    Key=avatar_key,
                    Body=avatar_data[0],
                    ContentType=request.avatar.content_type or "application/octet-stream",
                )
                uploaded_keys.append(avatar_key)

            db.add(voice)
            await db.commit()
            await db.refresh(voice)
        except (BotoCoreError, ClientError) as error:
            await db.rollback()
            await self._delete_objects(uploaded_keys)
            logger.exception("Failed to store files for custom voice %s", voice_id)
            raise ServiceUnavailableException("Voice storage is temporarily unavailable") from error
        except Exception:
            await db.rollback()
            await self._delete_objects(uploaded_keys)
            raise

        return self._serialize_voice(voice)



    # Helper functions
    async def _ensure_user(
        self,
        db: AsyncSession,
        user_id: str,
        user_email: str | None,
    ) -> None:
        if await db.get(User, user_id) is not None:
            return
        if not user_email:
            raise ForbiddenException(
                "The authenticated account must have an email before it can create a voice"
            )
        if await db.scalar(select(User.id).where(User.email == user_email)) is not None:
            raise ConflictException(
                "The authenticated email is already linked to a different account"
            )

        db.add(User(id=user_id, email=user_email, hashed_password=None))

    async def _read_wav_file(self, audio: UploadFile) -> bytes:
        if not audio.filename or not audio.filename.lower().endswith(".wav"):
            raise UnprocessableFileException("Upload a WAV audio file")
        if audio.content_type not in ALLOWED_AUDIO_TYPES:
            raise UnprocessableFileException("The uploaded file must have WAV audio content")

        contents = await audio.read(MAX_AUDIO_SIZE_BYTES + 1)
        if len(contents) > MAX_AUDIO_SIZE_BYTES:
            raise UnprocessableFileException("The WAV file must be 25 MB or smaller")
        if len(contents) < 12 or contents[:4] not in (b"RIFF", b"RF64") or contents[8:12] != b"WAVE":
            raise UnprocessableFileException("The uploaded file is not a valid WAV file")
        return contents

    async def _read_avatar_file(self, avatar: UploadFile) -> tuple[bytes, str]:
        avatar_type = AVATAR_TYPES.get(avatar.content_type or "")
        if avatar_type is None or not avatar.filename:
            raise UnprocessableFileException("Upload a PNG, JPG, or WebP avatar image")

        contents = await avatar.read(MAX_AVATAR_SIZE_BYTES + 1)
        if len(contents) > MAX_AVATAR_SIZE_BYTES:
            raise UnprocessableFileException("The avatar image must be 5 MB or smaller")
        if not avatar_type[1](contents):
            raise UnprocessableFileException("The avatar content does not match its image type")
        return contents, avatar_type[0]

    async def _delete_objects(self, object_keys: list[str]) -> None:
        for object_key in object_keys:
            await self._delete_object(object_key)

    async def _delete_object(self, object_key: str) -> None:
        try:
            await asyncio.to_thread(
                self.s3_client.delete_object,
                Bucket=settings.BUCKET_NAME,
                Key=object_key,
            )
        except (BotoCoreError, ClientError):
            logger.exception("Failed to clean up uploaded voice object %s", object_key)

    def _serialize_voice(self, voice: Voice) -> dict[str, Any]:
        return {
            "id": voice.id,
            "user_id": voice.user_id,
            "name": voice.name,
            "description": voice.description,
            "category": voice.category,
            "language": voice.language,
            "variant": voice.variant,
            "status": voice.status,
            "reference_text": voice.reference_text,
            "audio_url": self.s3_client.generate_presigned_url(
                "get_object",
                Params={"Bucket": settings.BUCKET_NAME, "Key": voice.audio_s3_object_key},
                ExpiresIn=PRESIGNED_URL_TTL_SECONDS,
            ),
            "avatar_url": (
                self.s3_client.generate_presigned_url(
                    "get_object",
                    Params={"Bucket": settings.BUCKET_NAME, "Key": voice.avatar_s3_object_key},
                    ExpiresIn=PRESIGNED_URL_TTL_SECONDS,
                )
                if voice.avatar_s3_object_key
                else None
            ),
            "created_at": voice.created_at,
        }
