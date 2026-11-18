
"""
This table is shared by both TTS and podcast generations (via `type`)
because they are the same concept "a request that produced an audio file, with
a status and a storage key" and a podcast's final mix is just another generation.
Podcast-specific data (title, segments) lives in modules/podcasts/models.py and references this
table by id, rather than duplicating these columns
"""

import uuid 
from datetime import datetime, timezone 

from sqlalchemy import JSON, DateTime, String, Text 
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, generate_random_uuid

class Generation(Base):
    __tablename__ = "generation"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=generate_random_uuid)

    type: Mapped[str] = mapped_column(String, nullable=False)

    status: Mapped[str] = mapped_column(String, nullable=False, default="pending")

    provider: Mapped[str] = mapped_column(String, nullable=False)

    input_metadata: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)

    storage_key: Mapped[str | None] = mapped_column(String, nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
