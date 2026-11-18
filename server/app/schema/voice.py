from dataclasses import dataclass
from datetime import datetime

from fastapi import UploadFile
from pydantic import BaseModel, ConfigDict, Field

from app.schema.visibility import VisibilityStatus
from app.schema.voices import VoiceCategory, VoiceVariant


class VoiceCreateFields(BaseModel):
    name: str = Field(min_length=1, max_length=256)
    description: str = Field(default="", max_length=4000)
    category: VoiceCategory = VoiceCategory.GENERAL
    language: str = Field(default="en", min_length=2, max_length=36)
    status: VisibilityStatus = VisibilityStatus.PRIVATE
    reference_text: str = Field(min_length=1, max_length=4000)


@dataclass(frozen=True)
class VoiceCreateRequest:
    fields: VoiceCreateFields
    audio: UploadFile
    avatar: UploadFile | None = None


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
    reference_text: str | None
    audio_url: str
    avatar_url: str | None
    created_at: datetime


class Voice(BaseModel):
    id: str 
    name: str 
    provider: str 
    reference_audio_path: str | None 
    language: str 
    is_default: bool = False