from typing import Any

from pydantic import BaseModel, Field
from app.schema.visibility import VisibilityStatus

class GenerationRequest(BaseModel):
    text: str = Field(..., min_length=1)
    voice_id: str = "default"
    language: str = "en"
    metadata: dict[str, Any] = Field(default_factory=dict)

class GenerationResponse(BaseModel):
    audio_url: str


class GenerationHistoryItem(BaseModel):
    id: str
    voice_id: str
    voice_name: str
    text: str
    audio_url: str | None
    temperature: float
    top_p: float
    top_k: int
    repetition_penalty: float
    status: VisibilityStatus


class GenerationHistoryResponse(BaseModel):
    items: list[GenerationHistoryItem]
