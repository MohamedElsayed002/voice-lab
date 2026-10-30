from typing import TYPE_CHECKING

from sqlalchemy import Enum as SAEnum
from sqlalchemy import Index, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, generate_random_uuid
from app.schema.voices import VoiceCategory, VoiceVariant

if TYPE_CHECKING:
    from app.models.generations import Generation


class Voice(Base):
    __tablename__ = "voices"
    __table_args__ = (
        UniqueConstraint("org_id", "id", name="uq_voices_org_id_id"),
        Index("ix_voices_org_id", "org_id"),
    )

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=generate_random_uuid,
    )

    # Org is user id
    org_id: Mapped[str] = mapped_column(String(255), nullable=False)
    name: Mapped[str] = mapped_column(String(256), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[VoiceCategory] = mapped_column(
        SAEnum(
            VoiceCategory,
            name="voice_category",
            values_callable=lambda enum: [item.value for item in enum],
        ),
        nullable=False,
        default=VoiceCategory.GENERAL,
        server_default=VoiceCategory.GENERAL.value,
    )
    language: Mapped[str] = mapped_column(
        String(36),
        nullable=False,
        default="en-US",
        server_default="en-US",
    )
    variant: Mapped[VoiceVariant] = mapped_column(
        SAEnum(
            VoiceVariant,
            name="voice_variant",
            values_callable=lambda enum: [item.value for item in enum],
        ),
        nullable=False,
        default=VoiceVariant.SYSTEM,
        server_default=VoiceVariant.SYSTEM.value,
    )
    s3_object_key: Mapped[str] = mapped_column(String(1024), nullable=False)

    generations: Mapped[list["Generation"]] = relationship(
        back_populates="voice",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
