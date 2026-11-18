from enum import Enum
from typing import TYPE_CHECKING

from sqlalchemy import Enum as SAEnum, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, generate_random_uuid

if TYPE_CHECKING:
    from app.models.audit_log import AuditLog
    from app.models.generations import Generation
    from app.models.voice import Voice


class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_random_uuid)
    email: Mapped[str] = mapped_column(String(256), unique=True, nullable=False, index=True)
    username: Mapped[str | None] = mapped_column(String(50), unique=True, index=True, nullable=True)
    hashed_password: Mapped[str | None] = mapped_column(String(256), nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    role: Mapped[UserRole] = mapped_column(
        SAEnum(UserRole, name="user_role", values_callable=lambda enum: [item.value for item in enum]),
        default=UserRole.USER,
        server_default=UserRole.USER.value,
        nullable=False,
    )

    voices: Mapped[list["Voice"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    generations: Mapped[list["Generation"]] = relationship(
        "app.models.generations.Generation",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    audit_logs: Mapped[list["AuditLog"]] = relationship(back_populates="user")
