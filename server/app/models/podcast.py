

from sqlalchemy import JSON, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base

class Podcast(Base):
    __tablename__ = "podcasts"

    id: Mapped[str] = mapped_column(String, primary_key=True)

    title: Mapped[str] = mapped_column(String, nullable=False)
    script: Mapped[dict] = mapped_column(JSON, nullable=False)
