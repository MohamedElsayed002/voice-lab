from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, generate_random_uuid

if TYPE_CHECKING:
    from app.models.user import User


class AuthAccount(Base):
    __tablename__ = "auth_accounts"
    __table_args__ = (
        UniqueConstraint("provider", "provider_user_id", name="uq_auth_accounts_provider_subject"),
        UniqueConstraint("user_id", "provider", name="uq_auth_accounts_user_provider"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_random_uuid)
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    provider: Mapped[str] = mapped_column(String(50), nullable=False)
    provider_user_id: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(256), nullable=False)

    user: Mapped["User"] = relationship(back_populates="auth_accounts")
