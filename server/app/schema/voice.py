from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.schema.visibility import VisibilityStatus
from app.schema.voices import VoiceCategory, VoiceVariant


class VoiceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    name: str
    description: str
    category: VoiceCategory
    language: str
    variant: VoiceVariant
    status: VisibilityStatus
    audio_url: str
    created_at: datetime


class Voice(BaseModel):
    id: str 
    name: str 
    provider: str 
    reference_audio_path: str | None 
    language: str 
    is_default: bool = False