from typing import TYPE_CHECKING

from sqlalchemy import Enum as SAEnum, Float, ForeignKey, ForeignKeyConstraint, Index, Integer, String, Text, and_
from sqlalchemy.orm import Mapped, foreign, mapped_column, relationship

from app.db.base import Base, generate_random_uuid
from app.schema.visibility import VisibilityStatus

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.voice import Voice


class Generation(Base):
    __tablename__ = "generations"
    __table_args__ = (
        ForeignKeyConstraint(
            ["user_id", "voice_id"],
            ["voices.user_id", "voices.id"],
            name="fk_generations_user_voice",
            ondelete="CASCADE",
        ),
        Index("ix_generations_user_id", "user_id"),
        Index("ix_generations_voice_id", "voice_id"),
        Index("ix_generations_status", "status"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_random_uuid)
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    voice_id: Mapped[str] = mapped_column(
        String(36), nullable=False
    )
    text: Mapped[str] = mapped_column(Text, nullable=False)
    voice_name: Mapped[str] = mapped_column(String(256), nullable=False)
    s3_object_key: Mapped[str] = mapped_column(String(1024), nullable=False)
    temperature: Mapped[float] = mapped_column(Float, nullable=False)
    top_p: Mapped[float] = mapped_column(Float, nullable=False)
    top_k: Mapped[int] = mapped_column(Integer, nullable=False)
    repetition_penalty: Mapped[float] = mapped_column(Float, nullable=False)
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

    user: Mapped["User"] = relationship(back_populates="generations")
    voice: Mapped["Voice"] = relationship(
        "app.models.voice.Voice",
        back_populates="generations",
        primaryjoin=lambda: _generation_voice_join(),
    )


def _generation_voice_join():
    from app.models.voice import Voice

    return and_(
        Voice.user_id == Generation.user_id,
        Voice.id == foreign(Generation.voice_id),
    )
