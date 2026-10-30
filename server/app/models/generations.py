from typing import TYPE_CHECKING

from sqlalchemy import Float, ForeignKeyConstraint, Index, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, generate_random_uuid

if TYPE_CHECKING:
    from app.models.voice import Voice


class Generation(Base):
    __tablename__ = "generations"
    __table_args__ = (
        ForeignKeyConstraint(
            ["org_id", "voice_id"],
            ["voices.org_id", "voices.id"],
            name="fk_generations_org_voice",
            ondelete="CASCADE",
        ),
        Index("ix_generations_org_id_voice_id", "org_id", "voice_id"),
    )

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=generate_random_uuid,
    )
    org_id: Mapped[str] = mapped_column(String(255), nullable=False)
    voice_id: Mapped[str] = mapped_column(String(36), nullable=False)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    voice_name: Mapped[str] = mapped_column(String(256), nullable=False)
    s3_object_key: Mapped[str] = mapped_column(String(1024), nullable=False)
    temperature: Mapped[float] = mapped_column(Float, nullable=False)
    top_p: Mapped[float] = mapped_column(Float, nullable=False)
    top_k: Mapped[int] = mapped_column(Integer, nullable=False)
    repetition_penalty: Mapped[float] = mapped_column(Float, nullable=False)

    voice: Mapped["Voice"] = relationship(back_populates="generations")
