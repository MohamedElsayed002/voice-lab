from typing import TYPE_CHECKING

from sqlalchemy import Enum as SAEnum, ForeignKey, Index, String, Text, UniqueConstraint, and_
from sqlalchemy.orm import Mapped, foreign, mapped_column, relationship

from app.db.base import Base, generate_random_uuid
from app.schema.voices import VoiceCategory, VoiceVariant
from app.schema.visibility import VisibilityStatus

if TYPE_CHECKING:
    from app.models.generations import Generation
    from app.models.user import User


class Voice(Base):
    __tablename__ = "voices"
    __table_args__ = (
        UniqueConstraint("user_id", "id", name="uq_voices_user_id_id"),
        Index("ix_voices_user_id", "user_id"),
        Index("ix_voices_status", "status"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_random_uuid)
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )

    name: Mapped[str] = mapped_column(String(256), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[VoiceCategory] = mapped_column(
        SAEnum(VoiceCategory, name="voice_category", values_callable=lambda enum: [item.value for item in enum]),
        nullable=False,
        default=VoiceCategory.GENERAL,
        server_default=VoiceCategory.GENERAL.value,
    )
    language: Mapped[str] = mapped_column(String(36), nullable=False, default="en-US", server_default="en-US")
    variant: Mapped[VoiceVariant] = mapped_column(
        SAEnum(VoiceVariant, name="voice_variant", values_callable=lambda enum: [item.value for item in enum]),
        nullable=False,
        default=VoiceVariant.SYSTEM,
        server_default=VoiceVariant.SYSTEM.value,
    )
    status: Mapped[VisibilityStatus] = mapped_column(
        SAEnum(
            VisibilityStatus,
            name="visibility_status",
            values_callable=lambda enum: [item.value for item in enum],
        ),
        nullable=False,
        default=VisibilityStatus.PRIVATE,
        server_default=VisibilityStatus.PRIVATE.value,
    )
    audio_s3_object_key: Mapped[str] = mapped_column(String(1024), nullable=False)
    avatar_s3_object_key: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    reference_text: Mapped[str | None] = mapped_column(Text, nullable=True)

    user: Mapped["User"] = relationship(back_populates="voices")
    generations: Mapped[list["Generation"]] = relationship(
        "app.models.generations.Generation",
        back_populates="voice",
        primaryjoin=lambda: _generation_voice_join(),
    )


def _generation_voice_join():
    from app.models.generations import Generation

    return and_(
        Voice.user_id == Generation.user_id,
        Voice.id == foreign(Generation.voice_id),
    )
