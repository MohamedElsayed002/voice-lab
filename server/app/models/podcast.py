

from sqlalchemy import JSON, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base

class Podcast(Base):
    __tablename__ = "podcasts"

    id: Mapped[str] = mapped_column(String, ForeignKey("generation.id"),primary_key=True)

    title: Mapped[str] = mapped_column(String, nullable=False)
    script: Mapped[dict] = mapped_column(JSON, nullable=False)