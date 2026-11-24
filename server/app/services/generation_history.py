from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.storage import create_s3_client
from app.models.generations import Generation


class GenerationHistoryService:
    def __init__(self, db: AsyncSession, s3_client: Any | None = None) -> None:
        self.db = db
        self.s3_client = s3_client or create_s3_client()

    async def get_user_generation_history(self, user_id: str) -> list[dict[str, Any]]:
        result = await self.db.execute(
            select(Generation).where(Generation.user_id == user_id)
        )
        return [self._serialize(record) for record in result.scalars().all()]

    def _serialize(self, record: Generation) -> dict[str, Any]:
        audio_url = None
        if record.s3_object_key:
            audio_url = self.s3_client.generate_presigned_url(
                "get_object",
                Params={"Bucket": settings.BUCKET_NAME, "Key": record.s3_object_key},
                ExpiresIn=60 * 60,
            )

        return {
            "id": record.id,
            "voice_id": record.voice_id,
            "voice_name": record.voice_name,
            "text": record.text,
            "audio_url": audio_url,
            "temperature": record.temperature,
            "top_p": record.top_p,
            "top_k": record.top_k,
            "repetition_penalty": record.repetition_penalty,
            "status": record.status,
        }
