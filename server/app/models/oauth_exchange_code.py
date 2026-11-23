from datetime import datetime
from typing import TYPE_CHECKING


from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, generate_random_uuid

if TYPE_CHECKING:
    from app.models.user import User


class OAuthExchangeCode(Base):

    __tablename__ = "oauth_exchange_codes"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=generate_random_uuid,
    )
    user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    code_hash: Mapped[str] = mapped_column(
        String(64),
        unique=True,
        nullable=False,
    )
    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )
    used_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    user: Mapped["User"] = relationship()
